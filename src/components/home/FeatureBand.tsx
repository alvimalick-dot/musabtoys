"use client";

import { motion } from "framer-motion";
import { Gift, Search, ShieldCheck, Truck } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find toys fast",
    text: "Search by name or brand — even with small spelling mistakes — and filter by age, price, and category.",
  },
  {
    icon: Truck,
    title: "Cash on Delivery",
    text: "Pay when your order arrives. Free delivery on orders PKR 5,000 and above.",
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
      <motion.div
        className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-sky/25 blur-3xl"
        animate={{ scale: [1.15, 1, 1.15], x: [0, 20, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-sun">
          Why shop with us
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Built for Karachi families who want playtime, not hassle
        </h2>

        <motion.div
          className="mt-12 grid gap-8 md:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09 } },
          }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="group flex gap-4"
              variants={{
                hidden: { opacity: 0, x: -16 },
                show: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 transition group-hover:bg-white/15"
                whileHover={{ rotate: -6, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
              >
                <f.icon className="h-5 w-5 text-sun" />
              </motion.span>
              <div>
                <p className="font-display text-2xl font-semibold">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {f.text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
