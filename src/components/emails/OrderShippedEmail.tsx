import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import { BRAND_PHONE_DISPLAY } from "@/lib/seo";
import { absoluteUrl } from "@/lib/seo";

export interface OrderShippedEmailProps {
  customerName: string;
  orderId: string;
  courierName?: string;
  trackingNumber?: string;
}

export function OrderShippedEmail({
  customerName,
  orderId,
  courierName,
  trackingNumber,
}: OrderShippedEmailProps) {
  const trackUrl = absoluteUrl(`/track?order=${orderId}`);

  return (
    <Html lang="en">
      <Head />
      <Preview>Your Karachi Toys order {orderId} is on its way! 🚚</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🧸 Karachi Toy Shop</Heading>
            <Text style={headerSubtitle}>Order Shipped</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>Hi {customerName}! 🎉</Heading>
            <Text style={text}>
              Great news! Your order <strong>{orderId}</strong> has been shipped
              and is on its way to you.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Courier info */}
          {(courierName || trackingNumber) && (
            <Section style={section}>
              <Heading as="h3" style={h3}>Courier Details</Heading>
              {courierName && (
                <Text style={text}>
                  <strong>Courier:</strong> {courierName}
                </Text>
              )}
              {trackingNumber && (
                <Text style={text}>
                  <strong>Tracking #:</strong> {trackingNumber}
                </Text>
              )}
            </Section>
          )}

          <Hr style={hr} />

          {/* Track order */}
          <Section style={trackSection}>
            <Text style={trackLabel}>Track Your Order</Text>
            <Text style={trackCode}>{orderId}</Text>
            <Text style={trackHint}>
              Visit{" "}
              <a href={trackUrl} style={link}>
                karachitoys.com/track
              </a>{" "}
              and enter your Order ID and email to check the latest status.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              📞 {BRAND_PHONE_DISPLAY} &nbsp;·&nbsp; ✉️
              karachitoyshop@gmail.com
            </Text>
            <Text style={footerText}>
              📍 Multan, Pakistan &nbsp;·&nbsp; 🌐 karachitoys.com
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or WhatsApp us.
            </Text>
            <Text style={footerMuted}>
              © {new Date().getFullYear()} Karachi Toy Shop. All rights reserved.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f0f0f0",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "32px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  padding: "28px 32px",
  textAlign: "center",
};

const headerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const headerSubtitle: React.CSSProperties = {
  color: "#22c55e",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: 0,
};

const section: React.CSSProperties = { padding: "24px 32px" };

const h2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0a0a0a",
  margin: "0 0 8px",
};

const h3: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  margin: "0 0 10px",
};

const text: React.CSSProperties = {
  fontSize: "14px",
  color: "#444",
  lineHeight: "1.6",
  margin: 0,
};

const hr: React.CSSProperties = { borderColor: "#eeeeee", margin: 0 };

const trackSection: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  padding: "20px 32px",
  textAlign: "center",
};

const trackLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#15803d",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  margin: "0 0 6px",
};

const trackCode: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#0a0a0a",
  letterSpacing: "0.08em",
  margin: "0 0 6px",
  fontFamily: "'Courier New', Courier, monospace",
};

const trackHint: React.CSSProperties = {
  fontSize: "12px",
  color: "#666",
  margin: 0,
};

const footerSection: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  padding: "20px 32px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaa",
  margin: "0 0 4px",
  lineHeight: "1.6",
};

const footerMuted: React.CSSProperties = {
  fontSize: "10px",
  color: "#666",
  margin: "12px 0 0",
};

const link: React.CSSProperties = {
  color: "#22c55e",
  textDecoration: "underline",
};
