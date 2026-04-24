import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient = null;
let connecting = null;
let failed = false; // once it fails, don't retry

export const getRedisClient = async () => {
  if (!redisUrl) return null;
  if (failed) return null;
  if (redisClient?.isOpen) return redisClient;

  if (connecting) {
    await connecting;
    return redisClient?.isOpen ? redisClient : null;
  }

  redisClient = createClient({
    url: redisUrl,
    socket: {
      tls: true,
      rejectUnauthorized: false,
      // Do NOT auto-reconnect — if the URL is wrong we don't want log spam
      reconnectStrategy: false,
    },
  });

  // Only log the first error, then silence further ones
  let errorLogged = false;
  redisClient.on("error", (err) => {
    if (!errorLogged) {
      console.warn("⚠️  Redis unavailable, cache disabled:", err.message);
      errorLogged = true;
    }
  });

  connecting = redisClient
    .connect()
    .then(() => {
      console.log("✅ Redis connected");
    })
    .catch((err) => {
      console.warn("⚠️  Redis connection failed, cache disabled:", err.message);
      redisClient = null;
      failed = true; // stop all future attempts this process lifetime
    })
    .finally(() => {
      connecting = null;
    });

  await connecting;
  return redisClient ?? null;
};
