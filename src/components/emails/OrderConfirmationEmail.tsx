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
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerArea?: string;
  orderId: string;
  orderDate?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
}

const paymentLabel: Record<string, string> = {
  cod: "Cash on Delivery",
  jazzcash: "JazzCash",
  payfast: "PayFast",
};

export function OrderConfirmationEmail({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCity,
  customerArea,
  orderId,
  orderDate,
  items,
  subtotal,
  shipping,
  discount = 0,
  total,
  paymentMethod = "cod",
}: OrderConfirmationEmailProps) {
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.karachitoys.com/"}/track?order=${orderId}`;
  const displayDate = orderDate ?? new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Html lang="en">
      <Head />
      <Preview>Your Karachi Toys order {orderId} is confirmed!</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🧸 Karachi Toy Shop</Heading>
            <Text style={headerSubtitle}>Tax Invoice / Order Confirmation</Text>
          </Section>

          {/* Shop info bar */}
          <Section style={shopBar}>
            <Text style={shopBarText}>📍 Multan, Pakistan &nbsp;|&nbsp; 📞 0331-3956602 &nbsp;|&nbsp; ✉️ karachitoyshop@gmail.com &nbsp;|&nbsp; 🌐 karachitoys.pk</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Heading as="h2" style={h2}>Hi {customerName}! 👋</Heading>
            <Text style={text}>
              Thank you for shopping with Karachi Toy Shop. Your order has been received and is being processed.
              {paymentMethod === "cod" && " Please have the exact amount ready when your order arrives."}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Order meta — 4 cells */}
          <Section style={section}>
            <Heading as="h3" style={h3}>Order Information</Heading>
            <Row>
              <Column style={detailCell}>
                <Text style={detailLabel}>Order ID</Text>
                <Text style={detailValue}>{orderId}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{displayDate}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>Tracking Code</Text>
                <Text style={{ ...detailValue, ...trackingBadge }}>{orderId}</Text>
              </Column>
              <Column style={detailCell}>
                <Text style={detailLabel}>Payment</Text>
                <Text style={paymentBadge}>{paymentLabel[paymentMethod] ?? paymentMethod}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Bill To / Ship To */}
          <Section style={section}>
            <Row>
              <Column style={{ width: "50%", paddingRight: "16px", verticalAlign: "top" }}>
                <Text style={h3}>Bill To</Text>
                <Text style={addressLine}>{customerName}</Text>
                {customerEmail && <Text style={addressLine}>✉️ {customerEmail}</Text>}
                {customerPhone && <Text style={addressLine}>📞 {customerPhone}</Text>}
              </Column>
              <Column style={{ width: "50%", verticalAlign: "top" }}>
                <Text style={h3}>Ship To</Text>
                <Text style={addressLine}>{customerName}</Text>
                {customerAddress && <Text style={addressLine}>{customerAddress}</Text>}
                {customerArea && <Text style={addressLine}>{customerArea}</Text>}
                {customerCity && <Text style={addressLine}>{customerCity}, Pakistan</Text>}
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Invoice table */}
          <Section style={section}>
            <Heading as="h3" style={h3}>Invoice Summary</Heading>

            <Row style={tableHeaderRow}>
              <Column style={{ ...tableCol, width: "55%" }}><Text style={tableHeaderText}>Item</Text></Column>
              <Column style={{ ...tableCol, width: "15%", textAlign: "center" }}><Text style={tableHeaderText}>Qty</Text></Column>
              <Column style={{ ...tableCol, width: "15%", textAlign: "right" }}><Text style={tableHeaderText}>Unit</Text></Column>
              <Column style={{ ...tableCol, width: "15%", textAlign: "right" }}><Text style={tableHeaderText}>Total</Text></Column>
            </Row>

            {items.map((item, i) => (
              <Row key={i} style={i % 2 === 0 ? tableRowEven : tableRowOdd}>
                <Column style={{ ...tableCol, width: "55%" }}><Text style={tableCell}>{item.name}</Text></Column>
                <Column style={{ ...tableCol, width: "15%", textAlign: "center" }}><Text style={tableCell}>{item.quantity}</Text></Column>
                <Column style={{ ...tableCol, width: "15%", textAlign: "right" }}><Text style={tableCell}>PKR {item.price.toLocaleString()}</Text></Column>
                <Column style={{ ...tableCol, width: "15%", textAlign: "right" }}><Text style={tableCell}>PKR {(item.price * item.quantity).toLocaleString()}</Text></Column>
              </Row>
            ))}

            {/* Summary rows */}
            <Row style={summaryRow}>
              <Column style={{ width: "70%" }}><Text style={summaryLabel}>Subtotal</Text></Column>
              <Column style={{ width: "30%", textAlign: "right" }}><Text style={summaryValue}>PKR {subtotal.toLocaleString()}</Text></Column>
            </Row>
            <Row style={summaryRow}>
              <Column style={{ width: "70%" }}><Text style={summaryLabel}>Shipping</Text></Column>
              <Column style={{ width: "30%", textAlign: "right" }}><Text style={summaryValue}>{shipping === 0 ? "Free" : `PKR ${shipping.toLocaleString()}`}</Text></Column>
            </Row>
            {discount > 0 && (
              <Row style={summaryRow}>
                <Column style={{ width: "70%" }}><Text style={summaryLabel}>Discount</Text></Column>
                <Column style={{ width: "30%", textAlign: "right" }}><Text style={{ ...summaryValue, color: "#16a34a" }}>– PKR {discount.toLocaleString()}</Text></Column>
              </Row>
            )}
            <Row style={totalRow}>
              <Column style={{ width: "70%" }}><Text style={totalLabel}>Total Payable</Text></Column>
              <Column style={{ width: "30%", textAlign: "right" }}><Text style={totalValue}>PKR {total.toLocaleString()}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Track order */}
          <Section style={trackSection}>
            <Text style={trackLabel}>Track Your Order</Text>
            <Text style={trackCode}>{orderId}</Text>
            <Text style={trackHint}>
              Visit <a href={trackUrl} style={link}>karachitoys.pk/track</a> and enter your Order ID above.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>📞 0331-3956602 &nbsp;·&nbsp; ✉️ karachitoyshop@gmail.com</Text>
            <Text style={footerText}>📍 Multan, Pakistan &nbsp;·&nbsp; 🌐 karachitoys.pk</Text>
            <Text style={footerText}>Questions? WhatsApp or reply to this email — we respond within a few hours.</Text>
            <Text style={footerMuted}>© {new Date().getFullYear()} Karachi Toy Shop. All rights reserved.</Text>
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

const shopBar: React.CSSProperties = {
  backgroundColor: "#f8f4ff",
  padding: "10px 32px",
  textAlign: "center",
};

const shopBarText: React.CSSProperties = {
  fontSize: "11px",
  color: "#555",
  margin: 0,
  lineHeight: "1.6",
};

const section: React.CSSProperties = { padding: "24px 32px" };

const h2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1a1530",
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

const detailCell: React.CSSProperties = { paddingRight: "16px", verticalAlign: "top" };

const detailLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#aaa",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  margin: "0 0 3px",
};

const detailValue: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#1a1530",
  margin: 0,
};

const trackingBadge: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  color: "#92400e",
  padding: "2px 8px",
  borderRadius: "999px",
  fontSize: "12px",
};

const paymentBadge: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  color: "#15803d",
  border: "1px solid #bbf7d0",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  padding: "2px 10px",
  margin: 0,
};

const addressLine: React.CSSProperties = {
  fontSize: "13px",
  color: "#444",
  margin: "2px 0",
  lineHeight: "1.5",
};

const tableHeaderRow: React.CSSProperties = { backgroundColor: "#f3f3f3" };

const tableHeaderText: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  margin: "8px 0",
  padding: "0 6px",
};

const tableRowEven: React.CSSProperties = { backgroundColor: "#ffffff" };
const tableRowOdd: React.CSSProperties  = { backgroundColor: "#fafafa" };
const tableCol: React.CSSProperties    = { padding: "0 6px" };

const tableCell: React.CSSProperties = {
  fontSize: "13px",
  color: "#333",
  margin: "9px 0",
};

const summaryRow: React.CSSProperties = {};

const summaryLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#666",
  margin: "5px 0",
  padding: "0 6px",
};

const summaryValue: React.CSSProperties = {
  fontSize: "13px",
  color: "#333",
  margin: "5px 0",
  textAlign: "right",
};

const totalRow: React.CSSProperties = { borderTop: "2px solid #1a1530" };

const totalLabel: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1a1530",
  margin: "12px 0",
  padding: "0 6px",
};

const totalValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#e11d48",
  margin: "12px 0",
  textAlign: "right",
};

const trackSection: React.CSSProperties = {
  backgroundColor: "#fef9ec",
  padding: "20px 32px",
  textAlign: "center",
};

const trackLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#92400e",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  margin: "0 0 6px",
};

const trackCode: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1a1530",
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
  backgroundColor: "#1a1530",
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
  color: "#f59e0b",
  textDecoration: "underline",
};
