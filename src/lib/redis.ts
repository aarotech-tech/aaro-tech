import { Redis } from '@upstash/redis';

// Create a singleton instance with graceful fallback
let redisClient: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("[Redis] Upstash Redis initialized successfully.");
  } catch (error) {
    console.error("[Redis] Failed to initialize Redis:", error);
  }
} else {
  console.warn("[Redis] Upstash Redis environment variables missing. Falling back to local/DB execution.");
}

export const redis = redisClient;

/**
 * Cache helper that checks Redis first, and falls back to a fetcher function if missing/disabled.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cachedData = await redis.get<T>(key);
    if (cachedData) {
      return cachedData;
    }
  } catch (error) {
    console.error(`[Redis] Error fetching key ${key}:`, error);
  }

  // Fallback to fetcher
  const data = await fetcher();

  // Store asynchronously
  if (data) {
    redis.setex(key, ttlSeconds, data).catch(err => {
      console.error(`[Redis] Error setting key ${key}:`, err);
    });
  }

  return data;
}
