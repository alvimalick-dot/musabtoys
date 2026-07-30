"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPKR } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const shipping = subtotal() >= 5000 || subtotal() === 0 ? 0 : 250;
  const total = subtotal() + shipping;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          customer: {
            name: String(form.get("name")),
            email: String(form.get("email")),
            phone: String(form.get("phone")),
            address: String(form.get("address")),
            city: String(form.get("city")),
            area: String(form.get("area") || ""),
          },
          paymentMethod,
          notes: String(form.get("notes") || ""),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      clearCart();
      if (data.paymentRedirect) {
        router.push(data.paymentRedirect);
      } else {
        router.push(`/checkout/success?order=${data.order.orderNumber}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            Delivery details
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Full name" required />
          <Field name="phone" label="Phone" required placeholder="03XXXXXXXXX" />
          <Field name="email" label="Email" type="email" required className="sm:col-span-2" />
          <Field name="address" label="Street address" required className="sm:col-span-2" />
          <Field name="city" label="City" required defaultValue="Karachi" />
          <Field name="area" label="Area / landmark" />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Notes
            </label>
            <textarea name="notes" rows={3} className="input-field" />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
            Payment method
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["cod", "Cash on Delivery"],
                ["jazzcash", "JazzCash"],
                ["payfast", "PayFast / Card"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={`rounded-2xl px-4 py-4 text-left text-sm font-bold ring-2 transition ${
                  paymentMethod === value
                    ? "bg-ink text-white ring-ink"
                    : "bg-white text-ink ring-black/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral-deep">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || !items.length} className="btn-primary">
          {loading ? "Placing order…" : `Place order · ${formatPKR(total)}`}
        </button>
      </form>

      <aside className="h-fit rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
        <h2 className="font-display text-2xl font-semibold">Order summary</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Your cart is empty.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3 text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatPKR(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 space-y-2 border-t border-black/5 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPKR(subtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-coral">{formatPKR(total)}</span>
          </div>
          <p className="pt-2 text-xs text-muted">
            Free shipping on orders PKR 5,000+
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  defaultValue,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="input-field"
      />
    </div>
  );
}
