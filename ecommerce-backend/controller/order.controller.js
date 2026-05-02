// controller/order.controller.js
import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Order from "../model/order.model.js";
import User from "../model/user.model.js";
import Product from "../model/product.model.js";
import { invalidateProductCache } from "../utils/productCache.js";

const isValid = (id) => mongoose.Types.ObjectId.isValid(id);

import { validStatus } from "../utils/validStatus.js";

/* ────────────────────────────────────────────────────────────
 * PLACE ORDER
 *
 * Hardened:
 *   - Idempotent: if an Order with this razorpayOrderId already exists,
 *     return it (handles double-click / network retry without dup orders).
 *   - Atomically reserves stock per item with a conditional updateOne
 *     (stock >= quantity). If any item fails, rolls back prior decrements.
 *   - Filters out cart items whose product was deleted/marked inactive.
 *   - Validates profile completion (defense in depth).
 * ──────────────────────────────────────────────────────────── */
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, razorpayPaymentId, razorpayOrderId } = req.body;
    const userId = req.user.id;

    if (!shippingAddress) return res.status(400).json({ message: "Shipping address is required" });
    if (!razorpayPaymentId || !razorpayOrderId)
      return res.status(400).json({ message: "Payment details are required" });

    /* 1. Idempotency — return existing order for this razorpay order id */
    const existing = await Order.findOne({ razorpayOrderId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Order already placed",
        order: existing,
        idempotent: true,
      });
    }

    /* 2. Profile completion */
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isProfileComplete()) {
      return res.status(403).json({
        code: "PROFILE_INCOMPLETE",
        message: "Please complete your profile before checkout",
      });
    }

    /* 3. Fetch cart with populated products */
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    /* 4. Filter valid items + collect stock requirements */
    const validItems = [];
    for (const item of cart.products) {
      const p = item.productId;
      if (!p || p.deleted) continue; // silently drop stale references
      validItems.push(item);
    }

    if (validItems.length === 0)
      return res.status(400).json({ message: "All items in your cart are no longer available" });

    /* 5. Atomically reserve stock — conditional decrement per product.
          If any updateOne does not match (stock < quantity), roll back. */
    const reserved = [];
    try {
      for (const item of validItems) {
        const result = await Product.updateOne(
          { _id: item.productId._id, stock: { $gte: item.quantity }, deleted: { $ne: true } },
          { $inc: { stock: -item.quantity } }
        );
        if (result.matchedCount === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.productId.name}`);
        }
        reserved.push(item);
      }
    } catch (err) {
      // Rollback — return previously decremented stock
      await Promise.all(
        reserved.map((item) =>
          Product.updateOne(
            { _id: item.productId._id },
            { $inc: { stock: item.quantity } }
          )
        )
      );
      const productName = String(err.message).split(":")[1] || "an item";
      return res.status(409).json({
        code: "INSUFFICIENT_STOCK",
        message: `Sorry — ${productName} sold out while you were checking out.`,
      });
    }

    /* 6. Compute total from valid items (don't trust cart.totalAmount which
          may be stale if stale items were filtered). */
    const computedTotal = validItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    /* 7. Create the order */
    let order;
    try {
      order = await Order.create({
        userId,
        items: validItems.map((it) => ({
          productId: it.productId._id,
          quantity: it.quantity,
          price: it.price,
        })),
        totalAmount: computedTotal,
        shippingAddress,
        status: "pending",
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        paymentStatus: "paid",
      });
    } catch (err) {
      // If duplicate key (race on idempotency), fetch the existing order
      if (err.code === 11000) {
        const existingDup = await Order.findOne({ razorpayOrderId });
        if (existingDup) {
          // Roll back our stock reservation since the original placeOrder won
          await Promise.all(
            validItems.map((it) =>
              Product.updateOne(
                { _id: it.productId._id },
                { $inc: { stock: it.quantity } }
              )
            )
          );
          return res.status(200).json({
            success: true,
            message: "Order already placed",
            order: existingDup,
            idempotent: true,
          });
        }
      }
      // Other failure — rollback stock and re-throw
      await Promise.all(
        validItems.map((it) =>
          Product.updateOne(
            { _id: it.productId._id },
            { $inc: { stock: it.quantity } }
          )
        )
      );
      throw err;
    }

    /* 8. Clear cart */
    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();

    /* 9. Invalidate product cache so stock changes propagate to all clients */
    await invalidateProductCache();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("placeOrder failed:", error);
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

/* GET USER ORDERS */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* GET SINGLE ORDER */
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!isValid(orderId))
      return res.status(400).json({ message: "Invalid order ID" });

    let order;

    if (req.user.role === "admin") {
      order = await Order.findById(orderId)
        .populate("userId", "name email")
        .populate("items.productId");
    } else {
      order = await Order.findOne({
        _id: orderId,
        userId: req.user.id,
      }).populate("items.productId");
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/* CANCEL ORDER */
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!isValid(orderId))
      return res.status(400).json({ message: "Invalid order ID" });

    let order;

    if (req.user.role === "admin") {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({
        _id: orderId,
        userId: req.user.id,
      });
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (["shipped", "delivered"].includes(order.status))
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled after shipping" });

    if (order.status === "cancelled")
      return res.status(400).json({ message: "Order already cancelled" });

    order.status = "cancelled";
    await order.save();

    // Restore stock for cancelled orders so inventory stays accurate
    await Promise.all(
      order.items.map((it) =>
        Product.updateOne({ _id: it.productId }, { $inc: { stock: it.quantity } })
      )
    );
    await invalidateProductCache();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/* ADMIN: GET ALL ORDERS */
export const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};

/* ADMIN: UPDATE ORDER STATUS */
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!isValid(orderId))
      return res.status(400).json({ message: "Invalid order ID" });

    if (!validStatus.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("items.productId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};
