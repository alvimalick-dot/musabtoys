import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Order placed",
};

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

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
        We&apos;ll contact you on the phone number you provided for delivery
        confirmation.
      </p>
      <Link href="/shop" className="btn-primary mt-8">
        Continue shopping
      </Link>
    </div>
  );
}
