import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getActiveOrgId } from "@/hooks/use-current-org";
import { getAuditLogs, getDistinctActions } from "@/modules/audit/log";
import { ActivityLog } from "./activity-log";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; cursor?: string }>;
}) {
  const user = await requireAuth();
  const orgId = await getActiveOrgId(user.id);
  if (!orgId) redirect("/onboarding");

  const params = await searchParams;

  const [{ items, nextCursor }, actions] = await Promise.all([
    getAuditLogs({
      organizationId: orgId,
      action: params.action,
      cursor: params.cursor,
    }),
    getDistinctActions(orgId),
  ]);

  const actionList = actions.map((a) => a.action);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="mt-1 text-muted-foreground">
          A timeline of everything that happened in your workspace.
        </p>
      </div>

      <ActivityLog
        items={items}
        actions={actionList}
        currentAction={params.action ?? null}
        nextCursor={nextCursor}
      />
    </div>
  );
}
