"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPKR } from "@/lib/utils";
import { whatsappOrderUrl } from "@/lib/whatsapp";

type Tracked = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
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

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
        Orders
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Track your order</h1>
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
        <button type="submit" className="btn-primary" disabled={loading}>
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
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.name} className="flex justify-between gap-3">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span className="font-semibold">
                  {formatPKR(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold text-coral">
            Total {formatPKR(order.total)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappOrderUrl(order.orderNumber, order.total)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              WhatsApp us about this order
            </a>
            <Link
              href={`/invoice/${order.orderNumber}?phone=${encodeURIComponent(phone)}`}
              className="btn-secondary"
            >
              Print invoice
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
