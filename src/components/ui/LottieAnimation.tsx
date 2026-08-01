"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";

interface LottieAnimationProps {
  /** Path to the Lottie JSON file */
  path: string;
  /** Width/height in px (default 80) */
  size?: number;
  /** Should it loop? (default true) */
  loop?: boolean;
  /** Should it autoplay? (default true) */
  autoplay?: boolean;
  /** Optional className */
  className?: string;
  /** Speed multiplier (default 1) */
  speed?: number;
}

export function LottieAnimation({
  path,
  size = 80,
  loop = true,
  autoplay = true,
  className = "",
  speed = 1,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    animRef.current = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop,
      autoplay,
      path,
    });

    animRef.current.setSpeed(speed);

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [path, loop, autoplay, speed]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

