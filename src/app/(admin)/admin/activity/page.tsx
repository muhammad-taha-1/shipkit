import { Suspense } from "react";
import { requireSuperAdmin } from "@/modules/auth/guards";
import {
  getSystemAuditLogs,
  getSystemDistinctActions,
} from "@/modules/admin/queries";
import { SystemActivityLog } from "./system-activity-log";

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; cursor?: string }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;

  const [{ items, nextCursor }, actions] = await Promise.all([
    getSystemAuditLogs({
      action: params.action,
      cursor: params.cursor,
    }),
    getSystemDistinctActions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          System Activity Log
        </h1>
        <p className="mt-1 text-muted-foreground">
          A timeline of all activity across all organizations.
        </p>
      </div>

      <Suspense>
        <SystemActivityLog
          items={items}
          actions={actions}
          currentAction={params.action ?? null}
          nextCursor={nextCursor}
        />
      </Suspense>
    </div>
  );
}
