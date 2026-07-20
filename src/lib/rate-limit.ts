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
  
  // Since neon-http doesn't support transactions natively, we'll do sequential operations.
  // This is slightly racy but perfectly fine for a simple contact form rate limiter.
  const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
  
  if (existing.length === 0) {
    // First request
    const expireAt = new Date(now.getTime() + config.durationInSeconds * 1000);
    await db.insert(rateLimits).values({
      key,
      points: 1,
      expireAt,
    });
    return; // Allowed
  }

  const current = existing[0];
  
  if (current.expireAt < now) {
    // Expired, reset
    const expireAt = new Date(now.getTime() + config.durationInSeconds * 1000);
    await db.update(rateLimits).set({
      points: 1,
      expireAt,
    }).where(eq(rateLimits.key, key));
    return; // Allowed
  }
  
  if (current.points >= config.points) {
    throw new RateLimitError();
  }
  
  // Increment
  await db.update(rateLimits).set({
    points: current.points + 1,
  }).where(eq(rateLimits.key, key));
  
  return; // Allowed
}
