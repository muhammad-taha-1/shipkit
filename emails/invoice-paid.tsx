import * as React from "react";
import { EmailLayout, Text, Button, Section, heading, paragraph, buttonStyle } from "./components";

interface InvoicePaidProps {
  orgName: string;
  planName: string;
  amount: string;
}

export default function InvoicePaid({
  orgName = "Acme Inc",
  planName = "Pro",
  amount = "$29.00",
}: InvoicePaidProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <EmailLayout preview={`Payment received — ${amount}`}>
      <Text style={heading}>Payment received</Text>
      <Text style={paragraph}>
        Your payment of <strong>{amount}</strong> for the{" "}
        <strong>{planName}</strong> plan has been successfully processed for{" "}
        <strong>{orgName}</strong>.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={`${appUrl}/billing`} style={buttonStyle}>
          View Billing
        </Button>
      </Section>
    </EmailLayout>
  );
}
