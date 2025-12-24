// routes/product.view.js
import express from "express";
import { verifyToken } from "../auth/auth.middleware.js";
import AutherizeRole from "../auth/role.middleware.js";

import {
  createProduct,
  searchProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";

const router = express.Router();

router.post("/product", verifyToken, AutherizeRole("admin"), createProduct);
router.get("/product/search", searchProducts);
router.get("/product", getProducts);
router.get("/product/:id", getProductById);
router.put("/product/:id", verifyToken, AutherizeRole("admin"), updateProduct);
router.delete(
  "/product/:id",
  verifyToken,
  AutherizeRole("admin"),
  deleteProduct
);

export default router;
