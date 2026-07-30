"use client";

import { useState } from "react";
import { Heart, Minus, Plus, MessageCircle, Share2 } from "lucide-react";
import type { ProductDTO } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  whatsappProductAskUrl,
  whatsappRestockUrl,
  whatsappShareProductUrl,
} from "@/lib/whatsapp";
import { toast } from "sonner";

export function ProductDetailClient({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product._id));
  const [qty, setQty] = useState(1);
  const [alertPhone, setAlertPhone] = useState("");
  const images = product.images?.length ? product.images : [];

  async function notifyStock() {
    try {
      const res = await fetch("/api/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug, phone: alertPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(data.message);
      // Also open WhatsApp so they can ping the shop directly
      window.open(
        whatsappRestockUrl({
          name: product.name,
          slug: product.slug,
          phone: alertPhone,
        }),
        "_blank",
        "noopener,noreferrer"
      );
      setAlertPhone("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          {
            label: product.category,
            href: `/shop?category=${encodeURIComponent(product.category)}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} name={product.name} />

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">
            {product.category} · {product.brand}
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 break-words font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/5"
              aria-label="Wishlist"
              onClick={() => {
                wishlistToggle({
                  productId: product._id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: images[0] || "",
                });
                toast.success(
                  wished ? "Removed from wishlist" : "Saved to wishlist"
                );
              }}
            >
              <Heart
                className={`h-5 w-5 ${wished ? "fill-coral text-coral" : ""}`}
              />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-bold text-coral sm:text-3xl">
              {formatPKR(product.price)}
            </span>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span className="text-base text-muted line-through sm:text-lg">
                  {formatPKR(product.compareAtPrice)}
                </span>
              )}
          </div>

          <p className="mt-2 text-sm font-semibold">
            {product.stockStatus === "in_stock" && (
              <span className="text-mint">In stock ({product.stock})</span>
            )}
            {product.stockStatus === "low_stock" && (
              <span className="text-coral">
                Low stock — only {product.stock} left
              </span>
            )}
            {product.stockStatus === "out_of_stock" && (
              <span className="text-muted">Out of stock</span>
            )}
            <span className="text-muted"> · Age: {product.ageGroup}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Karachi usually 1–3 days · COD available · Pay when it arrives
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={whatsappProductAskUrl({
                name: product.name,
                slug: product.slug,
                price: product.price,
              })}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary min-h-11 text-sm"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Ask on WhatsApp
            </a>
            <a
              href={whatsappShareProductUrl({
                name: product.name,
                slug: product.slug,
                price: product.price,
              })}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary min-h-11 text-sm"
            >
              <Share2 className="h-4 w-4" />
              Share
            </a>
          </div>

          <p className="mt-6 leading-relaxed text-muted">
            {product.description || "No description provided."}
          </p>

          {Object.keys(product.specs || {}).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold">
                Specifications
              </h2>
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

          {product.stockStatus === "out_of_stock" ? (
            <div className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <p className="font-bold">Notify me when back</p>
              <p className="mt-1 text-sm text-muted">
                Save your number, then WhatsApp us so we can alert you faster.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className="input-field min-w-0 flex-1"
                  placeholder="03XXXXXXXXX"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary shrink-0"
                  onClick={notifyStock}
                >
                  Notify + WhatsApp
                </button>
              </div>
              <a
                href={whatsappRestockUrl({
                  name: product.name,
                  slug: product.slug,
                })}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-bold text-[#128C7E]"
              >
                Or message on WhatsApp only →
              </a>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex w-fit items-center gap-1 rounded-full bg-white px-2 py-1.5 ring-1 ring-black/5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQty((q) => Math.min(product.stock || 1, q + 1))
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                className="btn-primary min-h-12 w-full sm:w-auto"
                onClick={() => {
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
                  );
                  toast.success("Added to cart");
                }}
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
