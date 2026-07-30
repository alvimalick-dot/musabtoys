import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Complete payment",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ gateway?: string; order?: string }>;
};

export default async function PaymentPage({ searchParams }: Props) {
  const { gateway, order } = await searchParams;
  const onlineEnabled = process.env.ENABLE_ONLINE_PAYMENTS === "true";
  const allowDevBypass = process.env.ALLOW_DEV_PAYMENT_BYPASS === "true";

  // Online gateways not live yet — do not expose a fake paid shortcut in production
  if (!onlineEnabled && process.env.NODE_ENV === "production") {
    notFound();
  }

  const label =
    gateway === "jazzcash"
      ? "JazzCash"
      : gateway === "payfast"
        ? "PayFast"
        : "Online payment";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
        {label}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">
        Online payment coming soon
      </h1>
      <p className="mt-4 text-muted">
        Order <span className="font-bold text-ink">{order || "—"}</span> is saved.
        JazzCash / PayFast will confirm payment via secure server webhooks — not
        a browser button. For now, please use <strong>Cash on Delivery</strong>.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/checkout" className="btn-primary">
          Back to checkout (use COD)
        </Link>
        <Link href="/shop" className="btn-secondary">
          Back to shop
        </Link>
      </div>

      {allowDevBypass && process.env.NODE_ENV !== "production" && (
        <p className="mt-10 text-xs text-muted">
          Dev bypass enabled.{" "}
          <Link
            href={`/checkout/success?order=${order || ""}`}
            className="underline"
          >
            Continue to success page (does not mark paid)
          </Link>
        </p>
      )}
    </div>
  );
}
