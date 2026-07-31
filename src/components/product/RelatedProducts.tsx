"use client";

import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { formatPKR } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function RelatedProducts({ products }: { products: ProductDTO[] }) {
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
              className="min-w-[160px] max-w-[200px] shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-[200px] sm:max-w-[220px]"
            >
              <div className="relative aspect-square bg-[#fde8d4]">
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0]}
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
