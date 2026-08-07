import * as React from "react";
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "react-email";
import { BRAND_ADDRESS, BRAND_PHONE_DISPLAY } from "@/lib/seo";

export interface OtpEmailProps {
  name?: string;
  code: string;
  purpose: "login" | "save_account";
}

export function OtpEmail({ name, code, purpose }: OtpEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const action   = purpose === "save_account" ? "save your account" : "sign in";

  return (
    <Html lang="en">
      <Head />
      <Preview>Your Karachi Toys verification code: {code}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={header}>
            <Text style={logo}>Karachi Toys</Text>
            <Text style={logoSub}>Verification Code</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>{greeting}</Heading>
            <Text style={para}>
              You requested a one-time code to <strong>{action}</strong> on
              Karachi Toy Shop. Use the code below — it expires in{" "}
              <strong>10 minutes</strong>.
            </Text>

            <Section style={codeBox}>
              <Text style={codeText}>{code}</Text>
            </Section>

            <Text style={para}>
              If you did not request this code, you can safely ignore this
              email. Your account remains secure.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Karachi Toy Shop &nbsp;·&nbsp; {BRAND_ADDRESS}
            </Text>
            <Text style={footerText}>
              {BRAND_PHONE_DISPLAY} &nbsp;·&nbsp; karachitoyshop@gmail.com
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

const body: React.CSSProperties = {
  backgroundColor: "#f0f0f0",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};
const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};
const header: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  padding: "32px 40px 24px",
  textAlign: "center",
};
const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: "0 0 4px",
};
const logoSub: React.CSSProperties = {
  color: "#f59e0b",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  margin: 0,
};
const content: React.CSSProperties = { padding: "36px 40px 28px" };
const h2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0a0a0a",
  margin: "0 0 12px",
};
const para: React.CSSProperties = {
  fontSize: "15px",
  color: "#555",
  lineHeight: "1.65",
  margin: "0 0 24px",
};
const codeBox: React.CSSProperties = {
  backgroundColor: "#f8f4ff",
  border: "2px dashed #c4b5fd",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  margin: "0 0 24px",
};
const codeText: React.CSSProperties = {
  fontSize: "42px",
  fontWeight: "800",
  letterSpacing: "0.3em",
  color: "#0a0a0a",
  margin: 0,
  fontFamily: "'Courier New', Courier, monospace",
};
const hr: React.CSSProperties = { borderColor: "#eeeeee", margin: 0 };
const footer: React.CSSProperties = {
  padding: "20px 40px 28px",
  textAlign: "center",
};
const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#888",
  margin: "0 0 4px",
};
const footerMuted: React.CSSProperties = {
  fontSize: "11px",
  color: "#bbb",
  margin: "12px 0 0",
};
