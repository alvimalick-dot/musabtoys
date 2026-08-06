"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { formatPKR } from "@/lib/utils";
import { normalizeImagePath } from "@/lib/image-path";

// Related cards only render name, price, slug, and the first image — so the
// server sends a slim object instead of the full ProductDTO (no description,
// specs, or full image array).
export interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
}

export function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 className="font-display text-3xl font-semibold">You may also like</h2>
      <div className="mt-6 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((p) => (
            <Link
              key={p._id}
              href={`/product/${p.slug}`}
             className="min-w-40 max-w-50 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-50 sm:max-w-55 dark:bg-slate-800 dark:ring-slate-700"
            >
             <div className="relative aspect-square bg-[#fde8d4] dark:bg-slate-700">
                {p.images?.[0] ? (
                  <Image
                    src={normalizeImagePath(p.images[0])}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-xl text-muted/40">
                    KT
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                <p className="mt-1 font-bold text-coral">{formatPKR(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
