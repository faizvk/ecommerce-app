import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
