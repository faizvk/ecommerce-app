import api from "./api";

/* USER */
export const placeOrder = (shippingAddress, razorpayPaymentId, razorpayOrderId) =>
  api.post("/order/place", { shippingAddress, razorpayPaymentId, razorpayOrderId });

export const getOrders = () => api.get("/orders");

export const trackOrder = (id) => api.get(`/order/${id}`);

export const cancelOrder = (id) => api.put(`/order/cancel/${id}`);

/* ADMIN */
export const adminGetOrders = () => api.get("/admin/orders");

export const adminUpdateOrderStatus = (id, status) =>
  api.put(`/admin/order/status/${id}`, { status });
