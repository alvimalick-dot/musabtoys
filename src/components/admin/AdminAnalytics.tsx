"use client";

import { useEffect, useState } from "react";
import { formatPKR } from "@/lib/utils";

type Analytics = {
  summary: {
    revenue30d: number;
    orders30d: number;
    revenueToday: number;
    productCount: number;
    lowStockCount: number;
  };
  salesByDay: { date: string; amount: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  lowStock: { name: string; sku: string; stock: number; slug: string }[];
};

export function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed");
        setData(j);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="mt-8 text-sm text-coral-deep">{error}</p>;
  }
  if (!data) {
    return <p className="mt-8 text-sm text-muted">Loading dashboard…</p>;
  }

  const max = Math.max(...data.salesByDay.map((d) => d.amount), 1);

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Revenue today", formatPKR(data.summary.revenueToday)],
          ["Revenue (30d)", formatPKR(data.summary.revenue30d)],
          ["Orders (30d)", String(data.summary.orders30d)],
          ["Products", String(data.summary.productCount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
        <h3 className="font-display text-xl font-semibold">Sales (30 days)</h3>
        <div className="mt-4 flex h-40 items-end gap-1">
          {data.salesByDay.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${formatPKR(d.amount)}`}
              className="flex-1 rounded-t bg-coral/80"
              style={{ height: `${Math.max(4, (d.amount / max) * 100)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
          <h3 className="font-display text-xl font-semibold">Top products</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {data.topProducts.length === 0 && (
              <li className="text-muted">No sales yet.</li>
            )}
            {data.topProducts.map((p) => (
              <li key={p.name} className="flex justify-between gap-3">
                <span className="line-clamp-1">{p.name}</span>
                <span className="shrink-0 font-semibold">
                  ×{p.qty} · {formatPKR(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700" >
          <h3 className="font-display text-xl font-semibold">
            Low stock ({data.summary.lowStockCount})
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {data.lowStock.length === 0 && (
              <li className="text-muted">No low-stock alerts.</li>
            )}
            {data.lowStock.map((p) => (
              <li key={p.sku} className="flex justify-between gap-3">
                <span className="line-clamp-1">{p.name}</span>
                <span className="font-bold text-coral">{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
