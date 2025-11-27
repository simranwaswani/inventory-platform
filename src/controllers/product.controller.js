// src/controllers/product.controller.js
import * as productService from "../services/product.service.js";

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await productService.createProduct({ name, description, price, stock });
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all products
export const getProducts = async (_req, res) => {
  try {
    const products = await productService.getProducts();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
