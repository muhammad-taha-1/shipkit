import Link from "next/link";
import { plans } from "@/modules/billing/plans";
import { type PlanType } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start for free. Upgrade when you need more power.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {(Object.entries(plans) as [PlanType, (typeof plans)[PlanType]][]).map(
          ([key, plan]) => {
            const isPopular = key === "PRO";
            return (
              <Card
                key={key}
                className={
                  isPopular
                    ? "relative border-primary shadow-lg ring-2 ring-primary"
                    : ""
                }
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${(plan.price / 100).toFixed(0)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    render={<Link href="/register" />}
                  >
                    {key === "FREE" ? "Get Started" : "Start Free Trial"}
                  </Button>
                </CardFooter>
              </Card>
            );
          },
        )}
      </div>

      <div className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Frequently asked questions
        </h2>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h3 className="font-semibold">Can I change my plan later?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade at any time. Changes take effect
              immediately and are prorated.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Is there a free trial?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes! All paid plans come with a 14-day free trial. No credit card
              required to start.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">What happens when I cancel?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your subscription will remain active until the end of your billing
              period. After that, your workspace will revert to the Free plan.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Do you offer refunds?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We offer a full refund within the first 30 days if you are not
              satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
