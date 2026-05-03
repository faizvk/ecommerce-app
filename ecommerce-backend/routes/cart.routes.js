// routes/cart.view.js
import express from "express";
import { verifyToken } from "../auth/auth.middleware.js";
import AutherizeRole from "../auth/role.middleware.js";

import { getCart, updateCartItem } from "../controller/cart.controller.js";

const router = express.Router();

router.get("/cart", verifyToken, AutherizeRole("user"), getCart);

router.patch("/cart/item", verifyToken, AutherizeRole("user"), updateCartItem);

export default router;
