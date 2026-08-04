import { BRAND_WHATSAPP } from "@/lib/seo";

export function getWhatsAppNumber() {
  return BRAND_WHATSAPP.replace(/\D/g, "");
}

export function whatsappChatUrl(prefill?: string) {
  const n = getWhatsAppNumber();
  const text = encodeURIComponent(
    prefill || "Hi Karachi Toy Shop! I have a question about toys / my order."
  );
  return `https://wa.me/${n}?text=${text}`;
}

export function whatsappOrderUrl(orderNumber: string, total: number) {
  return whatsappChatUrl(
    `Hi Karachi Toy Shop! I just placed order ${orderNumber} (total PKR ${total}). Please confirm.`
  );
}

export function whatsappProductAskUrl(opts: {
  name: string;
  slug: string;
  price: number;
  siteUrl?: string;
}) {
  const base =
    opts.siteUrl ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "";
  const link = `${base.replace(/\/$/, "")}/product/${opts.slug}`;
  return whatsappChatUrl(
    `Hi Karachi Toy Shop! I have a question about this toy:\n${opts.name}\nPKR ${opts.price}\n${link}`
  );
}

export function whatsappShareProductUrl(opts: {
  name: string;
  slug: string;
  price: number;
  siteUrl?: string;
}) {
  const base =
    opts.siteUrl ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "";
  const link = `${base.replace(/\/$/, "")}/product/${opts.slug}`;
  return whatsappChatUrl(
    `Check out this toy from Karachi Toy Shop:\n${opts.name} — PKR ${opts.price}\n${link}`
  );
}

export function whatsappRestockUrl(opts: {
  name: string;
  slug: string;
  phone?: string;
  siteUrl?: string;
}) {
  const base =
    opts.siteUrl ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "";
  const link = `${base.replace(/\/$/, "")}/product/${opts.slug}`;
  const phoneBit = opts.phone ? `\nMy phone: ${opts.phone}` : "";
  return whatsappChatUrl(
    `Hi Karachi Toy Shop! Please tell me when this is back in stock:\n${opts.name}\n${link}${phoneBit}`
  );
}
