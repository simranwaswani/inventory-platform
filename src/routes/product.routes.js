// src/routes/product.routes.js
import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/role.js";
import * as productController from "../controllers/product.controller.js";

const router = express.Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Admin routes
router.post("/", authenticate, authorize(["admin"]), productController.createProduct);
router.put("/:id", authenticate, authorize(["admin"]), productController.updateProduct);
router.delete("/:id", authenticate, authorize(["admin"]), productController.deleteProduct);

export default router;
