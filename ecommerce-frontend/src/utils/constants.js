/**
 * Single source of truth for magic strings shared across the frontend.
 * Backend mirrors these in ecommerce-backend/constants/index.js.
 */

export const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
});

export const ERROR_CODES = Object.freeze({
  VALIDATION: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  STALE_CART: "STALE_CART",
  GOOGLE_ONLY: "GOOGLE_ACCOUNT_NO_PASSWORD",
  INTERNAL: "INTERNAL_ERROR",
});

export const PAGE_SIZE = 12;
export const FREE_DELIVERY_THRESHOLD = 499;
