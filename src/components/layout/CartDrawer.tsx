"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPKR } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/commerce";
import { normalizeImagePath } from "@/lib/image-path";

// lottie-web is sizeable and is only needed when an empty cart is opened.
const LottieAnimation = dynamic(
  () => import("@/components/ui/LottieAnimation").then((mod) => mod.LottieAnimation),
  { ssr: false }
);

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal } =
    useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sub = subtotal();
  const progress = Math.min(1, sub / FREE_SHIPPING_THRESHOLD);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - sub);
  const eligible = sub >= FREE_SHIPPING_THRESHOLD;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-60 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-70 flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl pb-[env(safe-area-inset-bottom)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div>
                <p className="font-display text-xl font-semibold">Your Cart</p>
                <p className="text-sm text-muted">{items.length} item(s)</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="press flex h-11 w-11 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length > 0 && (
              <div className="border-b border-black/5 px-5 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <Truck className="h-3.5 w-3.5 text-coral" />
                  {eligible ? (
                    <span className="text-mint">
                      You&apos;ve unlocked free shipping!
                    </span>
                  ) : (
                    <span>
                      Add{" "}
                      <span className="font-bold text-ink">
                        {formatPKR(remaining)}
                      </span>{" "}
                      more for free shipping
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-coral via-sun to-mint"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {items.length === 0 ? (
                <motion.div
                  className="flex h-full flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex h-24 w-24 items-center justify-center">
                    <LottieAnimation path="/lottie/cart-jump.json" size={96} />
                  </div>
                  <p className="mt-2 font-display text-2xl">Cart is empty</p>
                  <p className="mt-2 text-sm text-muted">
                    Discover toys that spark imagination.
                  </p>
                  <Link href="/shop" onClick={closeCart} className="btn-primary mt-6">
                    Browse shop
                  </Link>
                </motion.div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -80, height: 0, marginTop: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                        className="flex gap-3 rounded-2xl bg-[#fef6ed] p-3"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                          {item.image ? (
                            <Image
                              src={normalizeImagePath(item.image)}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={closeCart}
                              className="min-w-0 flex-1 line-clamp-2 text-sm font-bold leading-snug hover:text-coral"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white hover:text-coral"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-coral">
                            {formatPKR(item.price)}
                          </p>
                          <div className="mt-auto flex items-center gap-1 pt-2">
                            <motion.button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5"
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQty(item.productId, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </motion.button>
                            <span className="w-8 text-center text-sm font-bold">
                              <motion.span
                                key={item.quantity}
                                initial={{ y: -6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.18 }}
                                className="inline-block"
                              >
                                {item.quantity}
                              </motion.span>
                            </span>
                            <motion.button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5"
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQty(item.productId, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <motion.div
                className="border-t border-black/5 px-5 py-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <motion.span
                    key={sub}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    className="font-display text-xl font-semibold"
                  >
                    {formatPKR(sub)}
                  </motion.span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full min-h-12"
                >
                  Checkout
                </Link>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
