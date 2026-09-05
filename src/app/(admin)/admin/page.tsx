import { requireSuperAdmin } from "@/modules/auth/guards";
import {
  getAdminStats,
  getRecentSystemActivity,
} from "@/modules/admin/queries";
import { AdminStatsCards } from "./admin-stats-cards";
import { AdminRecentActivity } from "./admin-recent-activity";
import { AdminQuickLinks } from "./admin-quick-links";

export default async function AdminPage() {
  await requireSuperAdmin();

  const [stats, recentActivity] = await Promise.all([
    getAdminStats(),
    getRecentSystemActivity(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          System-wide overview and management.
        </p>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <AdminRecentActivity items={recentActivity} />
        <AdminQuickLinks />
      </div>
    </div>
  );
}
