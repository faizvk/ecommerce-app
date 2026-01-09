import api from "./api";

/* ===================== AUTH ===================== */

export const signup = (data) => api.post("/signup", data);

export const login = (data) => api.post("/login", data);

/* Google OAuth login */
export const googleLogin = (credential) =>
  api.post("/google", { credential }, { withCredentials: true });

/* Logout (clear refresh cookie server-side) */
export const logout = () =>
  api.post("/logout", null, { withCredentials: true });

/* Refresh access token */
export const refreshAccessToken = () =>
  api.post("/refresh", null, { withCredentials: true });

/* ===================== PROFILE ===================== */

export const getProfile = () => api.get("/me");

export const updateProfile = (data) => api.put("/me", data);

export const updatePassword = (data) => api.put("/update-password", data);

export const setPassword = (data) => api.put("/set-password", data);

/* ===================== ADMIN ===================== */

export const getAllUsers = () => api.get("/all");

export const updateUserRole = (id, role) =>
  api.put(`/updateRole/${id}`, { role });
