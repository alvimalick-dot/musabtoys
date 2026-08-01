"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  /** Target number to count up to */
  target: number;
  /** Prefix (e.g. "PKR ", "+", "₹") */
  prefix?: string;
  /** Suffix (e.g. "+", " toys", " reviews") */
  suffix?: string;
  /** Duration in seconds (default 2) */
  duration?: number;
  /** Format as currency? (default false) */
  format?: boolean;
}

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2,
  format = false,
}: AnimatedCounterProps) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      
      gsap.to(obj, {
        val: target,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        onUpdate: () => {
          el.textContent = `${prefix}${format ? obj.val.toLocaleString("en-PK") : Math.round(obj.val)}${suffix}`;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [target, prefix, suffix, duration, format]);

  return <span ref={elRef}>0</span>;
}

