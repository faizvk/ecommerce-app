import pino from "pino";
import { LOG_LEVEL, NODE_ENV } from "./env.js";

const isDev = NODE_ENV !== "production";

/**
 * Structured JSON logger for production (one-line JSON per event so log
 * aggregators can ingest it). In dev we use pino-pretty for readability.
 */
const logger = pino({
  level: LOG_LEVEL || (isDev ? "debug" : "info"),
  base: { service: "nexkart-backend" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.newPassword",
      "*.oldPassword",
      "*.razorpay_signature",
    ],
    remove: true,
  },
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname,service",
      },
    },
  }),
});

export default logger;
