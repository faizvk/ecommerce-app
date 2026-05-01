import express from "express";
import { verifyToken } from "../auth/auth.middleware.js";
import AutherizeRole from "../auth/role.middleware.js";

import {
  createOffer,
  getActiveOffers,
  getAllOffers,
  updateOffer,
  deleteOffer,
} from "../controller/offer.controller.js";

const router = express.Router();

// Public — customer-facing
router.get("/offer/active", getActiveOffers);

// Admin
router.get("/offer", verifyToken, AutherizeRole("admin"), getAllOffers);
router.post("/offer", verifyToken, AutherizeRole("admin"), createOffer);
router.put("/offer/:id", verifyToken, AutherizeRole("admin"), updateOffer);
router.delete("/offer/:id", verifyToken, AutherizeRole("admin"), deleteOffer);

export default router;
