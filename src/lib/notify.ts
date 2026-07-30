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
