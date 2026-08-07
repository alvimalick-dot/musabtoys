import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { whatsappChatUrl } from "@/lib/whatsapp";
import {
  BRAND_ADDRESS,
  BRAND_LOCATION_NOTE,
  BRAND_MAPS_URL,
  BRAND_PHONE,
  BRAND_PHONE_DISPLAY,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ · Delivery, Returns & Payments",
  description:
    "Answers about Cash on Delivery, delivery times, returns and payments for Karachi Toys — Pakistan's online toy store.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    title: "FAQ · Delivery, Returns & Payments | Karachi Toys",
    description:
      "COD, delivery times, returns and payment questions answered for Karachi Toys.",
    url: "/faq",
    images: [{ url: "/images/logo.png", width: 1200, height: 630, alt: "Karachi Toys logo" }],
  },
  twitter: {
    card: "summary",
    title: "FAQ | Karachi Toys",
    description: "COD, delivery, returns and payment questions answered.",
    images: ["/images/logo.png"],
  },
};

const faqs = [
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes. COD is our primary payment method across Multan and major cities in Pakistan. Pay when your order arrives.",
  },
  {
    q: "How long does delivery take?",
    a: "Multan orders usually arrive in 1–3 working days. Other cities typically take 3–7 working days depending on courier availability.",
  },
  {
    q: "Is shipping free?",
    a: "Orders of PKR 3,000 or more get free shipping. Below that, a flat PKR 250 shipping fee applies. Note: if a coupon is applied, a flat PKR 250 shipping fee applies regardless of order value.",
  },
  {
    q: "Can I return or replace a toy?",
    a: "Unused items in original packaging can be replaced within 7 days if damaged or incorrect. Contact us on WhatsApp with your order number and photos.",
  },
  {
    q: "Are products original?",
    a: "We source from trusted suppliers. If you receive a defective item, we’ll arrange a replacement as per our 7-day policy.",
  },
{
    q: "How do I track my order?",
    a: "Use the Track order page with your order number and the email address used at checkout.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "/" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "/faq" },
  ],
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
        Help
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
        FAQ · Delivery & returns
      </h1>
      <p className="mt-3 text-muted">
        Straight answers for parents shopping with Karachi Toy Shop.
      </p>

      <div className="mt-10 space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
        className="group rounded-2xl bg-white p-5 ring-1 ring-black/5 open:shadow-md dark:bg-raised dark:ring-white/10"
          >
            <summary className="cursor-pointer list-none py-1 pr-2 font-display text-lg font-semibold leading-snug sm:text-xl">
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/track" className="btn-primary min-h-12 justify-center">
          Track order
        </Link>
        <Link href="/shop" className="btn-secondary min-h-12 justify-center">
          Back to shop
        </Link>
      </div>

    <div className="mt-14 rounded-3xl bg-ink p-6 text-white sm:p-8 dark:bg-deep">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-sun">
          Get in touch
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          Still have a question?
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Call or WhatsApp us — we&apos;re happy to help with orders, stock and
          delivery.
        </p>
        <div className="mt-5 space-y-3 text-sm">
          <a
            href={BRAND_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 text-white/80 transition hover:text-white"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
            <span>
              {BRAND_ADDRESS}
              <span className="block text-xs text-white/50">
                {BRAND_LOCATION_NOTE}
              </span>
            </span>
          </a>
          <a
            href={"tel:" + BRAND_PHONE.replace(/\s+/g, "")}
            className="flex items-center gap-2 text-white/80 transition hover:text-white"
          >
            <Phone className="h-4 w-4 shrink-0 text-sun" />
            {BRAND_PHONE_DISPLAY}
          </a>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={whatsappChatUrl()}
            target="_blank"
            rel="noreferrer"
            className="btn-primary min-h-12"
          >
            Chat on WhatsApp
          </a>
          <SocialLinks className="ml-1" />
        </div>
      </div>
    </div>
  );
}
