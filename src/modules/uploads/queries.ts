import "server-only";
import { db } from "@/lib/db";
import { type FileCategory } from "@/generated/prisma/client";

export async function getOrgFiles(
  orgId: string,
  options?: { category?: FileCategory; cursor?: string; limit?: number },
) {
  const limit = options?.limit ?? 20;
  const where: Record<string, unknown> = { organizationId: orgId };

  if (options?.category) {
    where.category = options.category;
  } else {
    where.category = { in: ["DOCUMENT", "IMAGE"] };
  }

  const files = await db.file.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(options?.cursor ? { skip: 1, cursor: { id: options.cursor } } : {}),
  });

  const hasMore = files.length > limit;
  const items = hasMore ? files.slice(0, limit) : files;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

export async function getStorageUsage(orgId: string) {
  const result = await db.file.aggregate({
    where: { organizationId: orgId },
    _sum: { size: true },
    _count: true,
  });

  return {
    totalBytes: result._sum.size ?? 0,
    fileCount: result._count,
  };
}
