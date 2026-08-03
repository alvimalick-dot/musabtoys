"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  // Bounce cart badge whenever count increases
  const prevCount = useRef(totalItems);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (totalItems > prevCount.current) setBump((n) => n + 1);
    prevCount.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background,box-shadow,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-black/5 bg-[#fef6ed]/85 shadow-[0_8px_28px_-16px_rgba(26,21,48,0.25)] backdrop-blur-xl"
          : "border-transparent bg-[#fef6ed]/70 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2">
          <motion.div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-lg shadow-black/10 sm:h-10 sm:w-10"
            whileHover={{ rotate: -8, scale: 1.05 }}
            whileTap={{ scale: 0.92, rotate: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          >
            <Image
              src="/images/logo.png"
              alt="Karachi Toys logo"
              fill
              sizes="40px"
              className="object-contain"
            />
          </motion.div>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-sm font-semibold tracking-tight text-ink sm:text-lg">
              Karachi Toys
            </p>
            <p className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-muted sm:block">
              Play · Discover · Delight
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-white"
                    : "text-ink/70 hover:text-ink"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {!active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-transparent transition-colors group-hover:bg-black/5" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/shop"
            className="press hidden h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:flex"
            aria-label="Search shop"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href="/wishlist"
            className="press relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
            aria-label="Wishlist"
          >
            <Heart
              className={`h-4 w-4 transition ${
                wishlistCount > 0 ? "fill-coral text-coral" : ""
              }`}
            />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <motion.button
            type="button"
            onClick={openCart}
            className="press relative flex h-10 w-10 items-center justify-center rounded-full bg-sky text-white shadow-md shadow-sky/30"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key={`badge-${bump}`}
                  initial={{ scale: 0.4, opacity: 0, y: -4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 18 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1 text-[11px] font-bold text-ink"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <button
            type="button"
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-black/5 bg-[#fef6ed] px-4 py-3 lg:hidden"
          >
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-3.5 text-base font-semibold transition",
                    pathname === link.href
                      ? "bg-ink text-white"
                      : "text-ink hover:bg-black/5"
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-3.5 text-base font-semibold text-ink hover:bg-black/5 sm:hidden"
            >
              <Search className="h-4 w-4" /> Search shop
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
