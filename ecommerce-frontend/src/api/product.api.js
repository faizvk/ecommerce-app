import api from "./api";

// USER + ADMIN
export const getProducts = () => api.get("/product");
export const getProduct = (id) => api.get(`/product/${id}`);
export const searchProducts = (params) =>
  api.get("/product/search", { params });

// ADMIN
export const adminAddProduct = (data) => api.post("/product", data);
export const adminUpdateProduct = (id, data) => api.put(`/product/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/product/${id}`);

export const updateStock = (productId, stock) =>
  api.put(`/product/${productId}`, { stock });
