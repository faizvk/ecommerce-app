import api from "./api";

export const getActiveOffers = () => api.get("/offer/active");
export const adminGetOffers = () => api.get("/offer");
export const adminCreateOffer = (data) => api.post("/offer", data);
export const adminUpdateOffer = (id, data) => api.put(`/offer/${id}`, data);
export const adminDeleteOffer = (id) => api.delete(`/offer/${id}`);
