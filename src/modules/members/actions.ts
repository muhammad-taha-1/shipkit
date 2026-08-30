"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAuth } from "@/modules/auth/guards";
import { hasPermission } from "./permissions";
import { inviteMemberSchema } from "@/lib/validations";
import { INVITATION_EXPIRY_DAYS } from "@/lib/constants";
import { checkMemberLimit } from "@/modules/billing/limits";
import { type MemberRole } from "@/generated/prisma/client";
import { sendEmail } from "@/modules/notifications/send";
import InviteMember from "../../../emails/invite-member";
import { createAuditLog } from "@/modules/audit/log";
import { createNotification } from "@/modules/notifications/create";
import { getOrgAdminsAndOwners } from "@/modules/notifications/recipients";

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

  const inviter = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const acceptUrl = `${appUrl}/accept-invite?token=${token}`;

  await sendEmail({
    to: parsed.data.email,
    subject: `You've been invited to join ${org.name} — ShipKit`,
    react: InviteMember({
      inviterName: inviter.name ?? inviter.email,
      orgName: org.name,
      role: parsed.data.role,
      acceptUrl,
    }),
  });

  await createAuditLog({
    action: "member.invited",
    entityType: "invitation",
    organizationId: orgId,
    userId: user.id,
    metadata: { email: parsed.data.email, role: parsed.data.role },
  });

  const adminIds = await getOrgAdminsAndOwners(orgId);
  await createNotification({
    type: "MEMBER_INVITED",
    title: "New member invited",
    body: `${user.name ?? user.email} invited ${parsed.data.email} as ${parsed.data.role}`,
    link: "/settings/members",
    actorId: user.id,
    recipientIds: adminIds,
    organizationId: orgId,
  });

  const invitee = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (invitee) {
    await createNotification({
      type: "MEMBER_INVITED",
      title: `You've been invited to ${org.name}`,
      body: `${user.name ?? user.email} invited you to join as ${parsed.data.role}`,
      link: `/accept-invite?token=${token}`,
      actorId: user.id,
      recipientIds: [invitee.id],
      organizationId: orgId,
    });
  }

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

  await createAuditLog({
    action: "member.joined",
    entityType: "member",
    organizationId: invitation.organizationId,
    userId: user.id,
    metadata: { role: invitation.role },
  });

  const adminIds = await getOrgAdminsAndOwners(invitation.organizationId);
  await createNotification({
    type: "MEMBER_JOINED",
    title: "New member joined",
    body: `${user.name ?? user.email} joined as ${invitation.role}`,
    link: "/settings/members",
    actorId: user.id,
    recipientIds: adminIds,
    organizationId: invitation.organizationId,
  });

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

  await createAuditLog({
    action: "member.removed",
    entityType: "member",
    entityId: targetUserId,
    organizationId: orgId,
    userId: user.id,
  });

  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { name: true },
  });
  await createNotification({
    type: "MEMBER_REMOVED",
    title: `You were removed from ${org.name}`,
    body: `${user.name ?? user.email} removed you from the organization`,
    actorId: user.id,
    recipientIds: [targetUserId],
    organizationId: orgId,
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

  await createAuditLog({
    action: "member.role_changed",
    entityType: "member",
    entityId: targetUserId,
    organizationId: orgId,
    userId: user.id,
    metadata: { newRole, previousRole: targetMember.role },
  });

  await createNotification({
    type: "MEMBER_ROLE_CHANGED",
    title: "Your role was changed",
    body: `${user.name ?? user.email} changed your role from ${targetMember.role} to ${newRole}`,
    link: "/settings/members",
    actorId: user.id,
    recipientIds: [targetUserId],
    organizationId: orgId,
  });

  return { success: true };
}

export async function revokeInvitation(invitationId: string, orgId: string) {
  const user = await requireAuth();
  await requireMemberWithPermission(orgId, user.id, "members:invite");

  const invitation = await db.invitation.findUnique({
    where: { id: invitationId, organizationId: orgId },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.status !== "PENDING") {
    return { success: false, error: `Cannot revoke an invitation that is ${invitation.status.toLowerCase()}` };
  }

  await db.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED" },
  });

  await createAuditLog({
    action: "invitation.revoked",
    entityType: "invitation",
    entityId: invitationId,
    organizationId: orgId,
    userId: user.id,
  });

  const adminIds = await getOrgAdminsAndOwners(orgId);
  await createNotification({
    type: "INVITATION_REVOKED",
    title: "Invitation revoked",
    body: `${user.name ?? user.email} revoked the invitation for ${invitation.email}`,
    link: "/settings/members",
    actorId: user.id,
    recipientIds: adminIds,
    organizationId: orgId,
  });

  return { success: true };
}
