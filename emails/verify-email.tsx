import * as React from "react";
import { EmailLayout, Text, Button, Section, heading, paragraph, buttonStyle } from "./components";

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export default function VerifyEmail({
  name = "there",
  verifyUrl = "http://localhost:3000/verify-email?token=abc",
}: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your email address">
      <Text style={heading}>Verify your email</Text>
      <Text style={paragraph}>
        Hi {name}, please verify your email address by clicking the button below.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={verifyUrl} style={buttonStyle}>
          Verify Email Address
        </Button>
      </Section>
      <Text style={paragraph}>
        This link will expire in 24 hours. If you didn&apos;t create an account, you can
        safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
