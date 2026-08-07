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
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/ui/Section";

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

export function CategoryStrip() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
<SectionHeading
          eyebrow="Browse by play"
          title="Find the right"
          accent="kind of fun"
          eyebrowColor="text-coral-deep"
        />
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
className="group flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-black/5 transition hover:shadow-lg dark:bg-raised dark:ring-white/10 dark:hover:shadow-black/30"
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
    </Section>
  );
}
