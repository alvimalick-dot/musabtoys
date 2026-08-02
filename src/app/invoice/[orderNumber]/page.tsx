import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { formatPKR } from "@/lib/utils";
import { PrintButton } from "@/components/invoice/PrintButton";
import {
  BRAND_ADDRESS,
  BRAND_PHONE,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ phone?: string }>;
};

function normalizePhone(p: string) {
  return p.replace(/\D/g, "").slice(-10);
}

export default async function InvoicePage({ params, searchParams }: Props) {
  const { orderNumber } = await params;
  const { phone } = await searchParams;

  try {
    await connectDB();
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
    }).lean();
    if (!order) notFound();
    if (
      !phone ||
      normalizePhone(order.customer.phone) !== normalizePhone(phone)
    ) {
      notFound();
    }

    return (
      <div className="mx-auto max-w-2xl bg-white px-6 py-10 print:p-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl font-semibold">Karachi Toy Shop</p>
            <p className="text-sm text-muted">Invoice / packing slip</p>
          </div>
          <PrintButton />
        </div>

        <div className="mt-8 grid gap-2 text-sm">
          <p>
            <strong>Order:</strong> {order.orderNumber}
          </p>
          <p>
            <strong>Status:</strong> {order.status} · {order.paymentMethod}
          </p>
          <p>
            <strong>Bill to:</strong> {order.customer.name}, {order.customer.phone}
          </p>
          <p>
            {order.customer.address}, {order.customer.city}
            {order.customer.area ? `, ${order.customer.area}` : ""}
          </p>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="py-2">Item</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i: { name: string; slug: string; quantity: number; price: number }) => (
              <tr key={i.slug + i.name} className="border-b border-black/5">
                <td className="py-2">{i.name}</td>
                <td className="py-2">{i.quantity}</td>
                <td className="py-2 text-right">
                  {formatPKR(i.price * i.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {(order.discount ?? 0) > 0 && (
            <div className="flex justify-between">
              <span>
                Discount {order.couponCode ? `(${order.couponCode})` : ""}
              </span>
              <span>-{formatPKR(order.discount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping ? formatPKR(order.shipping) : "Free"}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>

        <div className="mt-10 border-t border-black/10 pt-4 text-xs text-muted">
          <p className="font-bold text-ink">Karachi Toy Shop</p>
          <p className="mt-1">{BRAND_ADDRESS}</p>
          <p>
            Phone:{" "}
            <a
              href={"tel:" + BRAND_PHONE.replace(/\s+/g, "")}
              className="underline"
            >
              {BRAND_PHONE}
            </a>
          </p>
          <p className="mt-2 text-[11px] text-black/40">
            Thank you for shopping with us! For order issues, contact us within
            7 days of delivery.
          </p>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
