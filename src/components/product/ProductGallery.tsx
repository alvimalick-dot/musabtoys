"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { normalizeImagePath } from "@/lib/image-path";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const list = images.length ? images.map(normalizeImagePath).filter(Boolean) : [];
  const swipeStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  function showPrevious() {
    setActive((current) => (current - 1 + list.length) % list.length);
  }

  function showNext() {
    setActive((current) => (current + 1) % list.length);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    swipeStartX.current = event.clientX;
    didSwipe.current = false;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (swipeStartX.current === null || list.length < 2) return;
    const distance = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(distance) < 40) return;
    didSwipe.current = true;
    if (distance > 0) showPrevious();
    else showNext();
  }

  return (
    <div>
      <div className="relative">
        <button
        type="button"
        className="relative aspect-square w-full overflow-hidden rounded-4xl bg-white ring-1 ring-black/5"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          swipeStartX.current = null;
        }}
        onClick={() => {
          if (didSwipe.current) {
            didSwipe.current = false;
            return;
          }
          if (list[active]) setOpen(true);
        }}
      >
        {list[active] ? (
          <Image
            src={list[active]}
            alt={name}
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
        {list[active] && (
          <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow">
            <ZoomIn className="h-3.5 w-3.5" /> Zoom
          </span>
        )}
      </button>

      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous product photo"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next product photo"
            onClick={showNext}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      </div>

      {list.length > 1 && (
        <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1">
          {list.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 sm:h-20 sm:w-20 ${
                i === active ? "ring-coral" : "ring-transparent"
              }`}
            >
              <Image
                src={img}
                alt={`${name} photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {open && list[active] && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink/80 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close lightbox"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-dvh w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={list[active]}
              alt={name}
              className="max-h-[85dvh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
