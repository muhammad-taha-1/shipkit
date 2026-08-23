import { requireAuth } from "@/modules/auth/guards";
import { getActiveOrgId } from "@/hooks/use-current-org";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BillingContent } from "./billing-content";
import { plans } from "@/modules/billing/plans";

export default async function BillingPage() {
  const user = await requireAuth();
  const orgId = await getActiveOrgId(user.id);
  if (!orgId) redirect("/onboarding");

  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    include: {
      _count: { select: { members: true, apiKeys: true } },
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
  });

  const currentPlan = plans[org.plan];
  const userRole = org.members[0]?.role;
  const canManageBilling = userRole === "OWNER" || userRole === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <BillingContent
        orgId={orgId}
        currentPlan={org.plan}
        planName={currentPlan.name}
        subscriptionStatus={org.subscriptionStatus}
        memberCount={org._count.members}
        memberLimit={currentPlan.limits.maxMembers}
        apiKeyCount={org._count.apiKeys}
        apiKeyLimit={currentPlan.limits.maxApiKeys}
        canManageBilling={canManageBilling}
        hasStripeCustomer={!!org.stripeCustomerId}
      />
    </div>
  );
}
