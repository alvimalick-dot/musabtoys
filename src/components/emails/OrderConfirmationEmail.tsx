import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "react-email";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  trackingCode: string;
  items: OrderItem[];
  total: number;
}

export function OrderConfirmationEmail({
  customerName,
  orderId,
  trackingCode,
  items,
  total,
}: OrderConfirmationEmailProps) {
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://karachitoys.pk"}/track?order=${orderId}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>Your Karachi Toys order {orderId} is confirmed!</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Karachi Toys</Heading>
            <Text style={headerSubtitle}>Order Confirmation &amp; Invoice</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Heading as="h2" style={h2}>Hi {customerName} 👋</Heading>
            <Text style={text}>
              Thank you for your order! We&apos;ve received it and it&apos;s being
              processed. Your order will be delivered Cash on Delivery — have the
              amount ready when it arrives.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Order Details */}
          <Section style={section}>
            <Heading as="h3" style={h3}>Order Details</Heading>
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>Order ID</Text>
                <Text style={detailValue}>{orderId}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>Tracking Code</Text>
                <Text style={{ ...detailValue, ...trackingBadge }}>{trackingCode}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Invoice */}
          <Section style={section}>
            <Heading as="h3" style={h3}>Invoice Summary</Heading>

            {/* Table header */}
            <Row style={tableHeaderRow}>
              <Column style={{ ...tableCol, width: "55%" }}>
                <Text style={tableHeaderText}>Item</Text>
              </Column>
              <Column style={{ ...tableCol, width: "15%", textAlign: "center" }}>
                <Text style={tableHeaderText}>Qty</Text>
              </Column>
              <Column style={{ ...tableCol, width: "30%", textAlign: "right" }}>
                <Text style={tableHeaderText}>Price</Text>
              </Column>
            </Row>

            {/* Items */}
            {items.map((item, i) => (
              <Row key={i} style={i % 2 === 0 ? tableRowEven : tableRowOdd}>
                <Column style={{ ...tableCol, width: "55%" }}>
                  <Text style={tableCell}>{item.name}</Text>
                </Column>
                <Column style={{ ...tableCol, width: "15%", textAlign: "center" }}>
                  <Text style={tableCell}>{item.quantity}</Text>
                </Column>
                <Column style={{ ...tableCol, width: "30%", textAlign: "right" }}>
                  <Text style={tableCell}>
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </Text>
                </Column>
              </Row>
            ))}

            {/* Total */}
            <Row style={totalRow}>
              <Column style={{ width: "70%" }}>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column style={{ width: "30%", textAlign: "right" }}>
                <Text style={totalValue}>PKR {total.toLocaleString()}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={section}>
            <Text style={footerText}>
              Track your order at{" "}
              <a href={trackUrl} style={link}>
                karachitoys.pk/track
              </a>{" "}
              using your Order ID.
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or WhatsApp us at 0331 3956602.
            </Text>
            <Text style={footerMuted}>
              © {new Date().getFullYear()} Karachi Toy Shop — Multan, Pakistan
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "32px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#1a1530",
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
  color: "#f59e0b",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: 0,
};

const section: React.CSSProperties = {
  padding: "24px 32px",
};

const h2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1a1530",
  margin: "0 0 8px",
};

const h3: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#1a1530",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  margin: "0 0 16px",
};

const text: React.CSSProperties = {
  fontSize: "15px",
  color: "#444",
  lineHeight: "1.6",
  margin: 0,
};

const hr: React.CSSProperties = {
  borderColor: "#eeeeee",
  margin: 0,
};

const detailCell: React.CSSProperties = {
  paddingRight: "24px",
  verticalAlign: "top",
};

const detailLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  margin: "0 0 4px",
};

const detailValue: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1a1530",
  margin: 0,
};

const trackingBadge: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  color: "#92400e",
  padding: "3px 10px",
  borderRadius: "999px",
  fontSize: "14px",
  display: "inline-block",
};

const tableHeaderRow: React.CSSProperties = {
  backgroundColor: "#f8f8f8",
};

const tableHeaderText: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  margin: "8px 0",
  padding: "0 6px",
};

const tableRowEven: React.CSSProperties = { backgroundColor: "#ffffff" };
const tableRowOdd: React.CSSProperties = { backgroundColor: "#fafafa" };

const tableCol: React.CSSProperties = { padding: "0 6px" };

const tableCell: React.CSSProperties = {
  fontSize: "14px",
  color: "#333",
  margin: "10px 0",
};

const totalRow: React.CSSProperties = {
  borderTop: "2px solid #1a1530",
};

const totalLabel: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1a1530",
  margin: "12px 0",
};

const totalValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#e11d48",
  margin: "12px 0",
  textAlign: "right",
};

const footerText: React.CSSProperties = {
  fontSize: "13px",
  color: "#666",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const footerMuted: React.CSSProperties = {
  fontSize: "11px",
  color: "#aaa",
  margin: "16px 0 0",
};

const link: React.CSSProperties = {
  color: "#e11d48",
  textDecoration: "underline",
};
