import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/modules/billing/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";
import { type PlanType, type SubscriptionStatus } from "@/generated/prisma/client";
import { createAuditLog } from "@/modules/audit/log";
import { createNotification } from "@/modules/notifications/create";
import { getOrgAdminsAndOwners, getOrgOwners } from "@/modules/notifications/recipients";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const existing = await db.processedStripeEvent.findUnique({
    where: { eventId: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    await db.processedStripeEvent.create({
      data: { eventId: event.id, type: event.type },
    });
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapStripePriceToplan(priceId: string): PlanType {
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "ENTERPRISE";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  return "FREE";
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const mapping: Record<string, SubscriptionStatus> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    trialing: "TRIALING",
    incomplete: "INCOMPLETE",
  };
  return mapping[status] ?? "ACTIVE";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId;
  if (!orgId || !session.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? mapStripePriceToplan(priceId) : "PRO";

  await db.organization.update({
    where: { id: orgId },
    data: {
      stripeCustomerId: session.customer as string,
      subscriptionId: subscription.id,
      subscriptionStatus: mapStripeStatus(subscription.status),
      plan,
    },
  });

  await createAuditLog({
    action: "billing.subscription_created",
    entityType: "subscription",
    entityId: subscription.id,
    organizationId: orgId,
    userId: session.metadata?.userId ?? undefined,
    metadata: { plan },
  });

  const adminIds = await getOrgAdminsAndOwners(orgId);
  await createNotification({
    type: "BILLING_SUBSCRIPTION_CREATED",
    title: "Subscription activated",
    body: `Your ${plan} plan is now active`,
    link: "/billing",
    actorId: session.metadata?.userId ?? undefined,
    recipientIds: adminIds,
    organizationId: orgId,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.orgId;
  if (!orgId) return;

  const priceId = subscription.items.data[0]?.price.id;

  await db.organization.update({
    where: { id: orgId },
    data: {
      subscriptionStatus: mapStripeStatus(subscription.status),
      plan: priceId ? mapStripePriceToplan(priceId) : undefined,
    },
  });

  await createAuditLog({
    action: "billing.subscription_updated",
    entityType: "subscription",
    entityId: subscription.id,
    organizationId: orgId,
    metadata: { status: subscription.status },
  });

  const adminIds = await getOrgAdminsAndOwners(orgId);
  await createNotification({
    type: "BILLING_SUBSCRIPTION_UPDATED",
    title: "Subscription updated",
    body: `Your subscription status is now ${subscription.status}`,
    link: "/billing",
    recipientIds: adminIds,
    organizationId: orgId,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.orgId;
  if (!orgId) return;

  await db.organization.update({
    where: { id: orgId },
    data: {
      plan: "FREE",
      subscriptionStatus: "CANCELED",
      subscriptionId: null,
    },
  });

  await createAuditLog({
    action: "billing.subscription_deleted",
    entityType: "subscription",
    entityId: subscription.id,
    organizationId: orgId,
    metadata: { previousPlan: subscription.items.data[0]?.price.id ?? null },
  });

  const adminIds = await getOrgAdminsAndOwners(orgId);
  await createNotification({
    type: "BILLING_SUBSCRIPTION_DELETED",
    title: "Subscription ended",
    body: "Your subscription has been permanently deleted. You are now on the Free plan.",
    link: "/billing",
    recipientIds: adminIds,
    organizationId: orgId,
  });
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const org = await db.organization.findFirst({
    where: { subscriptionId },
  });
  if (!org) return;

  await db.organization.update({
    where: { id: org.id },
    data: { subscriptionStatus: "ACTIVE" },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const org = await db.organization.findFirst({
    where: { subscriptionId },
  });
  if (!org) return;

  await db.organization.update({
    where: { id: org.id },
    data: { subscriptionStatus: "PAST_DUE" },
  });

  const ownerIds = await getOrgOwners(org.id);
  await createNotification({
    type: "INVOICE_PAYMENT_FAILED",
    title: "Payment failed",
    body: "Your latest invoice payment failed. Please update your payment method to avoid service interruption.",
    link: "/billing",
    recipientIds: ownerIds,
    organizationId: org.id,
  });
}
