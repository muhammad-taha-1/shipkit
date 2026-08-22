import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "@/lib/db";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { type MemberRole } from "@/generated/prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOrgMember(orgId: string) {
  const user = await requireAuth();

  const member = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: orgId,
      },
    },
  });

  if (!member) throw new ForbiddenError("Not a member of this organization");

  return { user, member };
}

export async function requireOrgRole(orgId: string, roles: MemberRole[]) {
  const { user, member } = await requireOrgMember(orgId);

  if (!roles.includes(member.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }

  return { user, member };
}

export async function requireSuperAdmin() {
  const user = await requireAuth();

  if (user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Super admin access required");
  }

  return user;
}
