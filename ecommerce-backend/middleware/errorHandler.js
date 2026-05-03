import { ERROR_CODES } from "../constants/index.js";
import logger from "../config/logger.js";

/**
 * Express error handler — last middleware in the chain. Produces a uniform
 * envelope for every error response:
 *
 *   { success: false, error: { code, message, details? }, requestId }
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const requestId = req.id;

  // Mongoose validation
  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION,
        message: "One or more fields are invalid",
        details: Object.fromEntries(
          Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
        ),
      },
      requestId,
    });
  }

  // Mongoose duplicate key
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: `${field} already exists`,
      },
      requestId,
    });
  }

  // Our own AppError
  if (err?.expose && err?.status) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code || ERROR_CODES.INTERNAL,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      requestId,
    });
  }

  // Anything else — treat as 500 and log the full stack
  logger.error({ err, requestId, path: req.originalUrl }, "Unhandled error");

  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL,
      message: "Something went wrong on our end",
    },
    requestId,
  });
}

export default errorHandler;
