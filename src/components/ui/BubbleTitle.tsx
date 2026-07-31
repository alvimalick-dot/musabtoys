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
};

const DEFAULT_PALETTE = [
  "linear-gradient(180deg, #a78bfa 0%, #7c3aed 45%, #6d28d9 100%)", // purple
  "linear-gradient(180deg, #86efac 0%, #22c55e 45%, #16a34a 100%)", // green
  "linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 45%, #0284c7 100%)", // blue
  "linear-gradient(180deg, #fdba74 0%, #f97316 45%, #ea580c 100%)", // orange
];

export function BubbleTitle({
  children,
  variant = "standard",
  className,
  colorClass = "text-slate-800",
  palette = DEFAULT_PALETTE,
}: BubbleTitleProps) {
  if (variant === "logo") {
    const letters = children.split("");
    return (
      <span
        className={cn(
          "font-display font-semibold select-none whitespace-nowrap",
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
          return (
            <span
              key={i}
              className="bubble-gel-letter"
              style={{
                backgroundImage: palette[i % palette.length],
              }}
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

