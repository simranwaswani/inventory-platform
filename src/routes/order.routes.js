import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/role.js";
import { validate, orderSchema } from "../middlewares/validate.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

// Create an order (any logged-in user)
router.post("/", authenticate, validate(orderSchema), orderController.create);

// Get all orders (admin only)
router.get("/", authenticate, authorize(["admin"]), orderController.getAll);

// Get logged-in user's orders
router.get("/mine", authenticate, orderController.getMine);

// Get order by ID with nested items
router.get("/:id", authenticate, orderController.getById);

export default router;
