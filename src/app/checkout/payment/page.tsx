import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete payment",
};

type Props = {
  searchParams: Promise<{ gateway?: string; order?: string }>;
};

export default async function PaymentPage({ searchParams }: Props) {
  const { gateway, order } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
        {gateway === "jazzcash" ? "JazzCash" : "PayFast"}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">
        Payment gateway hook
      </h1>
      <p className="mt-4 text-muted">
        Order <span className="font-bold text-ink">{order}</span> is created.
        Wire your merchant credentials in <code>.env.local</code> to redirect
        customers to the live {gateway} checkout. Until then, treat this as a
        placeholder success path for development.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/checkout/success?order=${order || ""}`}
          className="btn-primary"
        >
          Mark as paid (dev)
        </Link>
        <Link href="/shop" className="btn-secondary">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
