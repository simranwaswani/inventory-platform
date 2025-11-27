import { pool } from "../db/pool.js";
import { orderQueue } from "../jobs/order.queue.js";

export const create = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const { items } = req.body;
    let total_amount = 0;
    const productDetails = [];

    // Check stock and calculate total with SELECT FOR UPDATE (row-level locking)
    for (const item of items) {
      const result = await client.query(
        "SELECT id, price, stock FROM products WHERE id=$1 FOR UPDATE",
        [item.product_id]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: `Product with ID ${item.product_id} not found` });
      }

      const product = result.rows[0];
      
      if (product.stock < item.qty) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({
            message: `Insufficient stock for product ${product.id}. Available: ${product.stock}, Requested: ${item.qty}`,
          });
      }

      productDetails.push({ ...product, qty: item.qty });
      total_amount += Number(product.price) * item.qty;
    }

    // Insert order
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING *",
      [req.user.id, total_amount]
    );
    const orderId = orderResult.rows[0].id;

    // Insert order items and deduct stock atomically
    for (const item of productDetails) {
      // Insert order item with price (store price at time of order)
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.id, item.qty, item.price]
      );

      // Deduct stock
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.qty, item.id]
      );
    }

    await client.query("COMMIT");

    // Push job to queue (outside transaction)
    await orderQueue.add("generateInvoice", {
      orderId,
      userEmail: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Order created and job queued",
      order: orderResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getAll = async (req, res) => {
  try {
    const orders = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json({ orders: orders.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMine = async (req, res) => {
  try {
    const orders = await pool.query(
      "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ orders: orders.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Check if order exists and user has access
    const orderResult = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 ${!isAdmin ? "AND o.user_id = $2" : ""}`,
      isAdmin ? [id] : [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderResult.rows[0];

    // Get order items with product details
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name, p.price as product_price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      order: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
