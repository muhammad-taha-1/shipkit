import * as React from "react";
import { EmailLayout, Text, Button, Section, heading, paragraph, buttonStyle } from "./components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name = "there" }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <EmailLayout preview="Welcome to ShipKit!">
      <Text style={heading}>Welcome to ShipKit!</Text>
      <Text style={paragraph}>
        Hi {name}, thanks for signing up. We&apos;re excited to have you on board.
      </Text>
      <Text style={paragraph}>
        Get started by creating your first workspace and inviting your team.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={`${appUrl}/dashboard`} style={buttonStyle}>
          Go to Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
}
