"use client";

import { motion } from "framer-motion";

/**
 * Decorative blob divider used to break up long homepage scroll sections.
 * Adds playful floating shapes on top of the section background.
 */
export function SectionDivider() {
  return (
    <div className="pointer-events-none relative -my-1 flex h-24 items-center justify-center overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/10 blur-xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[30%] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-sky/10 blur-lg"
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[30%] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-sun/10 blur-lg"
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
