"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Banknote, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { BRAND_ADDRESS, BRAND_MAPS_URL, BRAND_PHONE } from "@/lib/seo";
import { SocialLinks } from "@/components/ui/SocialLinks";

const footerLinks = [
  { label: "Shop catalog", href: "/shop" },
  { label: "Featured toys", href: "/shop?featured=true" },
  { label: "New arrivals", href: "/shop?newArrival=true" },
  { label: "Track order", href: "/track" },
  { label: "FAQ & returns", href: "/faq" },
  { label: "My account", href: "/account" },
  { label: "Checkout", href: "/checkout" },
];

const trustItems = [
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Truck, label: "Free ship over PKR 3,000" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: RefreshCcw, label: "7-day returns" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    // Lightweight newsletter — no backend yet; just confirm locally.
    toast.success("You're on the list! Deals coming soon 🎉");
    setEmail("");
  }

  return (
    <footer className="border-t border-black/5 bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 sm:pt-14 md:pb-14">
        {/* Top: brand + newsletter */}
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div>
            <p className="font-display text-2xl font-semibold">Karachi Toys</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/90">
              Thousands of toys for every age — from PKR 100 finds to premium
              playsets. Cash on Delivery across Pakistan.
            </p>
            <a
              href={BRAND_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-white/90 hover:underline"
            >
              {BRAND_ADDRESS}
            </a>
            <a
              href={"tel:" + BRAND_PHONE.replace(/\s+/g, "")}
              className="mt-2 block text-sm text-white/90 hover:underline"
            >
              {BRAND_PHONE}
            </a>
            <div className="mt-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">
                Connect
              </p>
              <SocialLinks className="mt-3" />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">
              Explore
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/90">
              {footerLinks.map((l) => (
                <Link key={l.label} href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">
              Get toy deals
            </p>
            <p className="mt-4 text-sm text-white/90">
              Join for new arrivals, offers &amp; restocks — straight to your
              inbox.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none transition focus:border-sun focus:ring-2 focus:ring-sun/30"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-coral px-4 py-2.5 text-sm font-bold text-white transition hover:bg-coral-deep"
              >
                Join
              </button>
            </form>

            {/* Trust / payment badges */}
            <div className="mt-6 grid grid-cols-2 gap-2">
              {trustItems.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10"
                >
                  <t.icon className="h-4 w-4 shrink-0 text-sun" />
                  <span className="text-xs text-white/90">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Karachi Toy Shop. All rights reserved.
          </p>
          <p className="text-center">
            Cash on Delivery · JazzCash · PayFast · Delivering across Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
