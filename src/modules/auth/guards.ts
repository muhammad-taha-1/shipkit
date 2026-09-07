import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "./auth";
import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/errors";
import { type MemberRole } from "@/generated/prisma/client";

export const IMPERSONATION_COOKIE = "admin-impersonation";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "SUPER_ADMIN";
  isImpersonating?: boolean;
  impersonatedBy?: string;
};

export async function getRealUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.bannedAt) return null;
  return session.user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.bannedAt) return null;

  if (session.user.role === "SUPER_ADMIN") {
    const cookieStore = await cookies();
    const impersonationCookie = cookieStore.get(IMPERSONATION_COOKIE);
    if (impersonationCookie?.value) {
      const targetUser = await db.user.findUnique({
        where: { id: impersonationCookie.value },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          bannedAt: true,
        },
      });
      if (targetUser && !targetUser.bannedAt) {
        return {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          image: targetUser.image,
          role: targetUser.role,
          isImpersonating: true,
          impersonatedBy: session.user.id,
        };
      }
    }
  }

  return session.user;
}

export async function requireAuth(): Promise<AuthUser> {
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

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await getRealUser();
  if (!user) redirect("/login");

  if (user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Super admin access required");
  }

  return user;
}
