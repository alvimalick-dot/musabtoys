"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ProductDTO } from "@/types";
import { ProductCard } from "./ProductCard";
import { formatPKR } from "@/lib/utils";

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

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q.trim());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
          Catalog
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Shop all toys
        </h1>
        <p className="mt-2 text-muted">
          Filter by category, age, brand, price, and stock — typo-tolerant search
          included.
        </p>
      </div>

      <form onSubmit={onSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search toys, brands, SKUs…"
            className="input-field pl-11"
          />
        </div>
        <button type="submit" className="btn-primary shrink-0">
          Search
        </button>
      </form>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-5 rounded-[1.5rem] bg-white p-5 ring-1 ring-black/5 h-fit">
          <div className="flex items-center gap-2 font-bold">
            <SlidersHorizontal className="h-4 w-4 text-coral" />
            Filters
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
            onClick={() => router.push("/shop")}
          >
            Clear filters
          </button>
        </aside>

        <div>
          {(loading || pending) && (
            <p className="mb-4 text-sm text-muted">Loading products…</p>
          )}
          {error && (
            <div className="mb-6 rounded-2xl bg-coral/10 p-4 text-sm text-coral-deep">
              <p className="font-bold">Could not load products</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-muted">
                Make sure MongoDB is connected in <code>.env.local</code>, then
                seed sample data from the admin panel or setup guide.
              </p>
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

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data?.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {data && data.products.length === 0 && !error && (
            <div className="rounded-[1.5rem] bg-white p-12 text-center ring-1 ring-black/5">
              <p className="font-display text-2xl">No toys match</p>
              <p className="mt-2 text-muted">
                Try clearing filters or uploading inventory in Admin.
              </p>
            </div>
          )}

          {data && data.pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => updateParam("page", String(page))}
                    className={`h-10 w-10 rounded-full text-sm font-bold ${
                      page === data.pagination.page
                        ? "bg-ink text-white"
                        : "bg-white ring-1 ring-black/5"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        className="input-field"
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
