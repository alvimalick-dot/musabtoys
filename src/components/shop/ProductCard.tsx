"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ProductDTO } from "@/types";
import { formatPKR } from "@/lib/utils";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product._id));
  const image = product.images?.[0];

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square bg-[#fff1e0]">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-xl text-muted/40">
              KT
            </div>
          )}
        </Link>
        {product.stockStatus === "out_of_stock" && (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
        {product.stockStatus === "low_stock" && (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Only {product.stock} left
          </span>
        )}
        {(product.newArrival || product.featured) &&
          product.stockStatus !== "out_of_stock" &&
          product.stockStatus !== "low_stock" && (
            <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
              {product.newArrival ? "New" : "Featured"}
            </span>
          )}
        <button
          type="button"
          className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 transition hover:scale-105"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            wishlistToggle({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: image || "",
            });
            toast.success(
              wished ? "Removed from wishlist" : "Saved to wishlist"
            );
          }}
        >
          <Heart
            className={`h-4 w-4 transition ${
              wished ? "fill-coral text-coral" : "text-ink/70"
            }`}
          />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
          {product.brand} · {product.ageGroup}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 min-w-0 font-display text-sm font-semibold leading-snug hover:text-coral sm:text-base"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-coral sm:text-lg">
            {formatPKR(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted line-through sm:text-sm">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={product.stockStatus === "out_of_stock"}
          onClick={() => {
            addItem({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: image || "",
              stock: product.stock,
            });
            toast.success("Added to cart");
          }}
          className="btn-primary mt-auto w-full min-h-11 py-2.5 text-xs sm:mt-4 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
