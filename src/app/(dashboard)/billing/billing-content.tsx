"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  resumeSubscription,
} from "@/modules/billing/actions";
import { plans } from "@/modules/billing/plans";
import { type PlanType, type SubscriptionStatus } from "@/generated/prisma/client";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

const statusColors: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  TRIALING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PAST_DUE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  CANCELED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  UNPAID: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  INCOMPLETE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function BillingContent({
  orgId,
  currentPlan,
  planName,
  subscriptionStatus,
  memberCount,
  memberLimit,
  apiKeyCount,
  apiKeyLimit,
  canManageBilling,
  hasStripeCustomer,
}: {
  orgId: string;
  currentPlan: PlanType;
  planName: string;
  subscriptionStatus: SubscriptionStatus;
  memberCount: number;
  memberLimit: number;
  apiKeyCount: number;
  apiKeyLimit: number;
  canManageBilling: boolean;
  hasStripeCustomer: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome to your new plan.");
      router.replace("/billing");
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout was canceled.");
      router.replace("/billing");
    }
  }, [searchParams, router]);

  async function handleUpgrade(planKey: PlanType) {
    const plan = plans[planKey];
    if (!plan.stripePriceId) return;
    setLoading(planKey);
    try {
      await createCheckoutSession(orgId, plan.stripePriceId);
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
    setLoading(null);
  }

  async function handleManageBilling() {
    setLoading("portal");
    try {
      await createBillingPortalSession(orgId);
    } catch {
      toast.error("Failed to open billing portal.");
    }
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("cancel");
    const result = await cancelSubscription(orgId);
    if (result.success) {
      toast.success("Subscription will cancel at end of billing period.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  }

  async function handleResume() {
    setLoading("resume");
    const result = await resumeSubscription(orgId);
    if (result.success) {
      toast.success("Subscription resumed!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  }

  const memberPercent = memberLimit === Infinity ? 0 : (memberCount / memberLimit) * 100;
  const apiKeyPercent = apiKeyLimit === Infinity ? 0 : (apiKeyCount / apiKeyLimit) * 100;

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are on the <span className="font-semibold">{planName}</span> plan.
              </CardDescription>
            </div>
            <Badge className={statusColors[subscriptionStatus]}>
              {subscriptionStatus.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Team Members</span>
              <span>
                {memberCount} / {memberLimit === Infinity ? "Unlimited" : memberLimit}
              </span>
            </div>
            {memberLimit !== Infinity && (
              <Progress value={memberPercent} className="h-2" />
            )}
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>API Keys</span>
              <span>
                {apiKeyCount} / {apiKeyLimit === Infinity ? "Unlimited" : apiKeyLimit}
              </span>
            </div>
            {apiKeyLimit !== Infinity && (
              <Progress value={apiKeyPercent} className="h-2" />
            )}
          </div>
        </CardContent>
        {canManageBilling && (
          <CardFooter className="flex gap-2">
            {hasStripeCustomer && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={loading === "portal"}
              >
                {loading === "portal" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            )}
            {currentPlan !== "FREE" && subscriptionStatus === "ACTIVE" && (
              <Button variant="destructive" onClick={handleCancel} disabled={loading === "cancel"}>
                {loading === "cancel" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Subscription
              </Button>
            )}
            {subscriptionStatus === "CANCELED" && currentPlan !== "FREE" && (
              <Button onClick={handleResume} disabled={loading === "resume"}>
                {loading === "resume" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resume Subscription
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Plan Selection */}
      {canManageBilling && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            {currentPlan === "FREE" ? "Upgrade your plan" : "Change plan"}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(Object.entries(plans) as [PlanType, (typeof plans)[PlanType]][]).map(
              ([key, plan]) => {
                const isCurrent = key === currentPlan;
                return (
                  <Card
                    key={key}
                    className={isCurrent ? "border-primary ring-2 ring-primary" : ""}
                  >
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          ${(plan.price / 100).toFixed(0)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground">/month</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrent ? (
                        <Button className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : key === "FREE" ? (
                        <Button className="w-full" variant="outline" disabled>
                          Downgrade via portal
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleUpgrade(key)}
                          disabled={loading === key || !plan.stripePriceId}
                        >
                          {loading === key && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {currentPlan === "FREE" ? "Upgrade" : "Switch"} to {plan.name}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
}
