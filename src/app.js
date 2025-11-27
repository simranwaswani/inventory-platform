import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
//import systemRoutes from "./routes/system.routes.js";


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limit login only
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
app.use("/auth/login", limiter);

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
//app.use("/system", systemRoutes);

export default app;
