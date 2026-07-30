"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPKR } from "@/lib/utils";
import { calcShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/commerce";
import type { PaymentMethod } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone"),
  address: z.string().min(5, "Enter street address"),
  city: z.string().min(2, "Enter city"),
  area: z.string().optional(),
  notes: z.string().optional(),
  coupon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const onlineEnabled =
    process.env.NEXT_PUBLIC_ENABLE_ONLINE_PAYMENTS === "true";

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { city: "Karachi" },
  });

  const shipping = calcShipping(subtotal());
  const total = subtotal() + shipping;

  async function lookupPhone() {
    const phone = getValues("phone");
    if (!phone || phone.replace(/\D/g, "").length < 10) return;
    try {
      const res = await fetch("/api/checkout/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.found) return;
      const p = data.profile;
      if (p.name) setValue("name", p.name);
      if (p.email) setValue("email", p.email);
      if (p.address) setValue("address", p.address);
      if (p.city) setValue("city", p.city);
      if (p.area) setValue("area", p.area);
      toast.message(
        data.source === "account"
          ? "Welcome back — details filled from your account"
          : "Details filled from your last order"
      );
    } catch {
      // never block checkout
    }
  }

  async function onSubmit(values: FormValues) {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const validateRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const validated = await validateRes.json();
      if (!validateRes.ok || !validated.valid) {
        const bad = (validated.items || []).find(
          (i: { valid?: boolean; error?: string }) => !i.valid
        );
        throw new Error(bad?.error || "Cart items are no longer available");
      }

      let discount = 0;
      let couponCode: string | undefined;
      const coupon = values.coupon?.trim();
      if (coupon) {
        const cRes = await fetch("/api/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: coupon, subtotal: validated.subtotal }),
        });
        const cData = await cRes.json();
        if (!cRes.ok) throw new Error(cData.error || "Invalid coupon");
        discount = cData.discount;
        couponCode = cData.code;
        toast.success(`Coupon applied — ${formatPKR(discount)} off`);
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          customer: {
            name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            city: values.city,
            area: values.area || "",
          },
          paymentMethod,
          notes: values.notes || "",
          couponCode,
          discount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      clearCart();
      toast.success("Order placed!");
      if (data.paymentRedirect) {
        router.push(data.paymentRedirect);
      } else {
        router.push(
          `/checkout/success?order=${data.order.orderNumber}&total=${data.order.total}`
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            Delivery details
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            <input className="input-field" {...register("name")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input
              className="input-field"
              placeholder="03XXXXXXXXX"
              {...register("phone")}
              onBlur={(e) => {
                register("phone").onBlur(e);
                lookupPhone();
              }}
            />
          </Field>
          <Field label="Email" error={errors.email?.message} className="sm:col-span-2">
            <input className="input-field" type="email" {...register("email")} />
          </Field>
          <Field label="Street address" error={errors.address?.message} className="sm:col-span-2">
            <input className="input-field" {...register("address")} />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input className="input-field" {...register("city")} />
          </Field>
          <Field label="Area / landmark">
            <input className="input-field" {...register("area")} />
          </Field>
          <Field label="Coupon code (optional)" className="sm:col-span-2">
            <input className="input-field" placeholder="EID500" {...register("coupon")} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea className="input-field" rows={3} {...register("notes")} />
          </Field>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
            Payment method
          </p>
          <div className={`grid gap-3 ${onlineEnabled ? "sm:grid-cols-3" : ""}`}>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`rounded-2xl px-4 py-4 text-left text-sm font-bold ring-2 transition ${
                paymentMethod === "cod"
                  ? "bg-ink text-white ring-ink"
                  : "bg-white text-ink ring-black/5"
              }`}
            >
              Cash on Delivery
            </button>
            {onlineEnabled &&
              (
                [
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
          {!onlineEnabled && (
            <p className="mt-2 text-xs text-muted">
              Online payments coming soon. COD is available now.
            </p>
          )}
        </div>

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
            Free shipping on orders {formatPKR(FREE_SHIPPING_THRESHOLD)}+
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-coral-deep">{error}</p>}
    </div>
  );
}
