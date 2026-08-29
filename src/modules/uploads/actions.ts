"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/modules/auth/guards";
import { hasPermission } from "@/modules/members/permissions";
import { deleteFileSchema } from "@/lib/validations";
import { createAuditLog } from "@/modules/audit/log";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteFile(orgId: string, fileId: string) {
  const user = await requireAuth();

  const parsed = deleteFileSchema.safeParse({ fileId });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid file ID" };
  }

  const member = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: { userId: user.id, organizationId: orgId },
    },
  });
  if (!member) {
    return { success: false as const, error: "Not a member of this organization" };
  }

  const file = await db.file.findUnique({
    where: { id: fileId, organizationId: orgId },
  });
  if (!file) {
    return { success: false as const, error: "File not found" };
  }

  const canDeleteAny = hasPermission(member.role, "files:delete");
  const isOwnFile = file.userId === user.id;
  if (!canDeleteAny && !isOwnFile) {
    return { success: false as const, error: "You don't have permission to delete this file" };
  }

  await utapi.deleteFiles(file.key).catch(() => {});

  await db.file.delete({ where: { id: fileId } });

  await createAuditLog({
    action: "file.deleted",
    entityType: "file",
    entityId: fileId,
    organizationId: orgId,
    userId: user.id,
    metadata: { fileName: file.name, fileSize: file.size },
  });

  revalidatePath("/files");
  return { success: true as const };
}
