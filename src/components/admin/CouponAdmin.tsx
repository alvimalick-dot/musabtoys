"use client";

import { useEffect, useState } from "react";

type Coupon = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
};

export function CouponAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "fixed" as "fixed" | "percent",
    value: "",
    minOrder: "0",
    maxUses: "0",
  });

  async function load() {
    const res = await fetch("/api/coupons");
    const data = await res.json();
    if (res.ok) setCoupons(data.coupons || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        maxUses: Number(form.maxUses),
        active: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg(`Coupon ${data.coupon.code} created`);
    setForm({ code: "", type: "fixed", value: "", minOrder: "0", maxUses: "0" });
    load();
  }

  return (
    <div className="mt-8 rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
      <h2 className="font-display text-2xl font-semibold">Discount coupons</h2>
      <form onSubmit={onCreate} className="mt-6 grid gap-3 sm:grid-cols-2">
        <input className="input-field" placeholder="Code e.g. EID500" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "fixed" | "percent" })}>
          <option value="fixed">Fixed PKR off</option>
          <option value="percent">Percent off</option>
        </select>
        <input className="input-field" type="number" placeholder="Value" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input className="input-field" type="number" placeholder="Min order" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
        <input className="input-field" type="number" placeholder="Max uses (0 = unlimited)" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
        <button type="submit" className="btn-primary">Create coupon</button>
      </form>
      {msg && <p className="mt-4 text-sm text-sky-deep">{msg}</p>}
      <ul className="mt-6 space-y-2 text-sm">
        {coupons.map((c) => (
          <li key={c._id} className="rounded-xl bg-[#fef6ed] px-4 py-3">
            <strong>{c.code}</strong> — {c.type === "percent" ? `${c.value}%` : `PKR ${c.value}`} off
            {c.minOrder ? ` · min ${c.minOrder}` : ""} · used {c.usedCount}
            {c.maxUses ? `/${c.maxUses}` : ""} · {c.active ? "active" : "off"}
          </li>
        ))}
      </ul>
    </div>
  );
}
