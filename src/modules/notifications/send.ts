import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM;
if (!EMAIL_FROM && process.env.NODE_ENV === "production") {
  throw new Error("EMAIL_FROM environment variable is required in production");
}

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

  const from = EMAIL_FROM ?? "ShipKit <noreply@localhost>";

  return resend.emails.send({
    from,
    to,
    subject,
    react,
  });
}
