const store: Map<string, { count: number; expiresAt: number }> = new Map();

interface RateLimitConfig {
  points?: number;
  durationInSeconds?: number;
  limit?: number;
  windowMs?: number;
}

export const rateLimit = async (key: string, config: RateLimitConfig = {}) => {
  const limit = config.points || config.limit || 5;
  const windowMs = config.windowMs || (config.durationInSeconds ? config.durationInSeconds * 1000 : 60000);
  
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    throw new Error("Rate limit exceeded");
  }

  record.count += 1;
  store.set(key, record);
  return { success: true };
};

// Add check method to preserve compatibility with both syntaxes used in the codebase
rateLimit.check = async (key: string, limit?: number | RateLimitConfig, windowMs?: number) => {
  if (typeof limit === 'object') {
    return rateLimit(key, limit);
  }
  return rateLimit(key, { limit, windowMs });
};
