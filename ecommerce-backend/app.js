import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import userRoutes from "./view/user.routes.js";
import productRoutes from "./view/product.routes.js";
import cartRoutes from "./view/cart.routes.js";
import orderRoutes from "./view/order.routes.js";
import paymentRoutes from "./view/payment.routes.js";

import { CLIENT_URL } from "./config/env.js";

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(cookieParser());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use("/api", limiter);

// Routes
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

// Health
app.get("/api/health", (_, res) =>
  res.status(200).json({ success: true, message: "Server is healthy" })
);

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
