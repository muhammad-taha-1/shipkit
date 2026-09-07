import "server-only";
import { db } from "@/lib/db";
import { plans } from "@/modules/billing/plans";
import { type PlanType } from "@/generated/prisma/client";
import { NotFoundError } from "@/lib/errors";

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
      bannedAt: true,
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

export async function getUserDetail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bannedAt: true,
      bannedReason: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
        select: { provider: true },
      },
      memberships: {
        select: {
          role: true,
          createdAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              subscriptionStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          auditLogs: true,
          files: true,
          apiKeys: true,
          notificationsReceived: true,
        },
      },
    },
  });

  if (!user) throw new NotFoundError("User not found");

  const recentActivity = await db.auditLog.findMany({
    where: { userId },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { ...user, recentActivity };
}

export async function getOrgDetail(orgId: string) {
  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      plan: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      subscriptionId: true,
      trialEndsAt: true,
      createdAt: true,
      updatedAt: true,
      members: {
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              bannedAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          files: true,
          apiKeys: true,
          invitations: true,
          auditLogs: true,
        },
      },
    },
  });

  if (!org) throw new NotFoundError("Organization not found");

  const storageUsed = await db.file.aggregate({
    where: { organizationId: orgId },
    _sum: { size: true },
  });

  const recentActivity = await db.auditLog.findMany({
    where: { organizationId: orgId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    ...org,
    storageUsedBytes: storageUsed._sum.size ?? 0,
    recentActivity,
  };
}
