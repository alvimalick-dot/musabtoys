"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { History } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { normalizeImagePath } from "@/lib/image-path";

interface RecentlyViewedItem {
  slug: string;
  name: string;
  price: number;
  image: string;
}

const STORAGE_KEY = "karachi-toys-recently-viewed";
const MAX = 8;

function readRecent(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * "Recently viewed" rail persisted in localStorage. The current product is
 * passed in so it can be prepended to the list.
 */
export function RecentlyViewed({
  currentSlug,
  currentName,
  currentPrice,
  currentImage,
}: {
  currentSlug: string;
  currentName: string;
  currentPrice: number;
  currentImage: string;
}) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    // Prepend current product, dedupe, cap at MAX
    const existing = readRecent();
    const next = [
      { slug: currentSlug, name: currentName, price: currentPrice, image: currentImage },
      ...existing.filter((i) => i.slug !== currentSlug),
    ].slice(0, MAX);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setItems(next);
  }, [currentSlug, currentName, currentPrice, currentImage]);

  // Don't show the section if only the current product is present
  const toShow = items.filter((i) => i.slug !== currentSlug);
  if (toShow.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-coral" />
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Recently viewed
        </h2>
      </div>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 overscroll-x-contain">
        {toShow.map((item) => (
          <Link
            key={item.slug}
            href={`/product/${item.slug}`}
            className="min-w-40 max-w-50 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-50 sm:max-w-55 dark:bg-slate-800 dark:ring-slate-700"
          >
           <div className="relative aspect-square bg-[#fde8d4] dark:bg-slate-700">
              {item.image ? (
                <Image
                  src={normalizeImagePath(item.image)}
                  alt={item.name}
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
              <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
              <p className="mt-1 font-bold text-coral">{formatPKR(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
