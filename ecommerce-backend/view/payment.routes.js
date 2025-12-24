// routes/payment.view.js
import express from "express";
import dotenv from "dotenv";
import { createPaymentOrder } from "../controller/payment.controller.js";

dotenv.config();

const router = express.Router();

router.post("/payment/create-order", createPaymentOrder);

export default router;
