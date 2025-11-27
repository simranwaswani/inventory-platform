// src/services/product.service.js
import { pool } from "../db/pool.js";

export const createProduct = async ({ name, description, price, stock }) => {
  const query = `
    INSERT INTO products (name, description, price, stock)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, description, price, stock];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getProducts = async () => {
  const { rows } = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return rows;
};

export const getProductById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
  return rows[0];
};

export const updateProduct = async (id, { name, description, price, stock }) => {
  const query = `
    UPDATE products
    SET name=$1, description=$2, price=$3, stock=$4, updated_at=NOW()
    WHERE id=$5
    RETURNING *;
  `;
  const values = [name, description, price, stock, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteProduct = async (id) => {
  // Check if product exists
  const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
  if (!rows[0]) throw new Error("Product not found");

  // Delete product
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
  return { message: "Product deleted successfully" };
};
