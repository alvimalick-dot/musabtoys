"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";

const MotionLink = motion.create(Link);

const ages = [
  {
    label: "0–3",
    sub: "Baby & toddler",
    href: "/shop?ageGroup=0-3%20years",
    ring: "ring-coral/40",
    bg: "bg-coral/15",
    text: "text-coral-deep",
  },
  {
    label: "3–5",
    sub: "Preschool",
    href: "/shop?ageGroup=3-5%20years",
    ring: "ring-sun/40",
    bg: "bg-sun/20",
    text: "text-sun-deep",
  },
  {
    label: "6–9",
    sub: "Big kid",
    href: "/shop?ageGroup=6-9%20years",
    ring: "ring-sky/40",
    bg: "bg-sky/15",
    text: "text-sky-deep",
  },
  {
    label: "10+",
    sub: "Tween & up",
    href: "/shop?ageGroup=10%2B%20years",
    ring: "ring-mint/40",
    bg: "bg-mint/15",
    text: "text-mint",
  },
  {
    label: "All",
    sub: "Any age",
    href: "/shop?ageGroup=All%20Ages",
    ring: "ring-black/10 dark:ring-white/20",
    bg: "bg-white dark:bg-slate-800",
    text: "text-ink dark:text-white",
  },
];

export function AgeShopBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Start here"
        title="Shop by"
        accent="age"
        accentColor="text-sun-deep"
        eyebrowColor="text-sun-deep"
        description="Every toy is tagged by age — pick a stage and we'll show you what fits."
        align="center"
      />

      <div className="mt-10 flex flex-wrap items-start justify-center gap-5 sm:gap-8">
        {ages.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <MotionLink
              href={a.href}
              className="group flex flex-col items-center gap-2"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`flex h-20 w-20 items-center justify-center rounded-full ${a.bg} ring-4 ${a.ring} font-display text-lg font-bold ${a.text} shadow-sm transition group-hover:shadow-md sm:h-24 sm:w-24 sm:text-xl`}
              >
                {a.label}
              </span>
              <span className="text-xs font-bold text-muted transition group-hover:text-ink sm:text-sm dark:group-hover:text-white">
                {a.sub}
              </span>
            </MotionLink>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
