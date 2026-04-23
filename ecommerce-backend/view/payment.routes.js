import express from "express";
import { createPaymentOrder, verifyPayment } from "../controller/payment.controller.js";
import { verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/payment/create-order", verifyToken, createPaymentOrder);
router.post("/payment/verify", verifyToken, verifyPayment);

export default router;
