import express from "express";
import {
  createOrder,
  allOrder,
  detailOrder,
  currentOrder,
  callbackPayment,
} from "../controllers/order.js";
import {
  protectedMiddleware,
  adminMiddleware,
} from "./../middleware/authMiddleware.js";

const router = express.Router();

// Create Order
router.post("/", protectedMiddleware, adminMiddleware, createOrder);

// All Order
router.get("/", protectedMiddleware, adminMiddleware, allOrder);

// Detail Order
router.get("/:id", protectedMiddleware, adminMiddleware, detailOrder);

router.post("/callback", callbackPayment);

router.get("/current/user", protectedMiddleware, currentOrder);

export default router;
