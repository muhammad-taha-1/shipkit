import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60s"),
      analytics: true,
      prefix: "rl:auth",
    })
  : null;

const strictAuthLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "60s"),
      analytics: true,
      prefix: "rl:auth-strict",
    })
  : null;

const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "60s"),
      analytics: true,
      prefix: "rl:api",
    })
  : null;

const inMemoryBuckets = new Map<string, { count: number; resetAt: number }>();

const IN_MEMORY_CLEANUP_INTERVAL = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of inMemoryBuckets) {
    if (now > bucket.resetAt) inMemoryBuckets.delete(key);
  }
}, IN_MEMORY_CLEANUP_INTERVAL);

function inMemoryRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = inMemoryBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    inMemoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }

  if (bucket.count >= maxAttempts) {
    return { success: false, remaining: 0 };
  }

  bucket.count++;
  return { success: true, remaining: maxAttempts - bucket.count };
}

type RateLimitPreset = "auth" | "auth-strict" | "api";

const presetConfig: Record<RateLimitPreset, { limiter: Ratelimit | null; maxAttempts: number; windowMs: number }> = {
  auth: { limiter: authLimiter, maxAttempts: 5, windowMs: 60_000 },
  "auth-strict": { limiter: strictAuthLimiter, maxAttempts: 2, windowMs: 60_000 },
  api: { limiter: apiLimiter, maxAttempts: 100, windowMs: 60_000 },
};

export async function rateLimit(
  key: string,
  options: { maxAttempts: number; windowMs: number } | { preset: RateLimitPreset },
): Promise<{ success: boolean; remaining: number }> {
  if ("preset" in options) {
    const config = presetConfig[options.preset];
    if (config.limiter) {
      const result = await config.limiter.limit(key);
      return { success: result.success, remaining: result.remaining };
    }
    return inMemoryRateLimit(key, config.maxAttempts, config.windowMs);
  }

  const { maxAttempts, windowMs } = options;

  if (redis) {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxAttempts, `${Math.round(windowMs / 1000)}s`),
      prefix: "rl:custom",
    });
    const result = await limiter.limit(key);
    return { success: result.success, remaining: result.remaining };
  }

  return inMemoryRateLimit(key, maxAttempts, windowMs);
}
