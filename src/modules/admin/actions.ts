"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { requireSuperAdmin, IMPERSONATION_COOKIE } from "@/modules/auth/guards";
import { createAuditLog } from "@/modules/audit/log";
import {
  changeUserRoleSchema,
  changeOrgPlanSchema,
  banUserSchema,
  adminDeleteUserSchema,
  adminDeleteOrgSchema,
  impersonateUserSchema,
} from "@/lib/validations";
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

export async function banUser(userId: string, reason?: string) {
  const admin = await requireSuperAdmin();

  const parsed = banUserSchema.safeParse({ userId, reason });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" };
  }

  if (userId === admin.id) {
    return { success: false as const, error: "Cannot ban yourself" };
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { success: false as const, error: "User not found" };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return { success: false as const, error: "Cannot ban another super admin" };
  }

  if (targetUser.bannedAt) {
    return { success: false as const, error: "User is already banned" };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      bannedAt: new Date(),
      bannedReason: reason ?? null,
    },
  });

  await createAuditLog({
    action: "admin.user_banned",
    entityType: "user",
    entityId: userId,
    userId: admin.id,
    metadata: { reason: reason ?? null, userEmail: targetUser.email },
  });

  return { success: true as const };
}

export async function unbanUser(userId: string) {
  const admin = await requireSuperAdmin();

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { success: false as const, error: "User not found" };
  }

  if (!targetUser.bannedAt) {
    return { success: false as const, error: "User is not banned" };
  }

  await db.user.update({
    where: { id: userId },
    data: { bannedAt: null, bannedReason: null },
  });

  await createAuditLog({
    action: "admin.user_unbanned",
    entityType: "user",
    entityId: userId,
    userId: admin.id,
    metadata: { userEmail: targetUser.email },
  });

  return { success: true as const };
}

export async function deleteUser(userId: string) {
  const admin = await requireSuperAdmin();

  const parsed = adminDeleteUserSchema.safeParse({ userId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" };
  }

  if (userId === admin.id) {
    return { success: false as const, error: "Cannot delete yourself" };
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { success: false as const, error: "User not found" };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return {
      success: false as const,
      error: "Cannot delete another super admin",
    };
  }

  await createAuditLog({
    action: "admin.user_deleted",
    entityType: "user",
    entityId: userId,
    userId: admin.id,
    metadata: {
      deletedUserEmail: targetUser.email,
      deletedUserName: targetUser.name ?? null,
    },
  });

  await db.user.delete({ where: { id: userId } });

  return { success: true as const };
}

export async function deleteOrganization(orgId: string) {
  const admin = await requireSuperAdmin();

  const parsed = adminDeleteOrgSchema.safeParse({ orgId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" };
  }

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return { success: false as const, error: "Organization not found" };
  }

  await createAuditLog({
    action: "admin.org_deleted",
    entityType: "organization",
    entityId: orgId,
    userId: admin.id,
    metadata: {
      deletedOrgName: org.name,
      deletedOrgSlug: org.slug,
      plan: org.plan,
    },
  });

  await db.organization.delete({ where: { id: orgId } });

  return { success: true as const };
}

export async function startImpersonation(userId: string) {
  const admin = await requireSuperAdmin();

  const parsed = impersonateUserSchema.safeParse({ userId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input" };
  }

  if (userId === admin.id) {
    return { success: false as const, error: "Cannot impersonate yourself" };
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return { success: false as const, error: "User not found" };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return {
      success: false as const,
      error: "Cannot impersonate another super admin",
    };
  }

  if (targetUser.bannedAt) {
    return { success: false as const, error: "Cannot impersonate a banned user" };
  }

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  await createAuditLog({
    action: "admin.impersonation_started",
    entityType: "user",
    entityId: userId,
    userId: admin.id,
    metadata: {
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name ?? null,
    },
  });

  return { success: true as const };
}

export async function stopImpersonation() {
  const admin = await requireSuperAdmin();

  const cookieStore = await cookies();
  const impersonationCookie = cookieStore.get(IMPERSONATION_COOKIE);

  if (!impersonationCookie?.value) {
    return { success: false as const, error: "Not currently impersonating" };
  }

  const targetUserId = impersonationCookie.value;

  cookieStore.set(IMPERSONATION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  await createAuditLog({
    action: "admin.impersonation_stopped",
    entityType: "user",
    entityId: targetUserId,
    userId: admin.id,
    metadata: {},
  });

  return { success: true as const };
}
