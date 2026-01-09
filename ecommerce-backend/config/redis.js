import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient = null;
let isReady = false;

export const getRedisClient = async () => {
  if (!redisUrl) return null;

  if (redisClient && isReady) {
    return redisClient;
  }

  try {
    redisClient = createClient({ url: redisUrl });

    redisClient.on("error", (err) => {
      console.warn("Redis error, cache disabled:", err.message);
      isReady = false;
    });

    await redisClient.connect();
    isReady = true;

    console.log("Redis connected");
    return redisClient;
  } catch (err) {
    console.warn("Redis connection failed, continuing without cache");
    isReady = false;
    return null;
  }
};
