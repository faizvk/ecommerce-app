import api from "./api";

export const addToCart = (productId, quantity = 1) =>
  api.patch("/cart/item", {
    productId,
    action: "add",
    quantity,
  });

export const getCart = () => api.get("/cart");

export const removeFromCart = (productId) =>
  api.patch("/cart/item", {
    productId,
    action: "remove",
  });

export const increaseQty = (productId) =>
  api.patch("/cart/item", {
    productId,
    action: "increase",
  });

export const decreaseQty = (productId) =>
  api.patch("/cart/item", {
    productId,
    action: "decrease",
  });
