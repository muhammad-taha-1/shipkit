import "server-only";
import { db } from "@/lib/db";
import { type MemberRole } from "@/generated/prisma/client";

export async function getOrgMembersByRole(
  orgId: string,
  roles: MemberRole[],
): Promise<string[]> {
  const members = await db.organizationMember.findMany({
    where: { organizationId: orgId, role: { in: roles } },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

export async function getOrgAdminsAndOwners(orgId: string): Promise<string[]> {
  return getOrgMembersByRole(orgId, ["OWNER", "ADMIN"]);
}

export async function getOrgOwners(orgId: string): Promise<string[]> {
  return getOrgMembersByRole(orgId, ["OWNER"]);
}
