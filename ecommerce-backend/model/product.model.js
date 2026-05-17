import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
        // The whole storefront treats costPrice as MRP (list/struck-through)
        // and salePrice as the customer-facing discounted price. Sale must
        // therefore be <= cost. Equal is allowed (no discount).
        validator: function (value) {
          return value <= this.costPrice;
        },
        message: "Sale price cannot exceed cost (MRP) price",
      },
    },
    category: {
      type: String,
      enum: [
        // Current canonical set — surfaced in the UI nav and admin form.
        "electronics",
        "fashion",
        "home",
        "beauty",
        "sports",
        "books",
        "grocery",
        // Deprecated values — kept here so historical seed data continues to
        // validate. Admin re-classification will eventually drain these.
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
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
