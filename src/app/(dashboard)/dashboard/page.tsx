import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/guards";
import { getActiveOrgId } from "@/hooks/use-current-org";
import { db } from "@/lib/db";
import { plans } from "@/modules/billing/plans";
import { getRecentActivity } from "@/modules/audit/log";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const user = await requireAuth();
  const orgId = await getActiveOrgId(user.id);
  if (!orgId) redirect("/onboarding");

  const [org, activity] = await Promise.all([
    db.organization.findUniqueOrThrow({
      where: { id: orgId },
      include: {
        _count: { select: { members: true, apiKeys: true } },
      },
    }),
    getRecentActivity(orgId),
  ]);

  const plan = plans[org.plan];

  let daysUntilRenewal: number | null = null;
  let trialDaysLeft: number | null = null;

  if (
    org.subscriptionStatus === "TRIALING" &&
    org.trialEndsAt
  ) {
    trialDaysLeft = Math.max(
      0,
      Math.ceil(
        (org.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
  } else if (
    org.subscriptionStatus === "ACTIVE" &&
    org.subscriptionId
  ) {
    daysUntilRenewal = 30;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your workspace.
        </p>
      </div>

      <StatsCards
        memberCount={org._count.members}
        apiKeyCount={org._count.apiKeys}
        planName={plan.name}
        daysUntilRenewal={daysUntilRenewal}
        trialDaysLeft={trialDaysLeft}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <RecentActivity items={activity} />
        <QuickActions />
      </div>
    </div>
  );
}
