import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getActiveOrgId } from "@/hooks/use-current-org";
import { getOrgFiles, getStorageUsage } from "@/modules/uploads/queries";
import { db } from "@/lib/db";
import { getPlan } from "@/modules/billing/plans";
import { hasPermission } from "@/modules/members/permissions";
import { FileList } from "./file-list";

export const metadata: Metadata = { title: "Files" };

export default async function FilesPage() {
  const user = await requireAuth();
  const orgId = await getActiveOrgId(user.id);
  if (!orgId) redirect("/onboarding");

  const [filesResult, storageUsage, org, member] = await Promise.all([
    getOrgFiles(orgId),
    getStorageUsage(orgId),
    db.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { plan: true },
    }),
    db.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: user.id, organizationId: orgId },
      },
      select: { role: true },
    }),
  ]);

  const plan = getPlan(org.plan);
  const canUpload = member ? hasPermission(member.role, "files:upload") : false;
  const canDeleteAny = member ? hasPermission(member.role, "files:delete") : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Files</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your organization&apos;s files and documents.
        </p>
      </div>

      <FileList
        files={filesResult.items}
        orgId={orgId}
        currentUserId={user.id}
        canUpload={canUpload}
        canDeleteAny={canDeleteAny}
        storageUsed={storageUsage.totalBytes}
        storageLimit={plan.limits.maxStorageBytes}
        fileCount={storageUsage.fileCount}
      />
    </div>
  );
}
