import * as React from "react";
import { EmailLayout, Text, Button, Section, heading, paragraph, buttonStyle } from "./components";

interface ResetPasswordProps {
  name: string;
  resetUrl: string;
}

export default function ResetPassword({
  name = "there",
  resetUrl = "http://localhost:3000/reset-password?token=abc",
}: ResetPasswordProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Text style={heading}>Reset your password</Text>
      <Text style={paragraph}>
        Hi {name}, we received a request to reset your password. Click the button
        below to choose a new one.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={resetUrl} style={buttonStyle}>
          Reset Password
        </Button>
      </Section>
      <Text style={paragraph}>
        This link will expire in 1 hour. If you didn&apos;t request a password reset,
        you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
