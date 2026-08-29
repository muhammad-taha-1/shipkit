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
    maxStorageBytes: number;
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
      "100 MB file storage",
      "Community support",
    ],
    limits: {
      maxMembers: 3,
      maxApiKeys: 1,
      maxStorageBytes: 100 * 1024 * 1024,
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
      "5 GB file storage",
      "API access",
    ],
    limits: {
      maxMembers: 20,
      maxApiKeys: 10,
      maxStorageBytes: 5 * 1024 * 1024 * 1024,
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
      "50 GB file storage",
      "Unlimited API keys",
    ],
    limits: {
      maxMembers: Infinity,
      maxApiKeys: Infinity,
      maxStorageBytes: 50 * 1024 * 1024 * 1024,
    },
  },
};

export function getPlan(planType: PlanType): PlanDefinition {
  return plans[planType];
}
