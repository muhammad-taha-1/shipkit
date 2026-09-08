import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, boolean> = {
    database: false,
    redis: false,
  };

  try {
    await db.$queryRawUnsafe("SELECT 1");
    checks.database = true;
  } catch {}

  if (redis) {
    try {
      await redis.ping();
      checks.redis = true;
    } catch {}
  } else {
    checks.redis = false;
  }

  const healthy = checks.database && (redis ? checks.redis : true);

  return Response.json(
    { status: healthy ? "healthy" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
