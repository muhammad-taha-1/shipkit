import "server-only";
import { db } from "@/lib/db";

export type AuditAction =
  | "org.created"
  | "org.updated"
  | "org.deleted"
  | "member.invited"
  | "member.joined"
  | "member.removed"
  | "member.role_changed"
  | "invitation.revoked"
  | "billing.checkout"
  | "billing.subscription_created"
  | "billing.subscription_updated"
  | "billing.subscription_canceled"
  | "billing.subscription_resumed"
  | "apikey.created"
  | "apikey.revoked";

export async function createAuditLog({
  action,
  entityType,
  entityId,
  metadata,
  organizationId,
  userId,
  ipAddress,
  userAgent,
}: {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  organizationId: string;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  return db.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadata: metadata ?? undefined,
      organizationId,
      userId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });
}

export async function getRecentActivity(organizationId: string, limit = 10) {
  return db.auditLog.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAuditLogs({
  organizationId,
  action,
  cursor,
  limit = 20,
}: {
  organizationId: string;
  action?: string;
  cursor?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = { organizationId };
  if (action) where.action = action;

  const logs = await db.auditLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, limit) : logs;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

export function getDistinctActions(organizationId: string) {
  return db.auditLog.findMany({
    where: { organizationId },
    select: { action: true },
    distinct: ["action"],
    orderBy: { action: "asc" },
  });
}
