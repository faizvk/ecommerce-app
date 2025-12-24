import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    costPrice: {
      type: Number,
      min: 0,
      required: true,
    },

    salePrice: {
      type: Number,
      min: 0,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.costPrice;
        },
        message: "Sale price must be equal or lesser than cost price",
      },
    },
    category: {
      type: String,
      enum: [
        "electronics",
        "fashion",
        "dairy",
        "technology",
        "home appliances",
      ],
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
