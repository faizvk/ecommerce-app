import { ERROR_CODES } from "../constants/index.js";

/**
 * Throw this for any expected error that should produce a structured response.
 *
 *   throw new AppError(404, ERROR_CODES.NOT_FOUND, "Product not found");
 *
 * Unhandled / unknown errors are caught by the global error handler and turned
 * into a generic 500 with `INTERNAL_ERROR`.
 */
export class AppError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code || ERROR_CODES.INTERNAL;
    this.details = details;
    this.expose = true;
  }
}

export default AppError;
