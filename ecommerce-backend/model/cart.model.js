import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
