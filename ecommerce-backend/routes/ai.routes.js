import express from "express";
import { verifyToken } from "../auth/auth.middleware.js";
import { chat, searchTranslate } from "../controller/ai.controller.js";

const router = express.Router();

// Both endpoints require auth — AI calls cost real money and we want
// per-user accountability. Rate limiting is applied at the app level.
router.post("/ai/chat", verifyToken, chat);
router.post("/ai/search-translate", verifyToken, searchTranslate);

export default router;
