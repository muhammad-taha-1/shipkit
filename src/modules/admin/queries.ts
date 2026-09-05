import "server-only";
import { db } from "@/lib/db";
import { plans } from "@/modules/billing/plans";
import { type PlanType } from "@/generated/prisma/client";

export async function getAdminStats() {
  const [totalUsers, totalOrgs, planCounts] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.organization.groupBy({
      by: ["plan"],
      where: { subscriptionStatus: "ACTIVE" },
      _count: true,
    }),
  ]);

  let activeSubscriptions = 0;
  let mrr = 0;
  for (const group of planCounts) {
    activeSubscriptions += group._count;
    mrr += group._count * plans[group.plan as PlanType].price;
  }

  return { totalUsers, totalOrgs, activeSubscriptions, mrr };
}

export async function getAdminUsers({
  search,
  cursor,
  limit = 20,
}: {
  search?: string;
  cursor?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = users.length > limit;
  const items = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

export async function getAdminOrganizations({
  search,
  cursor,
  limit = 20,
}: {
  search?: string;
  cursor?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const orgs = await db.organization.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      subscriptionStatus: true,
      createdAt: true,
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = orgs.length > limit;
  const items = hasMore ? orgs.slice(0, limit) : orgs;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

export async function getSystemAuditLogs({
  action,
  cursor,
  limit = 20,
}: {
  action?: string;
  cursor?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (action) where.action = action;

  const logs = await db.auditLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      organization: { select: { id: true, name: true, slug: true } },
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

export async function getSystemDistinctActions() {
  const actions = await db.auditLog.findMany({
    select: { action: true },
    distinct: ["action"],
    orderBy: { action: "asc" },
  });
  return actions.map((a) => a.action);
}

export async function getRecentSystemActivity(limit = 10) {
  return db.auditLog.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      organization: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
