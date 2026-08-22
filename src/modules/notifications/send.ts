import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY?.startsWith("re_")) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return { data: { id: "dev-mock" }, error: null };
  }

  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    react,
  });
}
