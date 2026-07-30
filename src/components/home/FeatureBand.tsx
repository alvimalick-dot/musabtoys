"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, Search, Gift } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find toys fast",
    text: "Search by name or brand — even with small spelling mistakes — and filter by age, price, and category.",
  },
  {
    icon: Truck,
    title: "Pay your way",
    text: "Checkout with Cash on Delivery, JazzCash, or card. Free delivery on orders PKR 5,000 and above.",
  },
  {
    icon: Gift,
    title: "Toys for every age",
    text: "From first soft toys to STEM kits and collector sets — prices from PKR 100 to 150,000+.",
  },
  {
    icon: ShieldCheck,
    title: "Stock you can trust",
    text: "Live availability on every product so you know what’s ready to ship before you add to cart.",
  },
];

export function FeatureBand() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <motion.div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-coral/30 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-sun">
          Why shop with us
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Built for Karachi families who want playtime, not hassle
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="flex gap-4"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <f.icon className="h-5 w-5 text-sun" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {f.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
