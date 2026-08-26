"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth } from "@/modules/auth/guards";
import { hasPermission } from "@/modules/members/permissions";
import {
  updateProfileSchema,
  changePasswordSchema,
  createApiKeySchema,
} from "@/lib/validations";
import { checkApiKeyLimit } from "@/modules/billing/limits";
import { createAuditLog } from "@/modules/audit/log";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name") as string,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  await createAuditLog({
    action: "user.profile_updated",
    entityType: "user",
    entityId: user.id,
    userId: user.id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const user = await requireAuth();

  const dbUser = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser.passwordHash) {
    return { success: false, error: { currentPassword: ["This account uses social login and has no password to change."] } };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return { success: false, error: { currentPassword: ["Current password is incorrect."] } };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await createAuditLog({
    action: "user.password_changed",
    entityType: "user",
    entityId: user.id,
    userId: user.id,
  });

  return { success: true };
}

export async function createApiKey(orgId: string, formData: FormData) {
  const user = await requireAuth();

  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
  if (!member || !hasPermission(member.role, "apiKeys:create")) {
    return { success: false, error: "Insufficient permissions" };
  }

  const parsed = createApiKeySchema.safeParse({
    name: formData.get("name") as string,
    expiresIn: formData.get("expiresIn") as string || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await checkApiKeyLimit(orgId);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }

  const rawKey = `sk_live_${crypto.randomBytes(32).toString("hex")}`;
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  const lastFour = rawKey.slice(-4);

  const expiresAtMap: Record<string, number | null> = {
    never: null,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "60d": 60 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
    "1y": 365 * 24 * 60 * 60 * 1000,
  };

  const expiresInMs = expiresAtMap[parsed.data.expiresIn ?? "never"];
  const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs) : null;

  const apiKey = await db.apiKey.create({
    data: {
      name: parsed.data.name,
      hashedKey,
      lastFour,
      expiresAt,
      organizationId: orgId,
      userId: user.id,
    },
  });

  await createAuditLog({
    action: "apikey.created",
    entityType: "apiKey",
    entityId: apiKey.id,
    organizationId: orgId,
    userId: user.id,
    metadata: { name: parsed.data.name, lastFour },
  });

  revalidatePath("/settings/api-keys");
  return { success: true, key: rawKey };
}

export async function revokeApiKey(orgId: string, apiKeyId: string) {
  const user = await requireAuth();

  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
  if (!member || !hasPermission(member.role, "apiKeys:delete")) {
    return { success: false, error: "Insufficient permissions" };
  }

  const apiKey = await db.apiKey.findUnique({
    where: { id: apiKeyId, organizationId: orgId },
  });
  if (!apiKey) {
    return { success: false, error: "API key not found" };
  }

  await db.apiKey.delete({ where: { id: apiKeyId } });

  await createAuditLog({
    action: "apikey.revoked",
    entityType: "apiKey",
    entityId: apiKeyId,
    organizationId: orgId,
    userId: user.id,
    metadata: { name: apiKey.name, lastFour: apiKey.lastFour },
  });

  revalidatePath("/settings/api-keys");
  return { success: true };
}

export async function getApiKeys(orgId: string) {
  return db.apiKey.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      name: true,
      lastFour: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getConnectedAccounts(userId: string) {
  return db.account.findMany({
    where: { userId },
    select: { provider: true },
  });
}
