import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ · Delivery & Returns",
  description:
    "Delivery, Cash on Delivery, returns and replacement policy for Karachi Toy Shop.",
};

const faqs = [
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes. COD is our primary payment method across Karachi and major cities in Pakistan. Pay when your order arrives.",
  },
  {
    q: "How long does delivery take?",
    a: "Karachi orders usually arrive in 1–3 working days. Other cities typically take 3–7 working days depending on courier availability.",
  },
  {
    q: "Is shipping free?",
    a: "Orders of PKR 5,000 or more get free shipping. Below that, a flat PKR 250 shipping fee applies.",
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
    a: "Use the Track order page with your order number and the phone number used at checkout.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
        Help
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        FAQ · Delivery & returns
      </h1>
      <p className="mt-3 text-muted">
        Straight answers for parents shopping with Karachi Toy Shop.
      </p>

      <div className="mt-10 space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl bg-white p-5 ring-1 ring-black/5 open:shadow-md"
          >
            <summary className="cursor-pointer list-none font-display text-xl font-semibold">
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/track" className="btn-primary">
          Track order
        </Link>
        <Link href="/shop" className="btn-secondary">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
