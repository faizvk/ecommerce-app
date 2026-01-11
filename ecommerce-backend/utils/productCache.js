import { getRedisClient } from "../config/redis.js";

export const PRODUCT_CACHE_VERSION_KEY = "products:version";
export const CACHE_TTL = 300; // 5 minutes

export const getVersionedKey = async (baseKey) => {
  const redis = await getRedisClient();
  if (!redis) return baseKey;

  const version = (await redis.get(PRODUCT_CACHE_VERSION_KEY)) || "1";

  return `${baseKey}:v${version}`;
};

export const invalidateProductCache = async () => {
  try {
    const redis = await getRedisClient();
    if (!redis) return;

    await redis.incr(PRODUCT_CACHE_VERSION_KEY);
  } catch (_) {}
};
