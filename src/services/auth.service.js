import { pool } from "../db/pool.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async ({ name, email, password, role }) => {
  // check if email exists
  const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (existing.rows.length > 0) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING id, name, email, role",
    [name, email, hashed, role || "user"]
  );

  return result.rows[0];
};

export const loginUser = async ({ email, password }) => {
  const result = await pool.query("SELECT id, name, email, password, role FROM users WHERE email=$1", [email]);
  if (result.rows.length === 0) throw new Error("Invalid email or password");

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
};
