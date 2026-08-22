import { type PlanType } from "@/generated/prisma/client";

export type PlanDefinition = {
  name: string;
  description: string;
  price: number;
  stripePriceId: string | null;
  features: string[];
  limits: {
    maxMembers: number;
    maxApiKeys: number;
  };
};

export const plans: Record<PlanType, PlanDefinition> = {
  FREE: {
    name: "Free",
    description: "For individuals getting started",
    price: 0,
    stripePriceId: null,
    features: [
      "1 organization",
      "Up to 3 team members",
      "Basic analytics",
      "Community support",
    ],
    limits: {
      maxMembers: 3,
      maxApiKeys: 1,
    },
  },
  PRO: {
    name: "Pro",
    description: "For growing teams",
    price: 2900,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "Unlimited organizations",
      "Up to 20 team members",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
    ],
    limits: {
      maxMembers: 20,
      maxApiKeys: 10,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large organizations",
    price: 9900,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO/SAML (coming soon)",
      "Audit logs",
      "Dedicated support",
      "SLA guarantee",
      "Unlimited API keys",
    ],
    limits: {
      maxMembers: Infinity,
      maxApiKeys: Infinity,
    },
  },
};

export function getPlan(planType: PlanType): PlanDefinition {
  return plans[planType];
}
