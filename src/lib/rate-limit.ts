import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RateLimitError } from "./errors";

interface RateLimitConfig {
  points: number;
  durationInSeconds: number;
}

export async function rateLimit(key: string, config: RateLimitConfig) {
  // We use PostgreSQL as the rate limiter because there's no Redis infra here yet.
  
  // Cleanup expired
  const now = new Date();
  
  // Optimistic concurrency / atomic update
  const res = await db.transaction(async (tx) => {
    const existing = await tx.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
    
    if (existing.length === 0) {
      // First request
      const expireAt = new Date(now.getTime() + config.durationInSeconds * 1000);
      await tx.insert(rateLimits).values({
        key,
        points: 1,
        expireAt,
      });
      return { allowed: true, remaining: config.points - 1 };
    }

    const current = existing[0];
    
    if (current.expireAt < now) {
      // Expired, reset
      const expireAt = new Date(now.getTime() + config.durationInSeconds * 1000);
      await tx.update(rateLimits).set({
        points: 1,
        expireAt,
      }).where(eq(rateLimits.key, key));
      return { allowed: true, remaining: config.points - 1 };
    }
    
    if (current.points >= config.points) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment
    await tx.update(rateLimits).set({
      points: current.points + 1,
    }).where(eq(rateLimits.key, key));
    
    return { allowed: true, remaining: config.points - current.points - 1 };
  });

  if (!res.allowed) {
    throw new RateLimitError();
  }
}
