import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Optional: fetch user from DB to verify still exists
    const result = await pool.query("SELECT id, name, email, role FROM users WHERE id=$1", [decoded.id]);
    if (result.rows.length === 0) return res.status(401).json({ message: "User not found" });

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token", error: err.message });
  }
};
