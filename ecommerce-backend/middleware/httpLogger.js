import pinoHttp from "pino-http";
import logger from "../config/logger.js";

/**
 * Request/response logging. Inherits the request id we set in requestId.js,
 * so every log line for a request shares the same `req.id`.
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id, // reuse the id we already set
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} → ${res.statusCode} (${err?.message ?? "error"})`,
  serializers: {
    req: (req) => ({ method: req.method, url: req.url, id: req.id }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  // Don't log keepalive ping spam in production
  autoLogging: {
    ignore: (req) => req.url === "/api/health",
  },
});

export default httpLogger;
