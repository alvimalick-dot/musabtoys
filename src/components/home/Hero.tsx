"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden toy-grid-bg">
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <motion.div
        className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-sun/40 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-sky/30 blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center gap-10 px-4 py-12 sm:px-6">
        <motion.p
          className="font-display text-4xl leading-[0.95] tracking-tight text-ink min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Karachi
         
          <span className="relative inline-block text-coral">
            Toys
            <motion.span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 h-1.5 origin-left rounded-full bg-sun/70 sm:-bottom-2 sm:h-2.5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
        </motion.p>

        <motion.p
          className="mt-5 max-w-md text-base leading-relaxed text-muted sm:mt-6 sm:text-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Thousands of toys. Instant filters. Local payments. Built for
          Karachi families who want playtime without the hunt.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        >
          <Link href="/shop" className="btn-primary min-h-12 w-full justify-center sm:w-auto">
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/shop?newArrival=true" className="btn-secondary min-h-12 w-full justify-center sm:w-auto">
            <Sparkles className="h-4 w-4 text-sun" /> New Arrivals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
