"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatPKR } from "@/lib/utils";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { useCartStore } from "@/store/cartStore";

type TrackedItem = {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  price: number;
  image: string;
};

type Tracked = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  courierName?: string;
  trackingNumber?: string;
  items: TrackedItem[];
  customer: { name: string; city: string };
  createdAt?: string;
};

export function TrackForm({
  initialOrder = "",
}: {
  initialOrder?: string;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Tracked | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tracking failed");
    } finally {
      setLoading(false);
    }
  }

  function reorder() {
    if (!order) return;
    let added = 0;
    for (const item of order.items) {
      if (!item.productId) continue;
      addItem(
        {
          productId: item.productId,
          slug: item.slug || "shop",
          name: item.name,
          price: item.price,
          image: item.image || "",
          stock: 99,
        },
        item.quantity
      );
      added++;
    }
    if (added) {
      openCart();
      toast.success(`Added ${added} item(s) to cart`);
    } else {
      toast.error("Could not reorder these items");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
        Orders
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
        Track your order
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter your order number and the phone used at checkout.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
            Order number
          </label>
          <input
            className="input-field"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="KTS-XXXX-XXXX"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
            Phone
          </label>
          <input
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XXXXXXXXX"
            required
          />
        </div>
        {error && (
          <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral-deep">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary min-h-12 w-full sm:w-auto" disabled={loading}>
          {loading ? "Checking…" : "Track order"}
        </button>
      </form>

      {order && (
        <div className="mt-8 rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
          <p className="font-display text-2xl font-semibold">{order.orderNumber}</p>
          <p className="mt-1 text-sm capitalize text-muted">
            Status: <span className="font-bold text-ink">{order.status}</span> ·{" "}
            {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
          </p>
          <p className="mt-1 text-sm text-muted">
            {order.customer.name} · {order.customer.city}
          </p>

          {(order.trackingNumber || order.courierName) && (
            <div className="mt-4 rounded-xl bg-[#faf5ff] px-4 py-3 text-sm">
              <p className="font-bold text-ink">Courier tracking</p>
              {order.courierName && (
                <p className="mt-1 text-muted">Courier: {order.courierName}</p>
              )}
              {order.trackingNumber && (
                <p className="mt-0.5 font-semibold tracking-wide">
                  {order.trackingNumber}
                </p>
              )}
            </div>
          )}

          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={`${i.productId}-${i.name}`} className="flex justify-between gap-3">
                <span className="min-w-0 flex-1 truncate">
                  {i.name} × {i.quantity}
                </span>
                <span className="shrink-0 font-semibold">
                  {formatPKR(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold text-coral">
            Total {formatPKR(order.total)}
            {order.paymentMethod === "cod" ? (
              <span className="ml-2 text-sm font-semibold text-muted">
                (pay on delivery)
              </span>
            ) : null}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" className="btn-primary min-h-11" onClick={reorder}>
              Reorder these toys
            </button>
            <a
              href={whatsappOrderUrl(order.orderNumber, order.total)}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary min-h-11"
            >
              WhatsApp us about this order
            </a>
            <Link
              href={`/invoice/${order.orderNumber}?phone=${encodeURIComponent(phone)}`}
              className="btn-secondary min-h-11"
            >
              Print invoice
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
