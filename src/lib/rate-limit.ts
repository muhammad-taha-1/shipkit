import "server-only";

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number },
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }

  if (bucket.count >= maxAttempts) {
    return { success: false, remaining: 0 };
  }

  bucket.count++;
  return { success: true, remaining: maxAttempts - bucket.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 60_000);
