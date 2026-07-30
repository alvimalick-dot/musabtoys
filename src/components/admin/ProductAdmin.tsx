"use client";

import { useEffect, useState } from "react";

type ProductRow = {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  ageGroup: string;
  images?: string[];
  featured?: boolean;
  description?: string;
};

export function ProductAdmin() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
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
  });

  async function load() {
    const res = await fetch("/api/products?limit=24&sort=newest");
    const data = await res.json();
    if (res.ok) setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

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
    });
  }

  async function onUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({
        ...f,
        images: f.images ? `${f.images}, ${data.url}` : data.url,
      }));
      setMsg("Image uploaded to Cloudinary");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
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
      setMsg(editingId ? "Product updated" : "Product created");
      resetForm();
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("Product deleted");
      load();
    }
  }

  async function recategorize() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/products/recategorize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.message);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">
            {editingId ? "Edit product" : "Create product"}
          </h2>
          <button type="button" onClick={recategorize} className="btn-secondary text-sm" disabled={busy}>
            Auto-tag categories from names
          </button>
        </div>
        <form onSubmit={onSave} className="mt-6 grid gap-3 sm:grid-cols-2">
          <input className="input-field" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input className="input-field" placeholder="Price" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="input-field" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input className="input-field" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="input-field" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className="input-field" placeholder="Age group" value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
          <textarea className="input-field sm:col-span-2" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input-field sm:col-span-2" placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <label className="btn-secondary cursor-pointer text-sm sm:col-span-2">
            Upload image to Cloudinary
            <input type="file" accept="image/*" className="hidden" onChange={onUploadImage} disabled={busy} />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Update product" : "Create product"}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
        {msg && <p className="mt-4 rounded-xl bg-sky/10 px-4 py-3 text-sm text-sky-deep">{msg}</p>}
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl font-semibold">Recent products</h3>
        {products.map((p) => (
          <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-muted">
                {p.sku} · {p.category} · stock {p.stock} · PKR {p.price}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => edit(p)}>
                Edit
              </button>
              <button type="button" className="rounded-full bg-coral/10 px-3 py-1.5 text-xs font-bold text-coral-deep" onClick={() => onDelete(p._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
