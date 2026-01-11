import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient;
let connecting;

export const getRedisClient = async () => {
  if (!redisUrl) return null;

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (connecting) {
    await connecting;
    return redisClient?.isOpen ? redisClient : null;
  }

  redisClient = createClient({
    url: redisUrl,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  });

  redisClient.on("error", (err) => {
    console.warn("Redis error, cache disabled:", err.message);
  });

  connecting = redisClient
    .connect()
    .then(() => {
      console.log("✅ Redis connected");
    })
    .catch((err) => {
      console.warn(" Redis connection failed:", err.message);
      redisClient = null;
    })
    .finally(() => {
      connecting = null;
    });

  await connecting;
  return redisClient ?? null;
};
