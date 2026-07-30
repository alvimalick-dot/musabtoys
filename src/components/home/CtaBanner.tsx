"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <motion.div
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-coral via-[#ff7a3d] to-sun px-8 py-14 text-white sm:px-12"
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
        <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Ready to fill the cart?
        </p>
        <p className="mt-3 max-w-lg text-white/90">
          Browse the full catalog with live stock, age filters, and prices from
          pocket-money finds to premium sets.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]"
        >
          Open the shop
        </Link>
      </motion.div>
    </section>
  );
}
