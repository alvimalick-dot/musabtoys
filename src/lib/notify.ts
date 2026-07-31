import { whatsappOrderUrl } from "@/lib/whatsapp";

/** Build confirmation channels after checkout — never auto-send secrets */
export function buildOrderConfirmation(opts: {
  orderNumber: string;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}) {
  const whatsappUrl = whatsappOrderUrl(opts.orderNumber, opts.total);
  const trackUrl = `${(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")}/track?order=${opts.orderNumber}`;

  const message = `Hi ${opts.customerName}! Your Karachi Toy Shop order ${opts.orderNumber} (PKR ${opts.total}) is confirmed. COD. Track: ${trackUrl}`;

  return {
    whatsappUrl,
    trackUrl,
    smsBody: message,
    // Email is opt-in via RESEND_API_KEY — see /api/notify/order
    emailSubject: `Order confirmed — ${opts.orderNumber}`,
    emailPreview: message,
  };
}

const baseUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

/** Build a "your order was delivered — rate your toys" feedback email */
export function buildFeedbackEmail(opts: {
  orderNumber: string;
  customerName: string;
  items: { name: string; slug: string }[];
}) {
  const reviewLinks = opts.items
    .map(
      (item) =>
        `• ${item.name} — ${baseUrl()}/product/${item.slug}#reviews`
    )
    .join("\n");

  const text = `Hi ${opts.customerName}! 🎉

Your Karachi Toy Shop order ${opts.orderNumber} has been delivered.

We'd love to know how the toys worked out for your kids. A quick rating and a line or two helps other parents choose wisely — and helps us keep quality high.

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
  if (!process.env.RESEND_API_KEY) return false;
  const { subject, text } = buildFeedbackEmail({
    orderNumber: opts.orderNumber,
    customerName: opts.customerName,
    items: opts.items,
  });
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM ||
          "Karachi Toy Shop <onboarding@resend.dev>",
        to: [opts.email],
        subject,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
