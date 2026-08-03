"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatPKR } from "@/lib/utils";

type AccountData = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    addresses: {
      address: string;
      city: string;
      area?: string;
      isDefault?: boolean;
    }[];
  };
  orders: {
    orderNumber: string;
    status: string;
    total: number;
    paymentMethod: string;
    createdAt?: string;
    itemCount: number;
    items?: { name: string; slug: string }[];
  }[];
};

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(0);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/me");
      if (!res.ok) {
        setData(null);
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function requestOtp() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/customer/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, purpose: "login" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setStep("otp");
      // start 60s resend timer
      setResendTimer(60);
      toast.success(j.message || "OTP sent to your email");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  async function verifyOtp() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, purpose: "login" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Invalid OTP");
      toast.success("Logged in");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/customer/me", { method: "DELETE" });
      setData(null);
      setStep("phone");
      toast.message("Logged out");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Logout failed");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-muted">Loading…</div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
          Account
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">
          Login with phone
        </h1>
        <p className="mt-2 text-sm text-muted">
          No password. We send a one-time code. Checkout stays guest — login is
          optional.
        </p>

        {step === "phone" ? (
          <div className="mt-8 space-y-4">
            <input
              className="input-field"
              placeholder="03XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary w-full"
              disabled={busy || phone.length < 10 || !email.includes("@")}
              onClick={requestOtp}
            >
              Send OTP to email
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <input
              className="input-field"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {/* Demo OTP is not shown in UI */}
            <button
              type="button"
              className="btn-primary w-full"
              disabled={busy || otp.length !== 6}
              onClick={verifyOtp}
            >
              Verify & login
            </button>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="btn-secondary flex-1"
                disabled={busy || resendTimer > 0}
                onClick={requestOtp}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep("phone")}
              >
                Change number
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 text-sm text-muted">
          Just shopping?{" "}
          <Link href="/checkout" className="font-bold text-coral">
            Continue as guest →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
            My account
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            {data.customer.name}
          </h1>
          <p className="mt-1 text-muted">{data.customer.phone}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      {data.customer.addresses?.length > 0 && (
        <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <h2 className="font-display text-xl font-semibold">Saved addresses</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.customer.addresses.map((a, i) => (
              <li key={i}>
                {a.address}, {a.city}
                {a.area ? `, ${a.area}` : ""}
                {a.isDefault ? " · default" : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-2xl font-semibold">Order history</h2>
        <p className="mt-1 text-sm text-muted">
          Includes past guest orders matched to your phone.
        </p>
        <ul className="mt-4 space-y-3">
          {data.orders.length === 0 && (
            <li className="rounded-2xl bg-white p-6 text-muted ring-1 ring-black/5">
              No orders yet.{" "}
              <Link href="/shop" className="text-coral font-bold">
                Shop toys
              </Link>
            </li>
          )}
          {data.orders.map((o) => (
            <li
              key={o.orderNumber}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5"
            >
              <div>
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-xs capitalize text-muted">
                  {o.status} · {o.itemCount} item(s) · {o.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-coral">{formatPKR(o.total)}</p>
                <div className="mt-1 flex flex-col items-end gap-1">
                  <Link
                    href={`/track?order=${o.orderNumber}`}
                    className="text-xs font-bold text-sky-deep"
                  >
                    Track / Reorder
                  </Link>
                  {o.status === "delivered" &&
                    o.items &&
                    o.items.length > 0 && (
                      <div className="mt-1 flex flex-col items-end gap-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Rate your toys
                        </p>
                        {o.items.map((item) => (
                          <Link
                            key={item.slug}
                            href={`/product/${item.slug}#reviews`}
                            className="text-xs font-bold text-coral hover:underline"
                          >
                            {item.name} ⭐
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
