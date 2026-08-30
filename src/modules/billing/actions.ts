"use server";

import { db } from "@/lib/db";
import { stripe } from "./stripe";
import { requireOrgRole } from "@/modules/auth/guards";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/modules/audit/log";
import { createNotification } from "@/modules/notifications/create";
import { getOrgAdminsAndOwners } from "@/modules/notifications/recipients";
import { AppError } from "@/lib/errors";

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
  try {
    const { user } = await requireOrgRole(orgId, ["OWNER", "ADMIN"]);

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
      metadata: { orgId, userId: user.id },
    });

    if (session.url) {
      redirect(session.url);
    }

    return { success: false, error: "Failed to create checkout session" };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export async function createBillingPortalSession(orgId: string) {
  try {
    await requireOrgRole(orgId, ["OWNER", "ADMIN"]);
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

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
  try {
    const { user } = await requireOrgRole(orgId, ["OWNER"]);

    const org = await db.organization.findUniqueOrThrow({
      where: { id: orgId },
    });

    if (!org.subscriptionId) {
      return { success: false, error: "No active subscription" };
    }

    await stripe.subscriptions.update(org.subscriptionId, {
      cancel_at_period_end: true,
    });

    await createAuditLog({
      action: "billing.subscription_canceled",
      entityType: "subscription",
      organizationId: orgId,
      userId: user.id,
    });

    const adminIds = await getOrgAdminsAndOwners(orgId);
    await createNotification({
      type: "BILLING_SUBSCRIPTION_CANCELED",
      title: "Subscription canceled",
      body: `${user.name ?? user.email} canceled the subscription. It will remain active until the end of the billing period.`,
      link: "/billing",
      actorId: user.id,
      recipientIds: adminIds,
      organizationId: orgId,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export async function resumeSubscription(orgId: string) {
  try {
    const { user } = await requireOrgRole(orgId, ["OWNER"]);

    const org = await db.organization.findUniqueOrThrow({
      where: { id: orgId },
    });

    if (!org.subscriptionId) {
      return { success: false, error: "No subscription to resume" };
    }

    await stripe.subscriptions.update(org.subscriptionId, {
      cancel_at_period_end: false,
    });

    await createAuditLog({
      action: "billing.subscription_resumed",
      entityType: "subscription",
      organizationId: orgId,
      userId: user.id,
    });

    const adminIds = await getOrgAdminsAndOwners(orgId);
    await createNotification({
      type: "BILLING_SUBSCRIPTION_RESUMED",
      title: "Subscription resumed",
      body: `${user.name ?? user.email} resumed the subscription`,
      link: "/billing",
      actorId: user.id,
      recipientIds: adminIds,
      organizationId: orgId,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}
