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

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            className="font-display text-4xl leading-[0.95] tracking-tight text-ink min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Karachi
            <br />
            <span className="text-coral">Toy Shop</span>
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
            <Link href="/shop?featured=true" className="btn-secondary min-h-12 w-full justify-center sm:w-auto">
              <Sparkles className="h-4 w-4 text-sun" /> Featured picks
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative h-[280px] w-full sm:h-[420px] md:h-[520px]"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky via-coral to-sun shadow-2xl shadow-coral/20 sm:rounded-[2.5rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1400&q=80"
              alt="Colorful toys spread across a play table"
              className="h-full w-full object-cover mix-blend-luminosity opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1530]/55 via-transparent to-transparent" />
          </div>

          <motion.div
            className="absolute bottom-4 left-3 right-auto sm:bottom-16 sm:left-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-lg sm:px-4 sm:py-3 sm:shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
                Price range
              </p>
              <p className="font-display text-base font-semibold sm:text-lg">
                PKR 100 – 150k+
              </p>
            </div>
          </motion.div>

          <motion.div
            className="absolute right-3 top-3 sm:right-4 sm:top-16"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="rounded-2xl bg-ink px-3 py-2.5 text-white shadow-xl sm:px-4 sm:py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sun sm:text-xs">
                Payment
              </p>
              <p className="font-display text-base font-semibold sm:text-lg">
                Cash on Delivery
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
