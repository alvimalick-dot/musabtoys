"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPKR } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal } =
    useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl pb-[env(safe-area-inset-bottom)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div>
                <p className="font-display text-xl font-semibold">Your Cart</p>
                <p className="text-sm text-muted">{items.length} item(s)</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-2xl">Cart is empty</p>
                  <p className="mt-2 text-sm text-muted">
                    Discover toys that spark imagination.
                  </p>
                  <Link href="/shop" onClick={closeCart} className="btn-primary mt-6">
                    Browse shop
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex gap-3 rounded-2xl bg-[#fff8f0] p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                        {item.image ? (
                          <Image
                            src={item.image}
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
                            className="min-w-0 flex-1 line-clamp-2 text-sm font-bold leading-snug"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white hover:text-coral"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-coral">
                          {formatPKR(item.price)}
                        </p>
                        <div className="mt-auto flex items-center gap-1 pt-2">
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5"
                            onClick={() =>
                              updateQty(item.productId, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5"
                            onClick={() =>
                              updateQty(item.productId, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-black/5 px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="font-display text-xl font-semibold">
                    {formatPKR(subtotal())}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full min-h-12"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
