import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { pool } from "./db/pool.js";
import "./jobs/order.worker.js"; // Start the BullMQ worker

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Order worker started");
    });
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
}

start();
