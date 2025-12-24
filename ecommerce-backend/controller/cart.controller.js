// controller/cart.controller.js
import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

const isValid = (id) => mongoose.Types.ObjectId.isValid(id);

const calculateTotal = (cart) => {
  cart.totalAmount = cart.products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

/* GET CART */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.status(404).json({ message: "No cart exists" });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

/* UPDATE CART ITEM */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, action, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });

    if (!isValid(productId))
      return res.status(400).json({ message: "Invalid product ID" });

    if (!["add", "increase", "decrease", "remove"].includes(action)) {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, products: [], totalAmount: 0 });

    const index = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    const item = cart.products[index];

    if (action === "add") {
      if (!item) {
        if (quantity > product.stock)
          return res.status(400).json({
            message: `Only ${product.stock} units available`,
          });

        cart.products.push({
          productId,
          price: product.salePrice,
          quantity,
        });
      } else {
        if (item.quantity + quantity > product.stock)
          return res.status(400).json({
            message: `Only ${product.stock} units available`,
          });

        item.quantity += quantity;
      }
    } else if (action === "increase") {
      if (!item)
        return res.status(404).json({ message: "Product not in cart" });

      if (item.quantity >= product.stock)
        return res.status(400).json({
          message: "No more stock available",
        });

      item.quantity += 1;
    } else if (action === "decrease") {
      if (!item)
        return res.status(404).json({ message: "Product not in cart" });

      if (item.quantity <= 1) {
        cart.products.splice(index, 1);
      } else {
        item.quantity -= 1;
      }
    } else if (action === "remove") {
      if (!item)
        return res.status(404).json({ message: "Product not in cart" });

      cart.products.splice(index, 1);
    }

    calculateTotal(cart);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      "products.productId"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populated,
    });
  } catch (err) {
    res.status(500).json({
      message: "Cart update failed",
      error: err.message,
    });
  }
};
