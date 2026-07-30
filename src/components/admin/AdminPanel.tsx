"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, LogOut, Package, RefreshCw } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { ProductAdmin } from "@/components/admin/ProductAdmin";
import { CouponAdmin } from "@/components/admin/CouponAdmin";

interface OrderRow {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string; city: string };
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export function AdminPanel() {
  const [auth, setAuth] = useState<"loading" | "in" | "out">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upload" | "products" | "orders" | "coupons" | "seed">("upload");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>("checking…");

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/login");
      setAuth(res.ok ? "in" : "out");
    } catch {
      setAuth("out");
    }
  }, []);

  const checkDb = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.database === "private") {
        setDbStatus("Log in to verify database status");
        return;
      }
      setDbStatus(
        data.ok
          ? `Database connected (${data.ms}ms)`
          : `Database failed: ${data.error || "unknown"}`
      );
    } catch {
      setDbStatus("Database check failed — is the server running?");
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (auth === "in") checkDb();
  }, [auth, checkDb]);

  const loadOrders = useCallback(async () => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/orders${qs}`);
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data.orders || []);
  }, [statusFilter]);

  useEffect(() => {
    if (auth === "in" && tab === "orders") loadOrders();
  }, [auth, tab, loadOrders]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || "Login failed");
      return;
    }
    setAuth("in");
  }

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    setAuth("out");
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    setUploadMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/excel-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        const extra = data.headers
          ? ` | Found headers: ${data.headers.join(", ")}`
          : "";
        throw new Error((data.error || "Upload failed") + extra);
      }
      const warn =
        data.warnings?.length ? ` | Notes: ${data.warnings.join("; ")}` : "";
      const detected = data.detectedColumns
        ? ` | Mapped: ${JSON.stringify(data.detectedColumns)}`
        : "";
      setUploadMsg((data.message || "Upload complete") + detected + warn);
      await checkDb();
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    if (res.ok) loadOrders();
  }

  async function seedProducts() {
    setSeedMsg(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          [data.error, data.hint].filter(Boolean).join(" — ") || "Seed failed"
        );
      }
      setSeedMsg(data.message || "Done");
      await checkDb();
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : "Seed failed");
    }
  }

  if (auth === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted">
        Checking session…
      </div>
    );
  }

  if (auth === "out") {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
          Admin
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Use credentials from your <code>.env.local</code> file.
        </p>
        <form onSubmit={login} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Email
            </label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">
              Password
            </label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && (
            <p className="text-sm text-coral-deep">{loginError}</p>
          )}
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
            Store management
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Admin panel</h1>
          <p
            className={`mt-2 text-sm font-semibold ${
              dbStatus.startsWith("Database connected")
                ? "text-mint"
                : "text-coral-deep"
            }`}
          >
            {dbStatus}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={checkDb} className="btn-secondary">
            <RefreshCw className="h-4 w-4" /> Recheck DB
          </button>
          <button type="button" onClick={logout} className="btn-secondary">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["upload", "Excel upload"],
            ["products", "Products"],
            ["orders", "Orders"],
            ["coupons", "Coupons"],
            ["seed", "Sample data"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === id ? "bg-ink text-white" : "bg-white ring-1 ring-black/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductAdmin />}

      {tab === "coupons" && <CouponAdmin />}

      {tab === "upload" && (
        <div className="mt-8 rounded-[1.5rem] bg-white p-8 ring-1 ring-black/5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral">
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Bulk Excel inventory
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Upload any <code>.xlsx</code> / <code>.xls</code> / <code>.csv</code>.
                Column names can be anything — the system auto-detects name, price,
                id/sku, etc. Your sheet with ProductID / ProductName / RetailPrice
                works as-is. Existing IDs update price/stock without duplicates.
              </p>
            </div>
          </div>

          <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-[#fff8f0] px-6 py-14 transition hover:border-coral">
            <Upload className="h-8 w-8 text-coral" />
            <span className="mt-3 font-bold">
              {uploadBusy ? "Uploading…" : "Choose Excel file"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={uploadBusy}
              onChange={onUpload}
            />
          </label>

          {uploadMsg && (
            <p className="mt-4 rounded-xl bg-sky/10 px-4 py-3 text-sm text-sky-deep">
              {uploadMsg}
            </p>
          )}

          <div className="mt-8 overflow-x-auto text-sm">
            <p className="mb-2 font-bold">Example headers</p>
            <code className="block rounded-xl bg-ink px-4 py-3 text-xs text-white">
              name | sku | price | category | brand | ageGroup | stock |
              description | images
              <br />
              Also accepted: ProductID, ProductName, RetailPrice
            </code>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Package className="h-5 w-5 text-coral" />
            <select
              className="input-field w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {["pending", "processing", "shipped", "delivered", "cancelled"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
            <button type="button" onClick={loadOrders} className="btn-secondary">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && (
              <p className="rounded-2xl bg-white p-8 text-center text-muted ring-1 ring-black/5">
                No orders yet.
              </p>
            )}
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl bg-white p-5 ring-1 ring-black/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-muted">
                      {order.customer.name} · {order.customer.phone} ·{" "}
                      {order.customer.city}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.items
                        .map((i) => `${i.name} ×${i.quantity}`)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-coral">
                      {formatPKR(order.total)}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-muted">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    [
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ] as OrderStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(order._id, status)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                        order.status === status
                          ? "bg-ink text-white"
                          : "bg-[#fff8f0] text-ink"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "seed" && (
        <div className="mt-8 rounded-[1.5rem] bg-white p-8 ring-1 ring-black/5">
          <h2 className="font-display text-2xl font-semibold">
            Load sample products
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Inserts a handful of demo toys so you can preview the shop before
            uploading your real Excel catalog.
          </p>
          <button type="button" onClick={seedProducts} className="btn-primary mt-6">
            Seed sample catalog
          </button>
          {seedMsg && (
            <p className="mt-4 rounded-xl bg-mint/15 px-4 py-3 text-sm">
              {seedMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
