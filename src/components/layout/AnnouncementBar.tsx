"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Truck, X } from "lucide-react";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/commerce";
import { formatPKR } from "@/lib/utils";

const STORAGE_KEY = "karachi-toys-announcement-dismissed";

const messages = [
  <>
    Free delivery on orders over {formatPKR(FREE_SHIPPING_THRESHOLD)} nationwide
  </>,
  <>Cash on Delivery available across Pakistan</>,
  <>4,500+ toys — play safe, pay when it arrives</>,
];

/**
 * Top announcement bar promoting free shipping over the threshold and COD.
 * Automatically rotates messages on a timer.
 */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    // Respect user's prior dismissal for this session
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % messages.length), 4000);
    return () => clearInterval(id);
  }, [visible]);

  function dismiss() {
    setVisible(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

if (!visible) return null;

  return (
    <div className="relative z-50 bg-linear-to-r from-coral via-sky to-sun text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-10 text-center">
        <Truck className="mr-2 hidden h-3.5 w-3.5 shrink-0 sm:block" />
        <div className="relative h-5 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={slide}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="truncate text-xs font-bold sm:text-sm"
            >
              {messages[slide]}
            </motion.p>
          </AnimatePresence>
        </div>
        <Link
          href="/shop"
          className="ml-2 hidden shrink-0 text-xs font-bold underline-offset-2 hover:underline md:block"
        >
          Shop now
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
