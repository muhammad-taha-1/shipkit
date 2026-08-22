import "server-only";
import { db } from "@/lib/db";

export async function getUserOrganizations(userId: string) {
  return db.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOrganization(orgId: string) {
  return db.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: { select: { members: true } },
    },
  });
}

export async function getOrganizationBySlug(slug: string) {
  return db.organization.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true } },
    },
  });
}

export async function getOrganizationMembers(orgId: string) {
  return db.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOrganizationInvitations(orgId: string) {
  return db.invitation.findMany({
    where: { organizationId: orgId, status: "PENDING" },
    include: { invitedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}
