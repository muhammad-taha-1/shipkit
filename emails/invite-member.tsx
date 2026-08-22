import * as React from "react";
import { EmailLayout, Text, Button, Section, heading, paragraph, buttonStyle } from "./components";

interface InviteMemberProps {
  inviterName: string;
  orgName: string;
  role: string;
  acceptUrl: string;
}

export default function InviteMember({
  inviterName = "Someone",
  orgName = "Acme Inc",
  role = "Member",
  acceptUrl = "http://localhost:3000/accept-invite?token=abc",
}: InviteMemberProps) {
  return (
    <EmailLayout preview={`You've been invited to join ${orgName}`}>
      <Text style={heading}>You&apos;re invited!</Text>
      <Text style={paragraph}>
        {inviterName} has invited you to join <strong>{orgName}</strong> as a{" "}
        <strong>{role}</strong>.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={acceptUrl} style={buttonStyle}>
          Accept Invitation
        </Button>
      </Section>
      <Text style={paragraph}>
        This invitation will expire in 7 days. If you don&apos;t have an account yet,
        you&apos;ll be prompted to create one.
      </Text>
    </EmailLayout>
  );
}
