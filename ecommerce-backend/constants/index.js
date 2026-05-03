/**
 * Shared constants used across controllers, models, and middleware.
 * Avoid magic strings — import from here.
 */

export const ROLES = Object.freeze({
  USER:  "user",
  ADMIN: "admin",
});

export const ROLE_VALUES = Object.values(ROLES);

export const ORDER_STATUS = Object.freeze({
  PENDING:    "pending",
  PROCESSING: "processing",
  SHIPPED:    "shipped",
  DELIVERED:  "delivered",
  CANCELLED:  "cancelled",
});

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID:    "paid",
  FAILED:  "failed",
});

export const ERROR_CODES = Object.freeze({
  VALIDATION:           "VALIDATION_ERROR",
  UNAUTHENTICATED:      "UNAUTHENTICATED",
  UNAUTHORIZED:         "UNAUTHORIZED",
  NOT_FOUND:            "NOT_FOUND",
  CONFLICT:             "CONFLICT",
  RATE_LIMITED:         "RATE_LIMITED",
  ACCOUNT_LOCKED:       "ACCOUNT_LOCKED",
  PROFILE_INCOMPLETE:   "PROFILE_INCOMPLETE",
  INSUFFICIENT_STOCK:   "INSUFFICIENT_STOCK",
  STALE_CART:           "STALE_CART",
  GOOGLE_ONLY:          "GOOGLE_ACCOUNT_NO_PASSWORD",
  INTERNAL:             "INTERNAL_ERROR",
});
