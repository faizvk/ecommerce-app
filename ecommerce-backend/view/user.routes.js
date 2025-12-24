// routes/user.view.js
import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  updatePassword,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
} from "../controller/user.controller.js";

import { verifyToken, verifyRefreshToken } from "../auth/auth.middleware.js";

import AutherizeRole from "../auth/role.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/refresh", verifyRefreshToken, refreshToken);

router.post("/logout", logout);

router.put("/update-password", verifyToken, updatePassword);

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);

router.get("/all", verifyToken, AutherizeRole("admin"), getAllUsers);

router.put(
  "/updateRole/:id",
  verifyToken,
  AutherizeRole("admin"),
  updateUserRole
);

export default router;
