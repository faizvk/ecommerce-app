// controller/payment.controller.js
import Razorpay from "razorpay";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/env.js";

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/* CREATE RAZORPAY ORDER */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);

    return res.status(201).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};
