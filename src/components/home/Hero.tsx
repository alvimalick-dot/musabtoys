"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { BubbleTitle } from "@/components/ui/BubbleTitle";

export function Hero() {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
    else router.push("/shop");
  }

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 toy-grid-bg">
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <motion.div
        className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-coral/30 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-sky/30 blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col lg:flex-row lg:items-center justify-center gap-10 lg:gap-16 px-4 sm:px-6">
        
        {/* Left Side: Title */}
        <div>
          <motion.p
            className="whitespace-nowrap font-display text-4xl leading-[0.95] tracking-tight text-ink min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <BubbleTitle variant="standard" colorClass="text-ink">
              Karachi
            </BubbleTitle>{" "}
            <BubbleTitle
              variant="logo"
              className="text-4xl min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
            >
              Toys
            </BubbleTitle>
          </motion.p>
        </div>

        {/* Right Side: Search + CTA */}
        <div className="flex flex-col justify-center max-w-md">
          <motion.form
            onSubmit={onSearch}
            className="relative w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              
              className="input-field h-14 w-full rounded-full pr-4 text-base shadow-md"
              style={{ paddingLeft: "2.75rem" }}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-coral px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-coral-deep"
            >
              Search
            </button>
          </motion.form>

          <motion.div
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
          >
            <Link href="/shop" className="btn-primary btn-primary-lg w-full justify-center sm:w-auto">
              Shop now <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
          </motion.div>
        </div>
        
      </div>
    </section>
  );
}
