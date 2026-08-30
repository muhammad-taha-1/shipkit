import * as React from "react";
import {
  EmailLayout,
  Text,
  Button,
  Section,
  heading,
  paragraph,
  buttonStyle,
} from "./components";

interface NotificationEmailProps {
  title: string;
  body: string;
  link?: string;
  recipientName: string | null;
}

export default function NotificationEmail({
  title = "Notification",
  body = "You have a new notification.",
  link,
  recipientName,
}: NotificationEmailProps) {
  return (
    <EmailLayout preview={title}>
      <Text style={heading}>{title}</Text>
      <Text style={paragraph}>
        {recipientName ? `Hi ${recipientName},` : "Hi there,"}
      </Text>
      <Text style={paragraph}>{body}</Text>
      {link && (
        <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
          <Button href={link} style={buttonStyle}>
            View Details
          </Button>
        </Section>
      )}
    </EmailLayout>
  );
}
