import { sendNotificationEmail } from "./send-notification-email";
import { sendInvitationEmail } from "./send-invitation-email";
import { cleanupExpiredTokensJob } from "./cleanup-expired-tokens";
import { cleanupOldStripeEvents } from "./cleanup-old-stripe-events";
import { trialEndingReminder } from "./trial-ending-reminder";

export const functions = [
  sendNotificationEmail,
  sendInvitationEmail,
  cleanupExpiredTokensJob,
  cleanupOldStripeEvents,
  trialEndingReminder,
];
