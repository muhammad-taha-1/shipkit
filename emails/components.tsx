import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  margin: "40px auto",
  padding: "40px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#525f7f",
  margin: "0 0 16px",
};

const buttonStyle = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block" as const,
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const footer = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#8898aa",
  marginTop: "32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  const appName = "ShipKit";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={{ fontSize: "20px", fontWeight: "700", color: "#18181b", margin: "0 0 24px" }}>
            {appName}
          </Text>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            This email was sent by{" "}
            <Link href={appUrl} style={{ color: "#525f7f" }}>
              {appName}
            </Link>
            . If you didn&apos;t expect this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export { heading, paragraph, buttonStyle, hr };
export { Button, Link, Section, Text, Hr } from "@react-email/components";
