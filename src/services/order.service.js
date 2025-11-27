import { pool } from "../db/pool.js";

export const createOrder = async ({ userId, products }) => {
  // Insert order
  const orderResult = await pool.query(
    "INSERT INTO orders(user_id) VALUES($1) RETURNING id, user_id, created_at",
    [userId]
  );

  const orderId = orderResult.rows[0].id;

  // Insert ordered products
  for (const item of products) {
    await pool.query(
      "INSERT INTO order_items(order_id, product_id, quantity) VALUES($1, $2, $3)",
      [orderId, item.productId, item.quantity]
    );
  }

  return orderResult.rows[0];
};

export const getAllOrders = async () => {
  const result = await pool.query(`
    SELECT 
      o.id, 
      o.user_id, 
      o.created_at,
      json_agg(
        json_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity
        )
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.id DESC
  `);

  return result.rows;
};

export const getUserOrders = async (userId) => {
  const result = await pool.query(`
    SELECT 
      o.id, 
      o.user_id, 
      o.created_at,
      json_agg(
        json_build_object(
          'product_id', oi.product_id,
          'quantity', oi.quantity
        )
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.id DESC
  `, [userId]);

  return result.rows;
};
