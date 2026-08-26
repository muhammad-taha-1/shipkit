import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getActiveOrgId } from "@/hooks/use-current-org";
import { db } from "@/lib/db";
import { hasPermission } from "@/modules/members/permissions";
import { OrgSettingsForm } from "./org-settings-form";
import { DangerZone } from "./danger-zone";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireAuth();
  const orgId = await getActiveOrgId(user.id);
  if (!orgId) redirect("/onboarding");

  const [org, member] = await Promise.all([
    db.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { id: true, name: true, slug: true },
    }),
    db.organizationMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
      select: { role: true },
    }),
  ]);

  const canUpdate = member ? hasPermission(member.role, "org:update") : false;
  const isOwner = member?.role === "OWNER";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings.
        </p>
      </div>

      <OrgSettingsForm org={org} canUpdate={canUpdate} />

      {isOwner && <DangerZone orgId={orgId} orgName={org.name} />}
    </div>
  );
}
