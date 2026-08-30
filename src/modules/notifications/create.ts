import "server-only";
import { db } from "@/lib/db";
import { type NotificationType } from "@/generated/prisma/client";
import { notificationConfig } from "./types";
import { sendEmail } from "./send";
import NotificationEmail from "../../../emails/notification";

type CreateNotificationParams = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  actorId?: string;
  recipientIds: string[];
  organizationId?: string;
};

export async function createNotification({
  type,
  title,
  body,
  link,
  actorId,
  recipientIds,
  organizationId,
}: CreateNotificationParams) {
  if (recipientIds.length === 0) return;

  const preferences = await db.notificationPreference.findMany({
    where: { userId: { in: recipientIds }, type },
  });

  const prefMap = new Map(preferences.map((p) => [p.userId, p]));
  const config = notificationConfig[type];

  const inAppRecipients: string[] = [];
  const emailRecipientIds: string[] = [];

  for (const recipientId of recipientIds) {
    if (recipientId === actorId) continue;

    const pref = prefMap.get(recipientId);
    const inAppEnabled = pref ? pref.inApp : config.defaultInApp;
    const emailEnabled = pref ? pref.email : config.defaultEmail;

    if (inAppEnabled) inAppRecipients.push(recipientId);
    if (emailEnabled) emailRecipientIds.push(recipientId);
  }

  if (inAppRecipients.length > 0) {
    await db.notification.createMany({
      data: inAppRecipients.map((recipientId) => ({
        type,
        title,
        body,
        link,
        actorId,
        recipientId,
        organizationId,
      })),
    });
  }

  if (emailRecipientIds.length > 0) {
    const recipients = await db.user.findMany({
      where: { id: { in: emailRecipientIds } },
      select: { id: true, email: true, name: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = link ? `${appUrl}${link}` : undefined;

    await Promise.allSettled(
      recipients.map((recipient) =>
        sendEmail({
          to: recipient.email,
          subject: title,
          react: NotificationEmail({
            title,
            body,
            link: fullLink,
            recipientName: recipient.name,
          }),
        }),
      ),
    );
  }
}
