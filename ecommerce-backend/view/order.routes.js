// routes/order.view.js
import express from "express";
import { verifyToken } from "../auth/auth.middleware.js";
import AutherizeRole from "../auth/role.middleware.js";

import {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  adminGetAllOrders,
  adminUpdateOrderStatus,
} from "../controller/order.controller.js";

const router = express.Router();

// User routes
router.post("/order/place", verifyToken, AutherizeRole("user"), placeOrder);
router.get("/orders", verifyToken, AutherizeRole("user"), getUserOrders);
router.get("/order/:id", verifyToken, getOrderById);
router.put("/order/cancel/:id", verifyToken, cancelOrder);

// Admin routes
router.get(
  "/admin/orders",
  verifyToken,
  AutherizeRole("admin"),
  adminGetAllOrders
);

router.put(
  "/admin/order/status/:id",
  verifyToken,
  AutherizeRole("admin"),
  adminUpdateOrderStatus
);

export default router;
