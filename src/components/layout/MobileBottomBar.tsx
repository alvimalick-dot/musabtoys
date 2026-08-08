"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { formatPKR } from "@/lib/utils";

/**
 * Sticky bottom action bar for mobile — keeps cart, wishlist and chat
 * one thumb-tap away. Hidden on desktop (lg:hidden).
 *
 * Hidden on the checkout page so the "Place order" button is the only
 * call to action and no screen real estate is given to nav chrome.
 */
export function MobileBottomBar() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
const subtotal = useCartStore((s) => s.subtotal());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  // Hide nav chrome on the checkout page — keep "Place order" the focus.
  if (pathname === "/checkout") return null;

  return (
<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-header-solid/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around gap-1 px-2 py-2">
        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-1 items-center justify-center gap-2 rounded-full bg-coral px-3 py-2.5 text-white shadow-sm"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="text-sm font-bold">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1 text-[11px] font-bold text-ink">
              {totalItems}
            </span>
          )}
        </button>
        <Link
          href="/wishlist"
className="relative flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2.5 text-ink ring-1 ring-black/5 dark:bg-raised dark:text-white dark:ring-white/10"
          aria-label="Wishlist"
        >
          <Heart
            className={`h-4 w-4 ${wishlistCount > 0 ? "fill-coral text-coral" : ""}`}
          />
          <span className="text-sm font-bold">Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white">
              {wishlistCount}
            </span>
          )}
        </Link>
        <a
          href={whatsappChatUrl()}
          target="_blank"
          rel="noreferrer"
className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2.5 text-ink ring-1 ring-black/5 dark:bg-raised dark:text-white dark:ring-white/10"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span className="text-sm font-bold">Chat</span>
        </a>
      </div>
      {totalItems > 0 && (
        <p className="pb-1 text-center text-xs font-semibold text-muted">
          Subtotal: <span className="text-coral">{formatPKR(subtotal)}</span>
        </p>
      )}
    </div>
  );
}
