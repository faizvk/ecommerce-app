import api from "./api";

/* AUTH */
export const signup = (data) => api.post("/signup", data);
export const login = (data) => api.post("/login", data);
export const logout = () => api.post("/logout", { withCredentials: true });
export const refreshAccessToken = () => api.post("/refresh");

/* PROFILE */
export const getProfile = () => api.get("/me");
export const updateProfile = (data) => api.put("/me", data);
export const updatePassword = (data) => api.put("/update-password", data);

/* ADMIN */
export const getAllUsers = () => api.get("/all");
export const updateUserRole = (id, role) =>
  api.put(`/updateRole/${id}`, { role });
