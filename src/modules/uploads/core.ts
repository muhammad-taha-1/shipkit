import { z } from "zod";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "@uploadthing/shared";
import { auth } from "@/modules/auth/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/modules/members/permissions";
import { checkStorageLimit } from "@/modules/billing/limits";
import { createAuditLog } from "@/modules/audit/log";
import { UTApi } from "uploadthing/server";
import {
  AVATAR_MAX_SIZE_MB,
  ORG_LOGO_MAX_SIZE_MB,
} from "@/lib/constants";

const f = createUploadthing();
const utapi = new UTApi();

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UploadThingError("Unauthorized");
  return session.user;
}

async function getOrgMember(userId: string, orgId: string) {
  const member = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: { userId, organizationId: orgId },
    },
  });
  if (!member) throw new UploadThingError("Not a member of this organization");
  return member;
}

export const uploadRouter = {
  avatarUpload: f({
    image: { maxFileSize: `${AVATAR_MAX_SIZE_MB}MB`, maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getUser();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const previousAvatar = await db.file.findFirst({
          where: { userId: metadata.userId, category: "AVATAR" },
        });

        if (previousAvatar) {
          await utapi.deleteFiles(previousAvatar.key).catch(() => {});
          await db.file.delete({ where: { id: previousAvatar.id } });
        }

        await db.file.create({
          data: {
            name: file.name,
            key: file.key,
            url: file.ufsUrl,
            size: file.size,
            type: file.type,
            category: "AVATAR",
            userId: metadata.userId,
          },
        });

        await db.user.update({
          where: { id: metadata.userId },
          data: { image: file.ufsUrl },
        });

        await createAuditLog({
          action: "user.avatar_updated",
          entityType: "user",
          entityId: metadata.userId,
          userId: metadata.userId,
        });
      } catch (error) {
        console.error("[avatarUpload] onUploadComplete error:", error);
        throw error;
      }

      return { url: file.ufsUrl };
    }),

  orgLogoUpload: f({
    image: { maxFileSize: `${ORG_LOGO_MAX_SIZE_MB}MB`, maxFileCount: 1 },
  })
    .input(z.object({ orgId: z.string() }))
    .middleware(async ({ input }) => {
      const user = await getUser();
      const member = await getOrgMember(user.id, input.orgId);

      if (!hasPermission(member.role, "org:update")) {
        throw new UploadThingError("Insufficient permissions");
      }

      return { userId: user.id, orgId: input.orgId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const previousLogo = await db.file.findFirst({
        where: { organizationId: metadata.orgId, category: "ORG_LOGO" },
      });

      if (previousLogo) {
        await utapi.deleteFiles(previousLogo.key).catch(() => {});
        await db.file.delete({ where: { id: previousLogo.id } });
      }

      await db.file.create({
        data: {
          name: file.name,
          key: file.key,
          url: file.ufsUrl,
          size: file.size,
          type: file.type,
          category: "ORG_LOGO",
          organizationId: metadata.orgId,
          userId: metadata.userId,
        },
      });

      await db.organization.update({
        where: { id: metadata.orgId },
        data: { logo: file.ufsUrl },
      });

      await createAuditLog({
        action: "org.logo_updated",
        entityType: "organization",
        entityId: metadata.orgId,
        organizationId: metadata.orgId,
        userId: metadata.userId,
      });

      return { url: file.ufsUrl };
    }),

  orgFileUpload: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .input(z.object({ orgId: z.string() }))
    .middleware(async ({ input, files }) => {
      const user = await getUser();
      const member = await getOrgMember(user.id, input.orgId);

      if (!hasPermission(member.role, "files:upload")) {
        throw new UploadThingError("Insufficient permissions");
      }

      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      await checkStorageLimit(input.orgId, totalSize);

      return { userId: user.id, orgId: input.orgId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const category = file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT";

      await db.file.create({
        data: {
          name: file.name,
          key: file.key,
          url: file.ufsUrl,
          size: file.size,
          type: file.type,
          category,
          organizationId: metadata.orgId,
          userId: metadata.userId,
        },
      });

      await createAuditLog({
        action: "file.uploaded",
        entityType: "file",
        organizationId: metadata.orgId,
        userId: metadata.userId,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      });

      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;
