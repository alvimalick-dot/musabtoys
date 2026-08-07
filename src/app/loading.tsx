export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-current border-t-transparent text-coral" />
        <p className="animate-pulse text-sm font-semibold text-muted">
          Loading…
        </p>
      </div>
    </div>
  );
}
