"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAuth } from "@/modules/auth/guards";
import { hasPermission } from "./permissions";
import { inviteMemberSchema } from "@/lib/validations";
import { INVITATION_EXPIRY_DAYS } from "@/lib/constants";
import { checkMemberLimit } from "@/modules/billing/limits";
import { type MemberRole } from "@/generated/prisma/client";

async function requireMemberWithPermission(
  orgId: string,
  userId: string,
  permission: Parameters<typeof hasPermission>[1],
) {
  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  if (!member || !hasPermission(member.role, permission)) {
    throw new Error("Insufficient permissions");
  }
  return member;
}

export async function inviteMember(orgId: string, formData: FormData) {
  const user = await requireAuth();
  await requireMemberWithPermission(orgId, user.id, "members:invite");

  const raw = {
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  const parsed = inviteMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await checkMemberLimit(orgId);
  } catch (e) {
    return { success: false, error: { email: [(e as Error).message] } };
  }

  const existingMember = await db.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      user: { email: parsed.data.email },
    },
  });
  if (existingMember) {
    return { success: false, error: { email: ["This user is already a member"] } };
  }

  const existingInvite = await db.invitation.findFirst({
    where: {
      organizationId: orgId,
      email: parsed.data.email,
      status: "PENDING",
    },
  });
  if (existingInvite) {
    return { success: false, error: { email: ["An invitation is already pending for this email"] } };
  }

  const token = crypto.randomBytes(32).toString("hex");

  await db.invitation.create({
    data: {
      email: parsed.data.email,
      role: parsed.data.role as MemberRole,
      token,
      organizationId: orgId,
      invitedById: user.id,
      expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  // TODO: Send invite email via Inngest (Phase 5)

  return { success: true };
}

export async function acceptInvitation(token: string) {
  const user = await requireAuth();

  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return { success: false, error: "Invalid or expired invitation" };
  }

  if (invitation.email !== user.email) {
    return { success: false, error: "This invitation was sent to a different email" };
  }

  await db.$transaction([
    db.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    }),
    db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  return { success: true, orgId: invitation.organizationId };
}

export async function removeMember(orgId: string, targetUserId: string) {
  const user = await requireAuth();
  await requireMemberWithPermission(orgId, user.id, "members:remove");

  const targetMember = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
  });

  if (!targetMember) {
    return { success: false, error: "Member not found" };
  }

  if (targetMember.role === "OWNER") {
    return { success: false, error: "Cannot remove the organization owner" };
  }

  if (targetUserId === user.id) {
    return { success: false, error: "Cannot remove yourself" };
  }

  await db.organizationMember.delete({
    where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
  });

  return { success: true };
}

export async function changeRole(orgId: string, targetUserId: string, newRole: MemberRole) {
  const user = await requireAuth();
  await requireMemberWithPermission(orgId, user.id, "members:changeRole");

  if (targetUserId === user.id) {
    return { success: false, error: "Cannot change your own role" };
  }

  const targetMember = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
  });

  if (!targetMember) {
    return { success: false, error: "Member not found" };
  }

  if (targetMember.role === "OWNER" || newRole === "OWNER") {
    return { success: false, error: "Cannot assign or remove the OWNER role" };
  }

  await db.organizationMember.update({
    where: { userId_organizationId: { userId: targetUserId, organizationId: orgId } },
    data: { role: newRole },
  });

  return { success: true };
}

export async function revokeInvitation(invitationId: string, orgId: string) {
  const user = await requireAuth();
  await requireMemberWithPermission(orgId, user.id, "members:invite");

  await db.invitation.update({
    where: { id: invitationId, organizationId: orgId },
    data: { status: "REVOKED" },
  });

  return { success: true };
}
