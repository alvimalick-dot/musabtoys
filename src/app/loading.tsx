export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-11 w-11 animate-spin rounded-full border-[3px] border-current border-t-transparent text-coral drop-shadow-[0_0_8px_currentColor]" />
        <p className="animate-pulse text-sm font-bold text-muted">
          Loading…
        </p>
      </div>
    </div>
  );
}
