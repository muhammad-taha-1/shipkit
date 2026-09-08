import { inngest } from "@/lib/inngest";
import { db } from "@/lib/db";
import { sendEmail } from "@/modules/notifications/send";
import SubscriptionReminder from "../../../emails/subscription-reminder";
import { getOrgOwners } from "@/modules/notifications/recipients";

export const trialEndingReminder = inngest.createFunction(
  {
    id: "trial-ending-reminder",
    triggers: [{ cron: "0 9 * * *" }],
  },
  async () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const startOfDay = new Date(threeDaysFromNow);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const orgs = await db.organization.findMany({
      where: {
        subscriptionStatus: "TRIALING",
        trialEndsAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    let emailsSent = 0;

    for (const org of orgs) {
      const ownerIds = await getOrgOwners(org.id);

      await db.notification.createMany({
        data: ownerIds.map((recipientId) => ({
          type: "BILLING_TRIAL_ENDING" as const,
          title: "Your trial is ending soon",
          body: `Your free trial for ${org.name} ends in 3 days. Upgrade now to keep access to all features.`,
          link: "/billing",
          recipientId,
          organizationId: org.id,
        })),
      });

      const owners = await db.user.findMany({
        where: { id: { in: ownerIds } },
        select: { email: true },
      });

      for (const owner of owners) {
        await sendEmail({
          to: owner.email,
          subject: "Your trial is ending soon",
          react: SubscriptionReminder({
            orgName: org.name,
            type: "trial_ending",
            daysLeft: 3,
          }),
        });
        emailsSent++;
      }
    }

    return { orgsFound: orgs.length, emailsSent };
  },
);
