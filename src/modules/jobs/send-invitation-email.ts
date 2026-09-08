import { inngest } from "@/lib/inngest";
import { sendEmail } from "@/modules/notifications/send";
import InviteMember from "../../../emails/invite-member";

export const sendInvitationEmail = inngest.createFunction(
  {
    id: "send-invitation-email",
    retries: 3,
    triggers: [{ event: "email/invitation.send" }],
  },
  async ({ event }) => {
    const { to, inviterName, orgName, role, acceptUrl } = event.data as {
      to: string;
      inviterName: string;
      orgName: string;
      role: string;
      acceptUrl: string;
    };

    const result = await sendEmail({
      to,
      subject: `You've been invited to join ${orgName} — ShipKit`,
      react: InviteMember({ inviterName, orgName, role, acceptUrl }),
    });

    if (result.error) {
      throw new Error(
        `Failed to send invitation email to ${to}: ${JSON.stringify(result.error)}`,
      );
    }

    return { emailId: result.data?.id };
  },
);
