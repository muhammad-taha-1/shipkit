import { inngest } from "@/lib/inngest";
import { db } from "@/lib/db";

export const cleanupOldStripeEvents = inngest.createFunction(
  {
    id: "cleanup-old-stripe-events",
    triggers: [{ cron: "0 0 1 * *" }],
  },
  async () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await db.processedStripeEvent.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });

    return { deleted: result.count };
  },
);
