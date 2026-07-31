"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatPKR } from "@/lib/utils";

type ProductRow = {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  stockStatus?: string;
  category: string;
  brand: string;
  ageGroup: string;
  images?: string[];
  featured?: boolean;
  newArrival?: boolean;
  description?: string;
  slug?: string;
};

const AGE_OPTIONS = [
  "All Ages",
  "0-3 years",
  "3-5 years",
  "6-9 years",
  "10+ years",
  "14+ years",
];

export function ProductAdmin() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [q, setQ] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "10",
    category: "Toys",
    brand: "Generic",
    ageGroup: "All Ages",
    description: "",
    images: "",
    featured: false,
    newArrival: false,
  });

  const load = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "30",
        sort: "newest",
      });
      if (q.trim()) params.set("q", q.trim());
      if (stockFilter) params.set("stockStatus", stockFilter);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setPagination({
          page: data.pagination.page,
          pages: data.pagination.pages,
          total: data.pagination.total,
        });
      }
    },
    [q, stockFilter]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      sku: "",
      price: "",
      stock: "10",
      category: "Toys",
      brand: "Generic",
      ageGroup: "All Ages",
      description: "",
      images: "",
      featured: false,
      newArrival: false,
    });
  }

  function edit(p: ProductRow) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      sku: p.sku || "",
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      brand: p.brand,
      ageGroup: p.ageGroup,
      description: p.description || "",
      images: (p.images || []).join(", "),
      featured: Boolean(p.featured),
      newArrival: Boolean(p.newArrival),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        urls.push(data.url);
      }
      setForm((f) => {
        const existing = f.images
          .split(/[,|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        return { ...f, images: [...existing, ...urls].join(", ") };
      });
      toast.success(
        urls.length === 1 ? "Photo added" : `${urls.length} photos added`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function imageList() {
    return form.images
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function removeImage(url: string) {
    setForm((f) => ({
      ...f,
      images: f.images
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter((s) => s && s !== url)
        .join(", "),
    }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      sku: form.sku || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      brand: form.brand,
      ageGroup: form.ageGroup,
      description: form.description,
      featured: form.featured,
      newArrival: form.newArrival,
      images: form.images
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success(editingId ? "Product updated" : "Product created");
      resetForm();
      await load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function quickPatch(
    id: string,
    patch: Record<string, string | number | boolean>
  ) {
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("Updated");
      await load(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      load(pagination.page);
    }
  }

  async function recategorize() {
    setBusy(true);
    try {
      const res = await fetch("/api/products/recategorize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(data.message);
      await load(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {editingId ? "Edit product" : "Create / manage products"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              After Excel upload, search any SKU and change name, age, stock,
              category, price — or mark out of stock.
            </p>
          </div>
          <button
            type="button"
            onClick={recategorize}
            className="btn-secondary text-sm"
            disabled={busy}
          >
            Auto-tag categories from names
          </button>
        </div>

        <form onSubmit={onSave} className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Product name
            </label>
            <input
              className="input-field"
              placeholder="e.g. Kitchen Set 007"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              SKU
            </label>
            <input
              className="input-field"
              placeholder="Product ID / SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Price (PKR)
            </label>
            <input
              className="input-field"
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Stock (0 = out of stock)
            </label>
            <input
              className="input-field"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Category
            </label>
            <input
              className="input-field"
              placeholder="e.g. Vehicles"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Brand
            </label>
            <input
              className="input-field"
              placeholder="e.g. LEGO, Hot Wheels, Generic"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Age group
            </label>
            <select
              className="input-field"
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
            >
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({
                  ...form,
                  featured: e.target.checked,
                  newArrival: e.target.checked ? false : form.newArrival,
                })
              }
            />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.newArrival}
              onChange={(e) =>
                setForm({
                  ...form,
                  newArrival: e.target.checked,
                  featured: e.target.checked ? false : form.featured,
                })
              }
            />
            New Arrival (show in New Arrivals section)
          </label>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Description
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Product details…"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="sm:col-span-2 rounded-2xl border-2 border-dashed border-black/10 bg-[#fef6ed] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Product photos
            </p>
            <p className="mt-1 text-sm text-muted">
              Upload from your computer (or phone). Multiple photos allowed.
            </p>

            {imageList().length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {imageList().map((url) => (
                  <div
                    key={url}
                    className="relative h-24 w-24 overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-ink/80 px-1.5 text-[10px] font-bold text-white"
                      onClick={() => removeImage(url)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="btn-primary mt-4 inline-flex cursor-pointer">
              {busy ? "Uploading…" : "Choose photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onUploadImage}
                disabled={busy}
              />
            </label>
            <p className="mt-2 text-xs text-muted">
              Or paste image URLs below (comma separated)
            </p>
            <input
              className="input-field mt-2"
              placeholder="https://… or /uploads/…"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? "Saving…"
                : editingId
                  ? "Update product"
                  : "Create product"}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-black/5">
        <div className="flex flex-wrap gap-2">
          <input
            className="input-field min-w-[200px] flex-1"
            placeholder="Search name / SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1)}
          />
          <select
            className="input-field w-auto"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
          <button type="button" className="btn-secondary" onClick={() => load(1)}>
            Search
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          {pagination.total} products · page {pagination.page}/{pagination.pages}
        </p>

        <div className="mt-4 space-y-2">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex flex-col gap-3 rounded-xl bg-[#fef6ed] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="text-xs text-muted">
                  {p.sku} · <strong>{p.brand}</strong> · {p.category} ·{" "}
                  {p.ageGroup} · {formatPKR(p.price)} ·{" "}
                  <span
                    className={
                      p.stock <= 0
                        ? "font-bold text-coral-deep"
                        : p.stock <= 5
                          ? "font-bold text-coral"
                          : "text-mint"
                    }
                  >
                    stock {p.stock}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="input-field w-auto py-1 text-xs"
                  value={p.ageGroup}
                  disabled={busy}
                  onChange={(e) =>
                    quickPatch(p._id, { ageGroup: e.target.value })
                  }
                >
                  {[...new Set([...AGE_OPTIONS, p.ageGroup])].map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="input-field w-24 py-1 text-xs"
                  defaultValue={p.stock}
                  disabled={busy}
                  title="Stock"
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isNaN(n) && n !== p.stock) {
                      quickPatch(p._id, { stock: n });
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/5"
                  disabled={busy}
                  onClick={() =>
                    quickPatch(p._id, {
                      stock: p.stock > 0 ? 0 : 10,
                    })
                  }
                >
                  {p.stock > 0 ? "Mark OOS" : "Restock 10"}
                </button>
                <button
                  type="button"
                  className={
                    p.newArrival
                      ? "rounded-full bg-sun px-3 py-1.5 text-xs font-bold text-ink"
                      : "rounded-full bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/5"
                  }
                  disabled={busy}
                  onClick={() =>
                    quickPatch(p._id, {
                      newArrival: !p.newArrival,
                      featured: !p.newArrival ? false : Boolean(p.featured),
                    })
                  }
                >
                  {p.newArrival ? "★ New Arrival" : "Mark as New Arrival"}
                </button>
                <button
                  type="button"
                  className={
                    p.featured
                      ? "rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white"
                      : "rounded-full bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/5"
                  }
                  disabled={busy}
                  onClick={() =>
                    quickPatch(p._id, {
                      featured: !p.featured,
                      newArrival: !p.featured ? false : Boolean(p.newArrival),
                    })
                  }
                >
                  {p.featured ? "★ Featured" : "Mark as Featured"}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => edit(p)}
                >
                  Edit all
                </button>
                <button
                  type="button"
                  className="rounded-full bg-coral/10 px-3 py-1.5 text-xs font-bold text-coral-deep"
                  onClick={() => onDelete(p._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {pagination.pages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              disabled={pagination.page <= 1}
              onClick={() => load(pagination.page - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => load(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
