import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  /** Full-bleed tinted band behind the content (vs. plain page background) */
  band?: boolean;
  bandClassName?: string;
  className?: string;
};

/**
 * Standardized full-width section shell. Every homepage section uses the same
 * vertical rhythm so the page reads as one cohesive composition instead of a
 * stack of differently-spaced blocks.
 *
 * Usage:
 *   <Section band bandClassName="bg-sky/5 dark:bg-sky/10">
 *     <div className="mx-auto max-w-7xl px-4 sm:px-6">…</div>
 *   </Section>
 */
export function Section({
  children,
  band = false,
  bandClassName,
  className,
}: SectionProps) {
  if (band) {
    return (
      <section className={cn("py-14 sm:py-20", bandClassName, className)}>
        {children}
      </section>
    );
  }
  return (
    <section className={cn("py-14 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

