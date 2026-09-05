"use server";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/modules/auth/guards";
import { createAuditLog } from "@/modules/audit/log";
import { changeUserRoleSchema, changeOrgPlanSchema } from "@/lib/validations";
import { type GlobalRole, type PlanType } from "@/generated/prisma/client";

export async function changeUserRole(userId: string, newRole: string) {
  const admin = await requireSuperAdmin();

  const parsed = changeUserRoleSchema.safeParse({ userId, newRole });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" };
  }

  if (userId === admin.id) {
    return { success: false as const, error: "Cannot change your own role" };
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { success: false as const, error: "User not found" };
  }

  if (targetUser.role === newRole) {
    return { success: false as const, error: "User already has this role" };
  }

  await db.user.update({
    where: { id: userId },
    data: { role: newRole as GlobalRole },
  });

  await createAuditLog({
    action: "admin.user_role_changed",
    entityType: "user",
    entityId: userId,
    userId: admin.id,
    metadata: { newRole, previousRole: targetUser.role },
  });

  return { success: true as const };
}

export async function changeOrgPlan(orgId: string, newPlan: string) {
  const admin = await requireSuperAdmin();

  const parsed = changeOrgPlanSchema.safeParse({ orgId, newPlan });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" };
  }

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return { success: false as const, error: "Organization not found" };
  }

  if (org.plan === newPlan) {
    return { success: false as const, error: "Organization already on this plan" };
  }

  await db.organization.update({
    where: { id: orgId },
    data: { plan: newPlan as PlanType },
  });

  await createAuditLog({
    action: "admin.org_plan_changed",
    entityType: "organization",
    entityId: orgId,
    userId: admin.id,
    metadata: { newPlan, previousPlan: org.plan },
  });

  return { success: true as const };
}
