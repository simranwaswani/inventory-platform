import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventory_db",
  password: "Radhe0909*",
  port: 5432
});
