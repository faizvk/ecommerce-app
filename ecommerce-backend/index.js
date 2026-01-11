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

    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received. Shutting down...");

      server.close(async () => {
        try {
          const redis = await getRedisClient();
          if (redis?.isOpen) {
            await redis.quit();
            console.log("✅ Redis closed");
          }
        } catch (_) {}

        mongoose.connection.close(false, () => {
          console.log("✅ MongoDB closed");
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
