import "server-only";
import { db } from "@/lib/db";
import { getPlan } from "./plans";
import { formatBytes } from "@/lib/utils";

export async function checkMemberLimit(orgId: string) {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    include: { _count: { select: { members: true } } },
  });

  const plan = getPlan(org.plan);
  if (org._count.members >= plan.limits.maxMembers) {
    throw new Error(
      `Member limit reached. Your ${plan.name} plan allows up to ${plan.limits.maxMembers} members. Upgrade to add more.`,
    );
  }
}

export async function checkStorageLimit(orgId: string, additionalBytes: number = 0) {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
  });

  const plan = getPlan(org.plan);

  const result = await db.file.aggregate({
    where: { organizationId: orgId },
    _sum: { size: true },
  });

  const currentUsage = result._sum.size ?? 0;
  if (currentUsage + additionalBytes > plan.limits.maxStorageBytes) {
    throw new Error(
      `Storage limit reached. Your ${plan.name} plan allows up to ${formatBytes(plan.limits.maxStorageBytes)}. Upgrade to add more storage.`,
    );
  }
}

export async function checkApiKeyLimit(orgId: string) {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    include: { _count: { select: { apiKeys: true } } },
  });

  const plan = getPlan(org.plan);
  if (org._count.apiKeys >= plan.limits.maxApiKeys) {
    throw new Error(
      `API key limit reached. Your ${plan.name} plan allows up to ${plan.limits.maxApiKeys} API keys. Upgrade to add more.`,
    );
  }
}
