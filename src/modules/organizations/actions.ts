"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/modules/auth/guards";
import { createOrgSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { cookies } from "next/headers";

export async function createOrganization(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string) || generateSlug(formData.get("name") as string),
  };

  const parsed = createOrgSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const existingSlug = await db.organization.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return { success: false, error: { slug: ["This slug is already taken"] } };
  }

  const org = await db.organization.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("active-org-id", org.id, { path: "/", httpOnly: true, sameSite: "lax" });

  return { success: true, orgId: org.id };
}

export async function updateOrganization(orgId: string, formData: FormData) {
  const user = await requireAuth();

  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return { success: false, error: "Insufficient permissions" };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (slug) {
    const existingSlug = await db.organization.findFirst({
      where: { slug, id: { not: orgId } },
    });
    if (existingSlug) {
      return { success: false, error: "This slug is already taken" };
    }
  }

  await db.organization.update({
    where: { id: orgId },
    data: {
      ...(name && { name }),
      ...(slug && { slug }),
    },
  });

  return { success: true };
}

export async function deleteOrganization(orgId: string) {
  const user = await requireAuth();

  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
  if (!member || member.role !== "OWNER") {
    return { success: false, error: "Only the owner can delete an organization" };
  }

  await db.organization.delete({ where: { id: orgId } });

  const cookieStore = await cookies();
  cookieStore.delete("active-org-id");

  return { success: true };
}

export async function switchOrganization(orgId: string) {
  const user = await requireAuth();

  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
  if (!member) {
    return { success: false, error: "Not a member of this organization" };
  }

  const cookieStore = await cookies();
  cookieStore.set("active-org-id", orgId, { path: "/", httpOnly: true, sameSite: "lax" });

  return { success: true };
}
