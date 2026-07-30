import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <span className="shrink-0 text-muted/50">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="shrink-0 hover:text-coral">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`font-semibold text-ink ${
                    isLast ? "line-clamp-1 max-w-[65vw] sm:max-w-md" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
