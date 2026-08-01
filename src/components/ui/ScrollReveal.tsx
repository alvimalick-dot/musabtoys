"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  /** Direction: up | down | left | right | scale | blur */
  variant?: "up" | "down" | "left" | "right" | "scale" | "blur";
  /** Delay in seconds before animation starts (can stagger multiple) */
  delay?: number;
  /** Duration in seconds (default 0.8) */
  duration?: number;
  /** Distance to travel in px (default 60) */
  distance?: number;
  /** Root margin for ScrollTrigger (default "0px 0px -80px 0px") */
  margin?: string;
  /** Optional className to pass through */
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.8,
  distance = 60,
  margin = "0px 0px -80px 0px",
  className = "",
}: ScrollRevealProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let fromVars: gsap.TweenVars = {};
    
    switch (variant) {
      case "up":
        fromVars = { y: distance, opacity: 0 };
        break;
      case "down":
        fromVars = { y: -distance, opacity: 0 };
        break;
      case "left":
        fromVars = { x: -distance, opacity: 0 };
        break;
      case "right":
        fromVars = { x: distance, opacity: 0 };
        break;
      case "scale":
        fromVars = { scale: 0.8, opacity: 0 };
        break;
      case "blur":
        fromVars = { filter: "blur(8px)", opacity: 0 };
        break;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        fromVars,
        {
          y: variant === "up" ? 0 : undefined,
          x: variant === "left" || variant === "right" ? 0 : undefined,
          scale: variant === "scale" ? 1 : undefined,
          filter: variant === "blur" ? "blur(0px)" : undefined,
          opacity: 1,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [variant, delay, duration, distance, margin]);

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
}

