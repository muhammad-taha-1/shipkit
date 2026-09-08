import { inngest } from "@/lib/inngest";
import { cleanupExpiredTokens } from "@/modules/auth/cleanup";

export const cleanupExpiredTokensJob = inngest.createFunction(
  {
    id: "cleanup-expired-tokens",
    triggers: [{ cron: "0 0 * * *" }],
  },
  async () => {
    const result = await cleanupExpiredTokens();
    return result;
  },
);
