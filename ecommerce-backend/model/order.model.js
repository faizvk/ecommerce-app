import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    paymentId: {
      type: String,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // allow multiple null values; uniqueness only when set
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    // Internal admin notes — visible only in the admin panel, never shown to
    // the customer. Each entry stamps the author and timestamp so the audit
    // trail is preserved without a separate collection.
    adminNotes: [
      {
        text: { type: String, required: true, trim: true, maxlength: 1000 },
        author: { type: String, default: "" }, // admin email or name snapshot
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
