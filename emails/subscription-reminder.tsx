import * as React from "react";
import { EmailLayout, Text, Button, Section, heading, paragraph, buttonStyle } from "./components";

interface SubscriptionReminderProps {
  orgName: string;
  type: "trial_ending" | "payment_failed";
  daysLeft?: number;
}

export default function SubscriptionReminder({
  orgName = "Acme Inc",
  type = "trial_ending",
  daysLeft = 3,
}: SubscriptionReminderProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const isTrialEnding = type === "trial_ending";

  return (
    <EmailLayout
      preview={
        isTrialEnding
          ? `Your trial ends in ${daysLeft} days`
          : "Action required: payment failed"
      }
    >
      <Text style={heading}>
        {isTrialEnding ? "Your trial is ending soon" : "Payment failed"}
      </Text>
      {isTrialEnding ? (
        <Text style={paragraph}>
          Your free trial for <strong>{orgName}</strong> ends in{" "}
          <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>. Upgrade
          now to keep access to all features.
        </Text>
      ) : (
        <Text style={paragraph}>
          We were unable to process the payment for <strong>{orgName}</strong>.
          Please update your payment method to avoid service interruption.
        </Text>
      )}
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={`${appUrl}/billing`} style={buttonStyle}>
          {isTrialEnding ? "Upgrade Now" : "Update Payment Method"}
        </Button>
      </Section>
    </EmailLayout>
  );
}
