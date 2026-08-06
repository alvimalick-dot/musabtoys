import { Banknote, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

const badges = [
  {
    icon: Banknote,
    title: "Cash on Delivery",
    text: "Pay when it arrives",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "1–3 days nationwide",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    text: "Safe & trusted",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    text: "Hassle-free policy",
  },
];

/**
 * Compact trust badges shown near the add-to-cart / checkout CTAs.
 * Uses PKR/COD-friendly messaging for the Pakistan market.
 */
export function TrustBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid w-full gap-2 ${
        compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {badges.map((b) => (
<div
          key={b.title}
className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5 ring-1 ring-black/5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral/10 text-coral">
            <b.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight">
              {b.title}
            </p>
            {!compact && (
              <p className="truncate text-[11px] text-muted">{b.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
