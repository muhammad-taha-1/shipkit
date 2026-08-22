"use server";

import { db } from "@/lib/db";
import { stripe } from "./stripe";
import { requireOrgRole } from "@/modules/auth/guards";
import { redirect } from "next/navigation";

async function getOrCreateStripeCustomer(orgId: string) {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    include: {
      members: {
        where: { role: "OWNER" },
        include: { user: true },
        take: 1,
      },
    },
  });

  if (org.stripeCustomerId) {
    return org.stripeCustomerId;
  }

  const owner = org.members[0]?.user;
  const customer = await stripe.customers.create({
    name: org.name,
    email: owner?.email,
    metadata: { orgId: org.id },
  });

  await db.organization.update({
    where: { id: orgId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(orgId: string, priceId: string) {
  await requireOrgRole(orgId, ["OWNER", "ADMIN"]);

  const customerId = await getOrCreateStripeCustomer(orgId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/billing?canceled=true`,
    subscription_data: {
      metadata: { orgId },
    },
    metadata: { orgId },
  });

  if (session.url) {
    redirect(session.url);
  }

  return { success: false, error: "Failed to create checkout session" };
}

export async function createBillingPortalSession(orgId: string) {
  await requireOrgRole(orgId, ["OWNER", "ADMIN"]);

  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
  });

  if (!org.stripeCustomerId) {
    return { success: false, error: "No billing account found" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${appUrl}/billing`,
  });

  redirect(session.url);
}

export async function cancelSubscription(orgId: string) {
  await requireOrgRole(orgId, ["OWNER"]);

  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
  });

  if (!org.subscriptionId) {
    return { success: false, error: "No active subscription" };
  }

  await stripe.subscriptions.update(org.subscriptionId, {
    cancel_at_period_end: true,
  });

  await db.organization.update({
    where: { id: orgId },
    data: { subscriptionStatus: "CANCELED" },
  });

  return { success: true };
}

export async function resumeSubscription(orgId: string) {
  await requireOrgRole(orgId, ["OWNER"]);

  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
  });

  if (!org.subscriptionId) {
    return { success: false, error: "No subscription to resume" };
  }

  await stripe.subscriptions.update(org.subscriptionId, {
    cancel_at_period_end: false,
  });

  await db.organization.update({
    where: { id: orgId },
    data: { subscriptionStatus: "ACTIVE" },
  });

  return { success: true };
}
