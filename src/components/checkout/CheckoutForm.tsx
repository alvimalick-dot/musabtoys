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
import { CitySelect } from "@/components/ui/CitySelect";
import { Loader2 } from "lucide-react";
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

type CouponInfo = {
  code: string;
  discount: number;
  type: string;
  value: number;
};

type CartItemPayload = {
  productId: string;
  quantity: number;
};

/** Minimal typed JSON request that throws on non-2xx responses. */
async function jsonRequest<T = unknown>(
  url: string,
  body: unknown,
  method: "POST" | "PUT" = "POST"
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [couponInput, setCouponInput] = useState("");
const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
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
    defaultValues: { city: "Multan" },
  });

  const sub = subtotal();
  const discount = appliedCoupon?.discount ?? 0;
  const hasCoupon = !!appliedCoupon;
  const shipping = calcShipping(sub, hasCoupon);
  const total = Math.max(0, sub - discount) + shipping;

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponMsg("Enter a coupon code first");
      return;
    }
    setCouponBusy(true);
    setCouponMsg(null);
    try {
      const data = await jsonRequest<CouponInfo>(
        "/api/coupons",
        { code, subtotal: sub },
        "PUT"
      );
      setAppliedCoupon(data);
      setCouponInput("");
      setCouponMsg(`✓ Coupon ${data.code} applied — ${formatPKR(data.discount)} off`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMsg(
        err instanceof Error ? err.message : "Could not apply coupon"
      );
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponMsg(null);
    setCouponInput("");
  }

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
      const cartItems: CartItemPayload[] = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

const validated = await jsonRequest<{ valid: boolean; items?: { valid?: boolean; error?: string }[]; subtotal?: number }>("/api/cart", { items: cartItems });
      if (!validated.valid) {
        const bad = (validated.items || []).find(
          (i: { valid?: boolean; error?: string }) => !i.valid
        );
        throw new Error(bad?.error || "Cart items are no longer available");
      }

      let couponCode = appliedCoupon?.code;

      // If a code was typed but not applied yet, apply it now (server-side validation)
      const typedCoupon = couponInput.trim();
      if (typedCoupon && typedCoupon.toUpperCase() !== (appliedCoupon?.code || "").toUpperCase()) {
        const cRes = await fetch("/api/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: typedCoupon, subtotal: validated.subtotal }),
        });
        const cData = await cRes.json();
        if (!cRes.ok) throw new Error(cData.error || "Invalid coupon");
        couponCode = cData.code;
        toast.success(`Coupon applied — ${formatPKR(discount)} off`);
      }

const data = await jsonRequest<{ order: { orderNumber: string; total: number }; paymentRedirect?: string | null }>("/api/checkout", {
        items: cartItems,
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
      });

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
<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
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
            <CitySelect
              value={getValues("city")}
              onChange={(v) => setValue("city", v, { shouldValidate: true })}
              error={errors.city?.message}
            />
          </Field>
          <Field label="Area / landmark">
            <input className="input-field" {...register("area")} />
          </Field>
          <Field label="Coupon code" className="sm:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input-field min-w-0 flex-1"
                placeholder="EID500"
                value={appliedCoupon ? appliedCoupon.code : couponInput}
                disabled={!!appliedCoupon}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  className="btn-secondary min-h-11 shrink-0"
                  onClick={removeCoupon}
                >
                  Remove
                </button>
              ) : (
<button
                  type="button"
                  className="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2"
                  disabled={couponBusy}
                  onClick={applyCoupon}
                >
                  {couponBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying…
                    </>
                  ) : (
                    "Apply"
                  )}
                </button>
              )}
            </div>
            {couponMsg && (
              <p
                className={`mt-2 text-sm font-semibold ${
                  appliedCoupon ? "text-mint" : "text-coral-deep"
                }`}
              >
                {couponMsg}
              </p>
            )}
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
                  ? "bg-ink text-white ring-ink dark:bg-white dark:text-black dark:ring-white"
                 : "bg-white text-ink ring-black/5 dark:bg-raised dark:text-white dark:ring-white/10"
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
                    ? "bg-ink text-white ring-ink dark:bg-white dark:text-black dark:ring-white"
                      : "bg-white text-ink ring-black/5 dark:bg-raised dark:text-white dark:ring-white/10"
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

        <button
          type="submit"
          disabled={loading || !items.length}
          aria-busy={loading}
          className="btn-primary inline-flex min-h-12 w-full items-center justify-center gap-2 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Placing order…</span>
            </>
          ) : (
            `Place order · ${formatPKR(total)}${
              discount > 0 ? ` (was ${formatPKR(sub + shipping)})` : ""
            }`
          )}
        </button>
      </form>

<aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:sticky lg:top-24 dark:bg-raised dark:ring-white/10">
        <h2 className="font-display text-2xl font-semibold">Order summary</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Your cart is empty.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-semibold">
                  {formatPKR(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 space-y-2 border-t border-black/5 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPKR(sub)}</span>
          </div>
          {discount > 0 && appliedCoupon && (
            <div className="flex justify-between text-mint">
              <span>
                Coupon {appliedCoupon.code} (−
                {appliedCoupon.type === "percent"
                  ? `${appliedCoupon.value}%`
                  : formatPKR(appliedCoupon.value)}
                )
              </span>
              <span>−{formatPKR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-coral">{formatPKR(total)}</span>
          </div>
          <p className="pt-2 text-xs text-muted">
            {hasCoupon
              ? "Coupon orders are charged a flat PKR 250 shipping fee."
              : `Free shipping on orders ${formatPKR(FREE_SHIPPING_THRESHOLD)}+`}
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
