"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPKR } from "@/lib/utils";
import { toast } from "sonner";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Wishlist</h1>
      <p className="mt-2 text-muted">Saved toys — buy when you&apos;re ready.</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center ring-1 ring-black/5">
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
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#fde8d4]">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
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
                  className="btn-primary min-h-11 flex-1 text-xs sm:flex-none"
                  onClick={() => {
                    addItem({
                      productId: item.productId,
                      slug: item.slug,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      stock: 99,
                    });
                    toast.success("Added to cart");
                  }}
                >
                  Add to cart
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
