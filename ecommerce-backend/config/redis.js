import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.warn("Redis error (continuing without cache):", err.message);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn("Redis connection failed, cache disabled");
  }
};
