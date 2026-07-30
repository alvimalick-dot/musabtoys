"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductDTO } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus } from "lucide-react";

export function ProductDetailClient({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const images = product.images?.length
    ? product.images
    : [];

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div>
        <motion.div
          className="relative aspect-square overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/5"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {images[active] ? (
            <Image
              src={images[active]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-6xl text-muted/30">
              KT
            </div>
          )}
        </motion.div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 ${
                  i === active ? "ring-coral" : "ring-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">
          {product.category} · {product.brand}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-coral">
            {formatPKR(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-lg text-muted line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm font-semibold">
          {product.stockStatus === "in_stock" && (
            <span className="text-mint">In stock ({product.stock})</span>
          )}
          {product.stockStatus === "low_stock" && (
            <span className="text-coral">Low stock ({product.stock} left)</span>
          )}
          {product.stockStatus === "out_of_stock" && (
            <span className="text-muted">Out of stock</span>
          )}
          <span className="text-muted"> · Age: {product.ageGroup}</span>
        </p>

        <p className="mt-6 leading-relaxed text-muted">
          {product.description || "No description provided."}
        </p>

        {Object.keys(product.specs || {}).length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold">Specifications</h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) =>
                value ? (
                  <div
                    key={key}
                    className="rounded-xl bg-white px-4 py-3 ring-1 ring-black/5"
                  >
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted">
                      {key}
                    </dt>
                    <dd className="mt-1 font-semibold">{String(value)}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 ring-1 ring-black/5">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="rounded-full p-1 hover:bg-black/5"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-bold">{qty}</span>
            <button
              type="button"
              onClick={() =>
                setQty((q) => Math.min(product.stock || 1, q + 1))
              }
              className="rounded-full p-1 hover:bg-black/5"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={product.stockStatus === "out_of_stock"}
            className="btn-primary disabled:opacity-50"
            onClick={() =>
              addItem(
                {
                  productId: product._id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: images[0] || "",
                  stock: product.stock,
                },
                qty
              )
            }
          >
            Add to cart
          </button>
        </div>
      </motion.div>
    </div>
  );
}
