import api from "./api";

/* ---------------- ADD ITEM ---------------- */
export const addToCart = (productId, quantity = 1) =>
  api.patch("/cart/item", {
    productId,
    action: "add",
    quantity,
  });

/* ---------------- GET CART ---------------- */
export const getCart = async () => {
  try {
    return await api.get("/cart");
  } catch (err) {
    // 🟢 Cart not created yet → treat as empty cart
    if (err.response?.status === 404) {
      return {
        data: {
          cart: {
            products: [],
            totalAmount: 0,
          },
        },
      };
    }
    throw err;
  }
};

/* ---------------- REMOVE ITEM ---------------- */
export const removeFromCart = (productId) =>
  api.patch("/cart/item", {
    productId,
    action: "remove",
  });

/* ---------------- INCREASE QTY ---------------- */
export const increaseQty = (productId) =>
  api.patch("/cart/item", {
    productId,
    action: "increase",
  });

/* ---------------- DECREASE QTY ---------------- */
export const decreaseQty = (productId) =>
  api.patch("/cart/item", {
    productId,
    action: "decrease",
  });
