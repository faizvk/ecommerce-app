// controller/order.controller.js
import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Order from "../model/order.model.js";

const isValid = (id) => mongoose.Types.ObjectId.isValid(id);

const validStatus = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/* PLACE ORDER */
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.id;

    if (!shippingAddress)
      return res.status(400).json({ message: "Shipping address is required" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "No cart exists" });

    if (cart.products.length === 0)
      return res.status(400).json({ message: "No products in cart" });

    const order = await Order.create({
      userId,
      items: cart.products,
      totalAmount: cart.totalAmount,
      shippingAddress,
      status: "pending",
    });

    // Clear cart
    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
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
