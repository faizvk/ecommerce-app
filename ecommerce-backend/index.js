import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { getRedisClient } from "./config/redis.js";

const startServer = async () => {
  try {
    await connectDB();

    getRedisClient().catch(() => {});

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    /* ---------- GRACEFUL SHUTDOWN ---------- */
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received. Shutting down gracefully...");

      server.close(async () => {
        try {
          const redis = await getRedisClient();
          if (redis?.isOpen) {
            await redis.quit();
            console.log("✅ Redis connection closed.");
          }
        } catch (err) {
          console.warn("⚠️ Redis shutdown error:", err.message);
        }

        mongoose.connection.close(false, () => {
          console.log("✅ MongoDB connection closed.");
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
