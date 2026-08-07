import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small uppercase eyebrow label above the heading */
  eyebrow?: string;
  /** Primary heading text */
  title: string;
  /** Optional secondary accent in the title (rendered in coral) */
  accent?: string;
  /** Optional description/subtitle below the heading */
  description?: string;
  /** Optional right-aligned action (e.g. "Shop all" link) */
  action?: ReactNode;
  /** Tint color for the eyebrow — maps to a Tailwind text color */
  eyebrowColor?: string;
  /** Tint color for the accent word in the title — maps to a Tailwind text color */
  accentColor?: string;
  className?: string;
  align?: "left" | "center";
}

/**
 * Reusable section heading to keep the heading hierarchy consistent
 * across all homepage/product sections.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  action,
  eyebrowColor = "text-coral",
  accentColor = "text-coral",
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "flex flex-col items-center")}>
        {eyebrow && (
          <p
            className={cn(
              "text-sm font-bold uppercase tracking-[0.22em]",
              eyebrowColor
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl"
          )}
        >
{title}
          {accent && <span className={accentColor}> {accent}</span>}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
