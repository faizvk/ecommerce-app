import Razorpay from "razorpay";
import crypto from "crypto";
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
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);

    return res.status(201).json({
      success: true,
      order,
      key: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

/* VERIFY RAZORPAY PAYMENT SIGNATURE */
export const verifyPayment = (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        verified: false,
        message: "Payment signature mismatch — possible tampering",
      });
    }

    return res.status(200).json({ verified: true });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({ message: "Payment verification failed" });
  }
};
