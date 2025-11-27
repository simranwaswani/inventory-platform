import { Worker } from "bullmq";
import IORedis from "ioredis";
import fs from "fs-extra";
import { pool } from "../db/pool.js";
import { logger } from "../config/logger.js";

// Redis connection
const connection = new IORedis({
  host: process.env.BULLMQ_HOST || "127.0.0.1",
  port: process.env.BULLMQ_PORT || 6379,
  maxRetriesPerRequest: null,   // <-- IMPORTANT
});

const worker = new Worker(
  "orderQueue",
  async job => {
    const { orderId, userEmail, timestamp } = job.data;
    logger.info(`Processing order ${orderId} for ${userEmail}`);

    try {
      // Fetch order with user details and items with product info
      const orderRes = await pool.query(
        `SELECT 
          o.id as order_id,
          o.user_id,
          o.total_amount,
          o.created_at as order_date,
          u.name as user_name,
          u.email as user_email,
          json_agg(
            json_build_object(
              'product_id', p.id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', p.price,
              'subtotal', (oi.quantity * p.price)
            )
          ) AS items
         FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.id = $1
         GROUP BY o.id, o.user_id, o.total_amount, o.created_at, u.name, u.email`,
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        logger.error(`Order ${orderId} not found`);
        throw new Error(`Order ${orderId} not found`);
      }

      const order = orderRes.rows[0];

      // Create invoice object
      const invoice = {
        invoice_id: `INV-${orderId}`,
        order_id: order.order_id,
        generated_at: timestamp || new Date().toISOString(),
        customer: {
          user_id: order.user_id,
          name: order.user_name,
          email: order.user_email,
        },
        order_date: order.order_date,
        items: order.items,
        total_amount: parseFloat(order.total_amount),
      };

      // Ensure invoices directory exists and write invoice
      const invoicePath = `./src/invoices/order_${orderId}.json`;
      await fs.ensureDir("./src/invoices");
      await fs.writeJson(invoicePath, invoice, { spaces: 2 });
      
      logger.info(`Invoice generated at ${invoicePath}`);
      return invoice;
    } catch (error) {
      logger.error(` Error processing order ${orderId}: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

worker.on("completed", job => logger.info(`Job ${job.id} completed`));
worker.on("failed", (job, err) => logger.error(`Job ${job.id} failed: ${err.message}`));
