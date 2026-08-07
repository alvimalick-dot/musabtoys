import * as React from "react";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { resendSend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail";
import { OrderShippedEmail } from "@/components/emails/OrderShippedEmail";

const FROM = "orders@karachitoys.com";
const BCC  = "karachitoyshop@gmail.com";
const REPLY_TO = "karachitoyshop@gmail.com";

const baseUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

/** Central email sender — delegates to the SDK-based Resend transport */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  react?: React.ReactElement;
}): Promise<boolean> {
  return resendSend({
    from: process.env.RESEND_FROM || FROM,
    to: [opts.to],
    bcc: [BCC],
    replyTo: REPLY_TO,
    subject: opts.subject,
    text: opts.text,
    ...(opts.react ? { react: opts.react } : {}),
  });
}

/** OTP emails are handled by dispatchOtpEmail() in resend.ts */

/** Build confirmation channels after checkout */
export function buildOrderConfirmation(opts: {
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount?: number;
  paymentMethod?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerArea?: string;
  items?: { name: string; quantity: number; price: number; image?: string }[];
}) {
  const whatsappUrl = whatsappOrderUrl(opts.orderNumber, opts.total);
  const trackUrl = `${baseUrl()}/track?order=${opts.orderNumber}`;

  const text = `Hi ${opts.customerName}! Your Karachi Toy Shop order ${opts.orderNumber} (PKR ${opts.total}) is confirmed. COD — pay when it arrives. Track: ${trackUrl}`;

  const react = React.createElement(OrderConfirmationEmail, {
    customerName: opts.customerName,
    customerEmail: opts.customerEmail,
    customerPhone: opts.customerPhone,
    customerAddress: opts.customerAddress,
    customerCity: opts.customerCity,
    customerArea: opts.customerArea,
    orderId: opts.orderNumber,
    items: opts.items?.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })) ?? [],
    subtotal: opts.subtotal,
    shipping: opts.shipping,
    discount: opts.discount ?? 0,
    total: opts.total,
    paymentMethod: opts.paymentMethod,
  });

  return {
    whatsappUrl,
    trackUrl,
    emailSubject: `Order confirmed — ${opts.orderNumber}`,
    emailText: text,
    emailReact: react,
  };
}

/** Build a one-time "order shipped" email */
export function buildShippedEmail(opts: {
  orderNumber: string;
  customerName: string;
  courierName?: string;
  trackingNumber?: string;
}) {
  const text = `Hi ${opts.customerName}! 🎉\n\nGreat news! Your Karachi Toy Shop order ${opts.orderNumber} has been shipped and is on its way to you.${
    opts.courierName ? `\nCourier: ${opts.courierName}` : ""
  }${
    opts.trackingNumber ? `\nTracking #: ${opts.trackingNumber}` : ""
  }\n\nTrack it anytime: ${baseUrl()}/track?order=${opts.orderNumber}\n\n— Karachi Toy Shop`;

  const react = React.createElement(OrderShippedEmail, {
    customerName: opts.customerName,
    orderId: opts.orderNumber,
    courierName: opts.courierName,
    trackingNumber: opts.trackingNumber,
  });

  return {
    emailSubject: `Your order ${opts.orderNumber} is on its way! 🚚`,
    emailText: text,
    emailReact: react,
  };
}

/** Build a delivered-order feedback email */
export function buildFeedbackEmail(opts: {
  orderNumber: string;
  customerName: string;
  items: { name: string; slug: string }[];
}) {
  const reviewLinks = opts.items
    .map((item) => `• ${item.name} — ${baseUrl()}/product/${item.slug}#reviews`)
    .join("\n");

  const text = `Hi ${opts.customerName}! 🎉

Your Karachi Toy Shop order ${opts.orderNumber} has been delivered.

We'd love to know how the toys worked out. A quick rating helps other parents choose wisely.

Rate your toys:
${reviewLinks}

Thank you for shopping with us!
— Karachi Toy Shop`;

  return {
    subject: `Was your Karachi Toy Shop order ${opts.orderNumber} a hit? ⭐`,
    text,
  };
}

/** Send a delivered-order feedback email via Resend (non-blocking, best-effort) */
export async function sendFeedbackEmail(opts: {
  email: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; slug: string }[];
}): Promise<boolean> {
  const { subject, text } = buildFeedbackEmail(opts);
  return sendEmail({ to: opts.email, subject, text });
}

