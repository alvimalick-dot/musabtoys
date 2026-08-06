"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useRef, useState } from "react";
import type { ProductDTO } from "@/types";
import { formatPKR } from "@/lib/utils";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { BubbleTitle } from "@/components/ui/BubbleTitle";
import { normalizeImagePath } from "@/lib/image-path";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product._id));
  const image = product.images?.[0] ? normalizeImagePath(product.images[0]) : "";
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltFrameRef = useRef<number>(0);
  const [glowColor, setGlowColor] = useState<string | null>(null);

  // Always derive stock state from the actual number so badges never go stale
  const isOutOfStock =
    product.stockStatus === "out_of_stock" || product.stock <= 0;
  const isLowStock =
    (product.stockStatus === "low_stock" ||
      (product.stock > 0 && product.stock <= 5)) &&
    !isOutOfStock;

  const activateGlow = () => {
    const palette = ["#e11d48", "#d4a017", "#0891b2", "#22c55e", "#f97316", "#be123c"];
    const nextColor = palette[Math.floor(Math.random() * palette.length)];
    setGlowColor(nextColor);
  };

  const resetGlow = () => setGlowColor(null);

  // 3D tilt on mouse move
  function onMouseMove(e: React.MouseEvent) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tiltFrameRef.current) cancelAnimationFrame(tiltFrameRef.current);
    tiltFrameRef.current = requestAnimationFrame(() => {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      tiltFrameRef.current = 0;
    });
  }

  function onMouseLeave() {
    if (tiltFrameRef.current) cancelAnimationFrame(tiltFrameRef.current);
    tiltFrameRef.current = 0;
    resetGlow();
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
  }

  async function handleAddToCart() {
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: image || "",
      stock: product.stock,
    });
    toast.success("Added to cart");
    // Load this visual-only library only after the user actually adds an item.
    const { default: confetti } = await import("canvas-confetti");
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#e11d48", "#d4a017", "#0891b2", "#22c55e"],
    });
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={activateGlow}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchStart={activateGlow}
      onTouchEnd={resetGlow}
      onTouchCancel={resetGlow}
      style={
        glowColor
          ? {
              borderColor: glowColor,
              boxShadow: `0 0 0 1px ${glowColor} inset, 0 0 24px ${glowColor}55, 0 12px 30px -12px ${glowColor}33`,
            }
          : undefined
      }
className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-transform duration-200 ease-out will-change-transform"
    >
      <article className="relative flex h-full min-w-0 flex-col">
<div className="relative aspect-square bg-[#fde8d4] dark:bg-slate-700">
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
          {isOutOfStock ? (
            <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-coral-deep px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Sold out
            </span>
          ) : (
            <>
              {(product.newArrival || product.featured) && (
                <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                  {product.newArrival ? "New" : "Featured"}
                </span>
              )}
              {isLowStock && (
                <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Only {product.stock} left
                </span>
              )}
            </>
          )}
          <button
            type="button"
className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 transition hover:scale-105 dark:bg-slate-800 dark:ring-slate-700"
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
<BubbleTitle variant="standard" colorClass="text-slate-800 dark:text-slate-100">
              {product.name}
            </BubbleTitle>
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
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="btn-primary mt-auto w-full min-h-11 py-2.5 text-xs sm:mt-4 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </article>
    </div>
  );
}
