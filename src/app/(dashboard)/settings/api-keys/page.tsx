import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getActiveOrgId } from "@/hooks/use-current-org";
import { db } from "@/lib/db";
import { hasPermission } from "@/modules/members/permissions";
import { getApiKeys } from "@/modules/settings/actions";
import { ApiKeyList } from "./api-key-list";

export const metadata: Metadata = {
  title: "API Keys",
};

export default async function ApiKeysPage() {
  const user = await requireAuth();
  const orgId = await getActiveOrgId(user.id);
  if (!orgId) redirect("/onboarding");

  const member = await db.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
    select: { role: true },
  });

  const canCreate = member ? hasPermission(member.role, "apiKeys:create") : false;
  const canDelete = member ? hasPermission(member.role, "apiKeys:delete") : false;

  const apiKeys = await getApiKeys(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for programmatic access to your organization.
        </p>
      </div>

      <ApiKeyList
        apiKeys={apiKeys}
        orgId={orgId}
        canCreate={canCreate}
        canDelete={canDelete}
      />
    </div>
  );
}
