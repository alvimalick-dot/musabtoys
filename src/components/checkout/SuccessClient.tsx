"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";

export function SuccessClient({
  order,
  total,
}: {
  order?: string;
  total?: string;
}) {
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Optional save-account (never blocks)
  const [showSave, setShowSave] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [step, setStep] = useState<"ask" | "otp" | "done">("ask");
  const [busy, setBusy] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!order) return;
    fetch("/api/notify/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: order }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
        if (data.trackUrl) setTrackUrl(data.trackUrl);
        if (data.emailSent) {
          setEmailSent(true);
          toast.success("Confirmation email sent");
        }
      })
      .catch(() => undefined);
  }, [order]);

  async function startSave() {
    if (phone.length < 10) {
      toast.error("Enter the phone used at checkout");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/customer/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          purpose: "save_account",
          name,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setDebugOtp(j.debugOtp || null);
      setStep("otp");
      toast.success(j.message || "OTP sent to your email");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code: otp,
          name: name || undefined,
          purpose: "save_account",
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Invalid OTP");
      setStep("done");
      setShowSave(false);
      toast.success("Account saved — next checkout will be faster");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      {windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={["#e11d48", "#f59e0b", "#0891b2", "#22c55e", "#8b5cf6", "#f97316"]}
          tweenDuration={4000}
        />
      )}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <CheckCircle2 className="h-16 w-16 text-mint" />
      </motion.div>
      <motion.h1
        className="mt-6 font-display text-4xl font-semibold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Order confirmed
      </motion.h1>
      <p className="mt-3 text-muted">
        Thanks for shopping with Karachi Toy Shop.
        {order ? (
          <>
            {" "}
            Order <span className="font-bold text-ink">{order}</span>
            {total ? <> · PKR {total}</> : null}.
          </>
        ) : null}
      </p>
      <p className="mt-2 text-sm text-muted">
        Cash on Delivery — pay when it arrives.
        {total ? (
          <>
            {" "}
            Have ready:{" "}
            <span className="font-bold text-coral">PKR {total}</span>
          </>
        ) : null}
        {emailSent ? " Confirmation email sent." : ""}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary min-h-12"
          >
            Confirm on WhatsApp
          </a>
        )}
        {(trackUrl || order) && (
          <Link
            href={trackUrl || `/track?order=${order}`}
            className="btn-secondary min-h-12"
          >
            Track order
          </Link>
        )}
        <Link href="/shop" className="btn-secondary min-h-12">
          Continue shopping
        </Link>
      </div>

      {showSave && step !== "done" && (
        <div className="mt-10 w-full rounded-2xl bg-white p-5 text-left ring-1 ring-black/5">
          <p className="font-display text-xl font-semibold">
            Save details for next time?
          </p>
          <p className="mt-1 text-sm text-muted">
            Optional. Phone + OTP — no password. Guest checkout always stays
            available.
          </p>

          {step === "ask" && (
            <div className="mt-4 space-y-3">
              <input
                className="input-field"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="input-field"
                placeholder="Phone used at checkout"
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busy}
                  onClick={startSave}
                >
                  Save with OTP
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSave(false)}
                >
                  No thanks
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="mt-4 space-y-3">
              <input
                className="input-field"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {debugOtp && process.env.NODE_ENV !== "production" && (
                <p className="rounded-xl bg-sun/20 px-3 py-2 text-xs">
                  Demo OTP: <strong>{debugOtp}</strong>
                </p>
              )}
              <button
                type="button"
                className="btn-primary"
                disabled={busy || otp.length !== 6}
                onClick={confirmSave}
              >
                Verify & save
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        Already saved?{" "}
        <Link href="/account" className="font-bold text-coral">
          Open account
        </Link>
      </p>
    </div>
  );
}
