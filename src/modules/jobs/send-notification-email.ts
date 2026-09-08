import { inngest } from "@/lib/inngest";
import { sendEmail } from "@/modules/notifications/send";
import NotificationEmail from "../../../emails/notification";

export const sendNotificationEmail = inngest.createFunction(
  {
    id: "send-notification-email",
    retries: 3,
    triggers: [{ event: "email/notification.send" }],
  },
  async ({ event }) => {
    const { to, recipientName, title, body, link } = event.data as {
      to: string;
      recipientName: string | null;
      title: string;
      body: string;
      link?: string;
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = link ? `${appUrl}${link}` : undefined;

    const result = await sendEmail({
      to,
      subject: title,
      react: NotificationEmail({ title, body, link: fullLink, recipientName }),
    });

    if (result.error) {
      throw new Error(
        `Failed to send notification email to ${to}: ${JSON.stringify(result.error)}`,
      );
    }

    return { emailId: result.data?.id };
  },
);
