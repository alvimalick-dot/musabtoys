"use client";

import { motion } from "framer-motion";
import { Gift, Search, ShieldCheck, Truck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const features = [
  {
    icon: Search,
    title: "Find toys fast",
    text: "Search by name or brand \u2014 even with small spelling mistakes \u2014 and filter by age, price, and category.",
  },
  {
    icon: Truck,
    title: "Cash on Delivery",
    text: "Pay when your order arrives. Free delivery on orders PKR 3,000 and above.",
  },
  {
    icon: Gift,
    title: "Toys for every age",
    text: "From first soft toys to STEM kits and collector sets \u2014 prices from PKR 100 to 150,000+.",
  },
  {
    icon: ShieldCheck,
    title: "Stock you can trust",
    text: "Live availability on every product so you know what\u2019s ready to ship before you add to cart.",
  },
];

const stats = [
  { label: "Toys in stock", target: 4500, suffix: "+" },
  { label: "Happy families", target: 12000, suffix: "+" },
  { label: "Cities across PK", target: 60, suffix: "+" },
  { label: "Same-day dispatch", target: 99, suffix: "%" },
];

export function FeatureBand() {
  return (
<section className="relative overflow-hidden bg-ink text-white dark:bg-slate-900">
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
        <ScrollReveal variant="up">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sun">
            Why shop with us
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Built for families who want playtime, not hassle
          </h2>
        </ScrollReveal>

        {/* Animated Stats Row */}
        <ScrollReveal variant="scale" delay={0.2}>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10">
                <p className="font-display text-3xl font-bold text-sun sm:text-4xl">
                  <AnimatedCounter target={s.target} suffix={s.suffix} duration={2.5} />
                </p>
<p className="mt-1 text-xs text-white/90 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

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
<p className="mt-2 text-sm leading-relaxed text-white/90">
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

