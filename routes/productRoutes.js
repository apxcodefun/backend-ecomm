import express from "express";
import {
  protectedMiddleware,
  adminMiddleware,
} from "./../middleware/authMiddleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  allProduct,
  fileUpload,
} from "./../controllers/product.js";
import { upload } from "./../utils/uploadFileHandler.js";

const router = express.Router();

// CRUD product data
// Create Method Post
router.post("/", protectedMiddleware, adminMiddleware, createProduct);
// Read Product
router.get("/", allProduct);
// Update Product
router.put("/:id", protectedMiddleware, adminMiddleware, updateProduct);
// Delete Product
router.delete("/:id", protectedMiddleware, adminMiddleware, deleteProduct);
// Get Product
router.get("/:id", getProduct);
// File Upload
router.post(
  "/upload",
  protectedMiddleware,
  adminMiddleware,
  upload.single("image"),
  fileUpload
);

export default router;
