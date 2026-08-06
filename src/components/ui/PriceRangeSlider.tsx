"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPKR } from "@/lib/utils";

interface PriceRangeSliderProps {
  /** Current min value (0 or from URL) */
  min: number;
  /** Current max value */
  max: number;
  /** Absolute lower bound */
  minBound: number;
  /** Absolute upper bound */
  maxBound: number;
  /** Called on pointer/commit with final values */
  onChange: (min: number, max: number) => void;
  unbounded?: boolean;
}

/**
 * Dual-thumb price range slider. Commits on pointer release so it doesn't
 * spam router pushes while dragging. `unbounded` shows "up to" for max.
 */
export function PriceRangeSlider({
  min,
  max,
  minBound,
  maxBound,
  onChange,
  unbounded = false,
}: PriceRangeSliderProps) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<null | "lo" | "hi">(null);

  useEffect(() => {
    setLo(min);
    setHi(max);
  }, [min, max, minBound, maxBound]);

  const valueToPercent = (v: number) =>
    maxBound === minBound
      ? 0
      : ((v - minBound) / (maxBound - minBound)) * 100;

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      const track = trackRef.current;
      if (!track || !dragging.current) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const rawVal = minBound + (pct / 100) * (maxBound - minBound);
      const val = Math.round(Math.max(minBound, Math.min(maxBound, rawVal)));

      if (dragging.current === "lo") {
        setLo(() => Math.min(val, hi - 1));
      } else {
        setHi(() => Math.max(val, lo + 1));
      }
    },
    [lo, hi, minBound, maxBound]
  );

  function commit() {
    if (dragging.current) {
      const nextLo = Math.min(lo, hi - 1);
      const nextHi = Math.max(hi, lo + 1);
      setLo(nextLo);
      setHi(nextHi);
      onChange(nextLo, nextHi);
    }
    dragging.current = null;
  }

  const loPct = valueToPercent(lo);
  const hiPct = valueToPercent(hi);

  return (
    <div>
      <div
        ref={trackRef}
        className="range-slider"
        onPointerMove={handlePointer}
        onPointerUp={commit}
        onPointerLeave={commit}
      >
        <div className="range-slider__track" />
        <div
          className="range-slider__fill"
          style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
        />
        <button
          type="button"
          aria-label="Minimum price"
          className="range-slider__thumb"
          style={{ left: `${loPct}%` }}
          onPointerDown={() => (dragging.current = "lo")}
        />
        <button
          type="button"
          aria-label="Maximum price"
          className="range-slider__thumb"
          style={{ left: `${hiPct}%` }}
          onPointerDown={() => (dragging.current = "hi")}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm font-bold text-muted">
        <span>{formatPKR(lo)}</span>
        <span className="text-xs font-semibold text-muted">
          {unbounded && hi >= maxBound
            ? `Up to ${formatPKR(maxBound)}+`
            : formatPKR(hi)}
        </span>
      </div>
    </div>
  );
}
