"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import type { WishlistItem } from "@/store/wishlistStore";
import { formatPKR } from "@/lib/utils";
import { toast } from "sonner";
import { normalizeImagePath } from "@/lib/image-path";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function addWishlistItem(item: WishlistItem) {
    setAddingId(item.productId);
    try {
      const res = await fetch(`/api/products/${item.productId}`);
      const data = await res.json();
      if (!res.ok || !data.product) {
        throw new Error("Product not found");
      }
      const product = data.product;
      if (product.stock <= 0) {
        toast.error(`"${item.name}" is out of stock`);
        return;
      }
      addItem({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: product.price ?? item.price,
        image: item.image,
        stock: product.stock,
      });
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Wishlist</h1>
      <p className="mt-2 text-muted">Saved toys — buy when you&apos;re ready.</p>

      {items.length === 0 ? (
       <div className="mt-10 rounded-2xl bg-white p-10 text-center ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
          <p className="font-display text-2xl">No saved toys yet</p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">
            Browse shop
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li
              key={item.productId}
           className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#fde8d4] dark:bg-slate-700">
                {item.image ? (
                  <Image src={normalizeImagePath(item.image)} alt={item.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">KT</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="line-clamp-2 font-semibold hover:text-coral"
                >
                  {item.name}
                </Link>
                <p className="text-sm font-bold text-coral">{formatPKR(item.price)}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={addingId === item.productId}
                  className="btn-primary min-h-11 flex-1 text-xs sm:flex-none disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => addWishlistItem(item)}
                >
                  {addingId === item.productId
                    ? "Adding…"
                    : "Add to cart"}
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-11 flex-1 text-xs sm:flex-none"
                  onClick={() => {
                    remove(item.productId);
                    toast.message("Removed from wishlist");
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
