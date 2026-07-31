export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"
        >
          <div className="aspect-square bg-[#f3e8ff]" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/2 rounded bg-[#f3e8ff]" />
            <div className="h-4 w-full rounded bg-[#f3e8ff]" />
            <div className="h-4 w-1/3 rounded bg-[#f3e8ff]" />
            <div className="mt-3 h-9 w-full rounded-full bg-[#f3e8ff]" />
          </div>
        </div>
      ))}
    </div>
  );
}
