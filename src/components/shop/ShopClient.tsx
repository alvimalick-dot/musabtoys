"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ProductDTO } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import { formatPKR } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface Facets {
  categories: string[];
  brands: string[];
  ageGroups: string[];
}

interface ProductsResponse {
  products: ProductDTO[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: Facets;
  error?: string;
}

export function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [productListRef] = useAutoAnimate({ duration: 250 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products?${searchParams.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load products");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q.trim());
  }

  const filterPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold">
          <SlidersHorizontal className="h-4 w-4 text-coral" />
          Filters
        </div>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-black/5 lg:hidden"
          onClick={() => setFiltersOpen(false)}
          aria-label="Close filters"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <FilterSelect
        label="Category"
        value={searchParams.get("category") || ""}
        options={data?.facets.categories || []}
        onChange={(v) => updateParam("category", v)}
      />
      <FilterSelect
        label="Brand"
        value={searchParams.get("brand") || ""}
        options={data?.facets.brands || []}
        onChange={(v) => updateParam("brand", v)}
      />
      <FilterSelect
        label="Age group"
        value={searchParams.get("ageGroup") || ""}
        options={data?.facets.ageGroups || []}
        onChange={(v) => updateParam("ageGroup", v)}
      />
      <FilterSelect
        label="Stock"
        value={searchParams.get("stockStatus") || ""}
        options={["in_stock", "low_stock", "out_of_stock"]}
        onChange={(v) => updateParam("stockStatus", v)}
        labels={{
          in_stock: "In stock",
          low_stock: "Low stock",
          out_of_stock: "Out of stock",
        }}
      />

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
          Min price (PKR)
        </label>
        <input
          type="number"
          min={0}
          className="input-field"
          defaultValue={searchParams.get("minPrice") || ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
          Max price (PKR)
        </label>
        <input
          type="number"
          min={0}
          className="input-field"
          defaultValue={searchParams.get("maxPrice") || ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
        />
      </div>

      <FilterSelect
        label="Sort"
        value={searchParams.get("sort") || "newest"}
        options={["newest", "price_asc", "price_desc", "name"]}
        onChange={(v) => updateParam("sort", v)}
        labels={{
          newest: "Newest",
          price_asc: "Price: Low to High",
          price_desc: "Price: High to Low",
          name: "Name A–Z",
        }}
      />

      <button
        type="button"
        className="btn-secondary w-full text-sm"
        onClick={() => {
          router.push("/shop");
          setFiltersOpen(false);
        }}
      >
        Clear filters
      </button>
    </div>
  );

  const pages = data?.pagination.pages || 1;
  const currentPage = data?.pagination.page || 1;
  const pageButtons = buildPageWindow(currentPage, pages);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop" },
          ]}
        />
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
          Catalog
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">
          Shop all toys
        </h1>
        <p className="mt-2 text-muted">
          Filter by category, age, brand, price, and stock — typo-tolerant search
          included.
        </p>
      </div>

<form onSubmit={onSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search toys, brands, SKUs…"
            className="input-field"
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button type="submit" className="btn-primary min-h-12 w-full sm:w-auto">
            Search
          </button>
          <button
            type="button"
            className="btn-secondary min-h-12 w-full lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </form>

      {/* Budget chips — mobile-friendly quick filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
        {(
          [
            { label: "All prices", min: "", max: "" },
            { label: "Under 500", min: "", max: "500" },
            { label: "Under 1,000", min: "", max: "1000" },
            { label: "Under 2,000", min: "", max: "2000" },
            { label: "Under 5,000", min: "", max: "5000" },
            { label: "5,000+", min: "5000", max: "" },
          ] as const
        ).map((b) => {
          const active =
            (searchParams.get("minPrice") || "") === b.min &&
            (searchParams.get("maxPrice") || "") === b.max;
          return (
            <button
              key={b.label}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (b.min) params.set("minPrice", b.min);
                else params.delete("minPrice");
                if (b.max) params.set("maxPrice", b.max);
                else params.delete("maxPrice");
                params.delete("page");
                startTransition(() => {
                  router.push(`/shop?${params.toString()}`);
                });
              }}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-ink text-white"
                  : "bg-white text-ink ring-1 ring-black/5 hover:bg-black/5"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Desktop sidebar — fixed width, never crushed by product grid */}
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-white p-5 ring-1 ring-black/5 lg:sticky lg:top-24 lg:block">
          {filterPanel}
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Close filters overlay"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[min(85vh,100dvh)] overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
              {filterPanel}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {(loading || pending) && !data && <ProductSkeletonGrid />}
          {(loading || pending) && data && (
            <p className="mb-4 text-sm text-muted">Updating results…</p>
          )}
          {error && (
            <div className="mb-6 rounded-2xl bg-coral/10 p-4 text-sm text-coral-deep">
              <p className="font-bold">Could not load products</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {data && (
            <p className="mb-4 text-sm text-muted">
              Showing {data.products.length} of {data.pagination.total} products
              {searchParams.get("minPrice") || searchParams.get("maxPrice")
                ? ` · ${formatPKR(Number(searchParams.get("minPrice") || 0))} – ${formatPKR(Number(searchParams.get("maxPrice") || 150000))}`
                : ""}
            </p>
          )}

          <motion.div
            ref={productListRef}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {data?.products.map((p, i) => (
              <motion.div
                key={p._id}
                custom={i}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>

          {data && data.products.length === 0 && !error && (
            <div className="rounded-[1.5rem] bg-white p-12 text-center ring-1 ring-black/5">
              <p className="font-display text-2xl">No toys match</p>
              <p className="mt-2 text-muted">
                Try clearing filters or a different search.
              </p>
            </div>
          )}

          {data && pages > 1 && (
            <nav className="mt-8 flex flex-wrap justify-center gap-2 pb-4" aria-label="Product pagination">
              <button
                type="button"
                disabled={currentPage <= 1}
                aria-disabled={currentPage <= 1}
                aria-label="Previous page"
                onClick={() => updateParam("page", String(currentPage - 1))}
                className="h-11 rounded-full bg-white px-4 text-sm font-bold ring-1 ring-black/5 disabled:opacity-40"
              >
                Prev
              </button>
              {pageButtons.map((page, idx) =>
                page === "…" ? (
                  <span key={`e-${idx}`} className="px-1 text-muted" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    onClick={() => updateParam("page", String(page))}
                    className={`h-11 w-11 rounded-full text-sm font-bold ${
                      page === currentPage
                        ? "bg-ink text-white"
                        : "bg-white ring-1 ring-black/5"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={currentPage >= pages}
                aria-disabled={currentPage >= pages}
                aria-label="Next page"
                onClick={() => updateParam("page", String(currentPage + 1))}
                className="h-11 rounded-full bg-white px-4 text-sm font-bold ring-1 ring-black/5 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function buildPageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  labels,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        className="input-field max-w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels?.[opt] || opt}
          </option>
        ))}
      </select>
    </div>
  );
}
