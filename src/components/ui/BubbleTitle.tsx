"use client";

import { cn } from "@/lib/utils";

type BubbleTitleProps = {
  /** The text to render. */
  children: string;
  /** "standard" = heavy dark-slate product title. "logo" = 3D glossy gel letters. */
  variant?: "standard" | "logo";
  /** Tailwind classes to pass through (sizing, spacing, etc.). */
  className?: string;
  /** Optional accent color for the "standard" variant (defaults to dark slate). */
  colorClass?: string;
  /** For "logo" variant — palette used for per-letter colors. */
  palette?: string[];
  /** Gentle idle bob on the whole wordmark (default true for logo variant). */
  animate?: boolean;
  /** Playful alternating tilt per letter (default true for logo variant). */
  tilt?: boolean;
};

const DEFAULT_PALETTE = [
  "linear-gradient(180deg, #fdba74 0%, #f97316 45%, #ea580c 100%)", // orange
  "linear-gradient(180deg, #fbbf24 0%, #f59e0b 45%, #d97706 100%)", // gold
  "linear-gradient(180deg, #fb923c 0%, #f97316 45%, #c2410c 100%)", // deep orange
  "linear-gradient(180deg, #fde68a 0%, #f59e0b 45%, #b45309 100%)", // amber
];

const TILTS = [-3, 2.5, -2, 3, -2.5, 2];

export function BubbleTitle({
  children,
  variant = "standard",
  className,
  colorClass = "text-slate-800",
  palette = DEFAULT_PALETTE,
  animate = true,
  tilt = true,
}: BubbleTitleProps) {
  if (variant === "logo") {
    const letters = children.split("");
    return (
      <span
        className={cn(
          "bubble-title-hover font-display font-semibold select-none whitespace-nowrap",
          animate && "kt-bubble-idle",
          className
        )}
        aria-label={children}
        role="text"
      >
        {letters.map((letter, i) => {
          // Skip empty spaces but keep them as spacing
          if (letter === " ") {
            return <span key={i}>&nbsp;</span>;
          }
          const letterTilt = tilt ? TILTS[i % TILTS.length] : 0;
          return (
            <span
              key={i}
              className="bubble-gel-letter"
              style={
                {
                  backgroundImage: palette[i % palette.length],
                  // Staggered bounce-in + per-letter tilt
                  animationDelay: `${i * 0.07}s`,
                  "--tilt": `${letterTilt}deg`,
                } as React.CSSProperties
              }
            >
              {letter}
            </span>
          );
        })}
      </span>
    );
  }

  // Standard variant — heavy weight, dark slate color
  return (
    <span
      className={cn(
        "font-display font-bold leading-[1.1] tracking-tight",
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

