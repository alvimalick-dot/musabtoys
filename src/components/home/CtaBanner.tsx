"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <motion.div
        className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-coral via-[#ff7a3d] to-sun px-5 py-10 text-white sm:rounded-[2.5rem] sm:px-12 sm:py-14"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <motion.div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <p className="relative font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Ready to fill the cart?
        </p>
        <p className="relative mt-3 max-w-lg text-sm text-white/90 sm:text-base">
          Browse the full catalog with live stock, age filters, and prices from
          pocket-money finds to premium sets.
        </p>
        <Link
          href="/shop"
          className="relative mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]"
        >
          Open the shop
        </Link>
      </motion.div>
    </section>
  );
}
