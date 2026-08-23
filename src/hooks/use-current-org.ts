import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";

export const getActiveOrgId = cache(async (userId: string) => {
  const cookieStore = await cookies();
  const stored = cookieStore.get("active-org-id")?.value ?? null;

  if (stored) {
    const isMember = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: stored },
      },
      select: { organizationId: true },
    });
    if (isMember) return stored;
  }

  const firstMembership = await db.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  return firstMembership?.organizationId ?? null;
});
