"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Forces a fresh server request for the current page whenever the tab
 * regains focus after being backgrounded for a while. Without this,
 * server-rendered pages (home, product detail) never refresh themselves —
 * ISR's `revalidate` only helps brand-new requests, not a tab that's
 * already loaded and sitting in the background.
 */
export function RouterRefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    let hiddenAt: number | null = null;
    const STALE_AFTER_MS = 30_000;

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible") {
        if (hiddenAt && Date.now() - hiddenAt > STALE_AFTER_MS) {
          router.refresh();
        }
        hiddenAt = null;
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [router]);

  return null;
}

