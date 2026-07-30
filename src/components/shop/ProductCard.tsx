"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ProductDTO } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images?.[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] bg-[#fff1e0]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-2xl text-muted/40">
            KT
          </div>
        )}
        {product.stockStatus === "out_of_stock" && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
        {product.featured && product.stockStatus !== "out_of_stock" && (
          <span className="absolute left-3 top-3 rounded-full bg-sun px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">
          {product.brand} · {product.ageGroup}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 font-display text-lg font-semibold leading-snug hover:text-coral"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-coral">
            {formatPKR(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-muted line-through">
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
          className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
    </motion.article>
  );
}
