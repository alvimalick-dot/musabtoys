import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { whatsappOrderUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order placed",
};

type Props = { searchParams: Promise<{ order?: string; total?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order, total } = await searchParams;
  const totalNum = Number(total) || 0;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <CheckCircle2 className="h-16 w-16 text-mint" />
      <h1 className="mt-6 font-display text-4xl font-semibold">Order confirmed</h1>
      <p className="mt-3 text-muted">
        Thanks for shopping with Karachi Toy Shop.
        {order ? (
          <>
            {" "}
            Your order number is{" "}
            <span className="font-bold text-ink">{order}</span>.
          </>
        ) : null}
      </p>
      <p className="mt-2 text-sm text-muted">
        We&apos;ll confirm on your phone. Cash on Delivery — pay when your order
        arrives.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order && (
          <a
            href={whatsappOrderUrl(order, totalNum)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Confirm on WhatsApp
          </a>
        )}
        {order && (
          <Link href={`/track?order=${order}`} className="btn-secondary">
            Track order
          </Link>
        )}
        <Link href="/shop" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
