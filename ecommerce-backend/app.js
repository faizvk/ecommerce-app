import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import { CLIENT_URL, NODE_ENV } from "./config/env.js";
import requestId from "./middleware/requestId.js";
import httpLogger from "./middleware/httpLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import {
  globalLimiter,
  authLimiter,
  paymentLimiter,
  passwordResetLimiter,
  aiLimiter,
} from "./middleware/rateLimiters.js";
import { ERROR_CODES } from "./constants/index.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

// ─── Force HTTPS in production ───────────────────────────────────
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (!req.secure && req.get("x-forwarded-proto") !== "https") {
      return res.redirect(301, "https://" + req.get("host") + req.url);
    }
    next();
  });
}

// ─── Security headers ────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // CSP set per-route by frontend; backend serves API only
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ─── Observability (request id + structured logs) ───────────────
app.use(requestId);
app.use(httpLogger);

// ─── CORS ────────────────────────────────────────────────────────
const corsOptions = {
  origin: [CLIENT_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("/api/refresh", cors(corsOptions));

// ─── Body parsing ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ─── Health check (always-on, no rate limit) ─────────────────────
app.get("/api/health", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ success: true, data: { status: "healthy", env: NODE_ENV } });
});

// ─── Tight rate limits on sensitive endpoints ───────────────────
app.use("/api/login", authLimiter);
app.use("/api/signup", authLimiter);
app.use("/api/forgot-password", passwordResetLimiter);
app.use("/api/reset-password", passwordResetLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/ai", aiLimiter);

// ─── Generous global limit (catches everything else) ────────────
app.use("/api", globalLimiter);

// ─── Routes ──────────────────────────────────────────────────────
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use("/api", offerRoutes);
app.use("/api", aiRoutes);

// ─── 404 ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: ERROR_CODES.NOT_FOUND, message: "Route not found" },
  });
});

// ─── Centralized error envelope ─────────────────────────────────
app.use(errorHandler);

export default app;
