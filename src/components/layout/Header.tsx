"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/track", label: "Track" },
  { href: "/faq", label: "FAQ" },
  { href: "/checkout", label: "Checkout" },
];

export function Header() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCart = useCartStore((s) => s.openCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fff8f0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2">
          <motion.span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-coral text-base font-bold text-white shadow-lg shadow-coral/30 sm:h-10 sm:w-10 sm:text-lg"
            whileHover={{ rotate: -8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          >
            KT
          </motion.span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-sm font-semibold tracking-tight text-ink sm:text-lg">
              Karachi Toy Shop
            </p>
            <p className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-muted sm:block">
              Play · Discover · Delight
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold transition",
                pathname === link.href
                  ? "bg-ink text-white"
                  : "text-ink/70 hover:bg-black/5 hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/shop"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-black/5 sm:flex"
            aria-label="Search shop"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-black/5"
            aria-label="Wishlist"
          >
            <Heart
              className={`h-4 w-4 ${
                wishlistCount > 0 ? "fill-coral text-coral" : ""
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-sky text-white shadow-md shadow-sky/30"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1 text-[11px] font-bold text-ink">
                {totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-black/5 bg-[#fff8f0] px-4 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3.5 text-base font-semibold text-ink hover:bg-black/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-xl px-3 py-3.5 text-base font-semibold text-ink hover:bg-black/5 sm:hidden"
          >
            <Search className="h-4 w-4" /> Search shop
          </Link>
        </div>
      )}
    </header>
  );
}
