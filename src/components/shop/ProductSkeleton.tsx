"use client";

import { LottieAnimation } from "@/components/ui/LottieAnimation";

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-raised dark:ring-white/10"
        >
<div className="kt-shimmer flex aspect-square items-center justify-center bg-[#fcf4ec] dark:bg-[#1a1a1a]">
            <LottieAnimation path="/lottie/loading.json" size={48} />
          </div>
          <div className="space-y-2 p-3">
            <div className="kt-shimmer h-3 w-1/2 rounded-full bg-[#fcf4ec] dark:bg-[#1a1a1a]" /> 
            <div className="kt-shimmer h-4 w-full rounded-full bg-[#fcf4ec] dark:bg-[#1a1a1a]" /> 
            <div className="kt-shimmer h-4 w-1/3 rounded-full bg-[#fcf4ec] dark:bg-[#1a1a1a]" /> 
            <div className="kt-shimmer mt-3 h-9 w-full rounded-full bg-[#fcf4ec] dark:bg-[#1a1a1a]" />
          </div>
        </div>
      ))}
    </div>
  );
}

