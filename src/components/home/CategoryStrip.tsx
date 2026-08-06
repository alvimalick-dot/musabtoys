"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Baby,
  Blocks,
  Car,
  Gamepad2,
  Puzzle,
  Rocket,
  Users,
} from "lucide-react";

const MotionLink = motion.create(Link);

const categories = [
  {
    name: "Building Sets",
    href: "/shop?category=Building%20Sets",
    icon: Blocks,
    tint: "bg-sky/15 text-sky-deep",
  },
  {
    name: "Vehicles",
    href: "/shop?category=Vehicles",
    icon: Car,
    tint: "bg-coral/15 text-coral-deep",
  },
  {
    name: "Baby & Toddler",
    href: "/shop?category=Baby%20%26%20Toddler",
    icon: Baby,
    tint: "bg-sun/20 text-sun-deep",
  },
  {
    name: "Puzzles",
    href: "/shop?category=Puzzles",
    icon: Puzzle,
    tint: "bg-mint/15 text-mint",
  },
  {
    name: "STEM Toys",
    href: "/shop?category=STEM%20Toys",
    icon: Rocket,
    tint: "bg-sky/15 text-sky-deep",
  },
  {
    name: "Games",
    href: "/shop?category=Games",
    icon: Gamepad2,
    tint: "bg-coral/15 text-coral-deep",
  },
];

const ages = [
  { label: "0–3 yrs", href: "/shop?ageGroup=0-3%20years" },
  { label: "3–5 yrs", href: "/shop?ageGroup=3-5%20years" },
  { label: "6–9 yrs", href: "/shop?ageGroup=6-9%20years" },
  { label: "10+ yrs", href: "/shop?ageGroup=10%2B%20years" },
  { label: "All ages", href: "/shop?ageGroup=All%20Ages" },
];

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
<p className="text-sm font-bold uppercase tracking-[0.22em] text-coral-deep">
          Shop by age
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          What&rsquo;s right for your kid
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 flex gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:flex-wrap sm:overflow-visible"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {ages.map((a) => (
          <motion.div
            key={a.label}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <MotionLink
              href={a.href}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold ring-1 ring-black/5 transition hover:shadow-md"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Users className="h-4 w-4 text-coral transition group-hover:scale-110" />
              {a.label}
            </MotionLink>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-14 sm:mt-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
<p className="text-sm font-bold uppercase tracking-[0.22em] text-coral-deep">
          Browse by play
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Find the right kind of fun
        </h2>
      </motion.div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
          >
            <MotionLink
              href={cat.href}
className="group flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-black/5 transition hover:shadow-lg"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
            >
              <motion.span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.tint}`}
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
              >
                <cat.icon className="h-6 w-6" />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold">{cat.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted transition group-hover:text-coral">
                  Shop collection
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </MotionLink>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
