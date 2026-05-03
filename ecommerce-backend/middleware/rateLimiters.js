import rateLimit from "express-rate-limit";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Per-route rate limiters. The global limiter is intentionally generous;
 * sensitive endpoints get tighter buckets.
 */

const json = (message) => ({
  success: false,
  error: { code: ERROR_CODES.RATE_LIMITED, message },
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many requests, please try again later"),
});

// Auth — login/signup/forgot-password.
// 10 attempts / 10 min per IP. Tight enough to discourage brute force,
// loose enough that a real user fixing typos isn't locked out.
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many auth attempts. Please wait a few minutes and retry"),
});

// Payment — create-order / verify. 30 / 15 min per IP.
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many payment attempts. Please wait and retry"),
});

// Forgot-password specifically — extra-tight to prevent email-spam attacks.
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many password reset requests. Please try again in an hour"),
});

// AI endpoints — calls cost money and provider quotas are limited.
// 30 / 5 min per IP keeps a real shopper unblocked while throttling abuse.
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("AI assistant is busy. Please wait a moment and retry"),
});
