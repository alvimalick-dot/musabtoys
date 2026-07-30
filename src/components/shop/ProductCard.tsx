"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductDTO } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images?.[0];

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square bg-[#fff1e0]"
      >
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
        {product.stockStatus === "out_of_stock" && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
        {product.stockStatus === "low_stock" && (
          <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Only {product.stock} left
          </span>
        )}
        {product.featured &&
          product.stockStatus !== "out_of_stock" &&
          product.stockStatus !== "low_stock" && (
            <span className="absolute left-2 top-2 rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
              Featured
            </span>
          )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
          {product.brand} · {product.ageGroup}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug hover:text-coral sm:text-base"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
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
          onClick={() =>
            addItem({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: image || "",
              stock: product.stock,
            })
          }
          className="btn-primary mt-auto w-full py-2 text-xs sm:mt-4 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
