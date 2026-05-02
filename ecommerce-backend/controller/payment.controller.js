import Razorpay from "razorpay";
import crypto from "crypto";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/env.js";
import Cart from "../model/cart.model.js";
import User from "../model/user.model.js";

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/* ────────────────────────────────────────────────────────────
 * CREATE RAZORPAY ORDER
 *
 * SECURITY: amount is computed server-side from the user's cart.
 * The request body amount (if any) is ignored — preventing tampering.
 * Pre-flight checks: profile complete, cart not empty, stock available,
 * products not deleted. Avoids the "user pays then order creation fails"
 * trap by rejecting up-front.
 * ──────────────────────────────────────────────────────────── */
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Profile completeness — fail BEFORE creating Razorpay order
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isProfileComplete()) {
      return res.status(403).json({
        code: "PROFILE_INCOMPLETE",
        message: "Please complete your profile before checkout",
      });
    }

    // 2. Cart fetch with populated product details
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 3. Filter valid items + validate stock
    const validItems = [];
    for (const item of cart.products) {
      const p = item.productId;
      if (!p || p.deleted) {
        return res.status(400).json({
          code: "STALE_CART",
          message: `An item in your cart is no longer available. Please refresh your cart.`,
        });
      }
      if (p.stock < item.quantity) {
        return res.status(400).json({
          code: "INSUFFICIENT_STOCK",
          message: `Only ${p.stock} ${p.name} available — please reduce quantity.`,
        });
      }
      validItems.push({ item, product: p });
    }

    // 4. Compute amount server-side (ignore client value)
    const computedAmount = validItems.reduce(
      (sum, { item }) => sum + item.price * item.quantity,
      0
    );

    if (computedAmount <= 0) {
      return res.status(400).json({ message: "Cart total must be greater than zero" });
    }

    // 5. Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: Math.round(computedAmount * 100), // paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    return res.status(201).json({
      success: true,
      order,
      key: RAZORPAY_KEY_ID,
      amount: computedAmount, // echo back so frontend can show what's actually being charged
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

/* ────────────────────────────────────────────────────────────
 * VERIFY RAZORPAY PAYMENT SIGNATURE
 * ──────────────────────────────────────────────────────────── */
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
