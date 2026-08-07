"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, LogOut, Package, RefreshCw } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { ProductAdmin } from "@/components/admin/ProductAdmin";
import { CouponAdmin } from "@/components/admin/CouponAdmin";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { ReviewAdmin } from "@/components/admin/ReviewAdmin";

interface OrderRow {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string; city: string };
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
  courierName?: string;
  trackingNumber?: string;
  feedbackRequested?: boolean;
}

interface ImportJobRow {
  _id: string;
  filename?: string;
  status: string;
  totalRows: number;
}

export function AdminPanel() {
  const [auth, setAuth] = useState<"loading" | "in" | "out">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<
    "dashboard" | "upload" | "products" | "orders" | "coupons" | "reviews" | "seed"
  >("dashboard");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [importJob, setImportJob] = useState<{
    jobId: string;
    totalRows: number;
    processedRows: number;
    successRows: number;
    errorRows: number;
    imagesSynced: number;
    status: string;
  } | null>(null);
  const [recentJobs, setRecentJobs] = useState<ImportJobRow[]>([]);
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

  useEffect(() => {
    if (auth === "in") loadRecentJobs();
  }, [auth]);

  async function loadRecentJobs() {
    try {
      const res = await fetch(`/api/imports`);
      if (!res.ok) return;
      const data = await res.json();
      const jobs = data.jobs || data;
      setRecentJobs(Array.isArray(jobs) ? jobs : []);
    } catch {
      // ignore
    }
  }

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

  // Refetch orders when the admin tab regains focus after being backgrounded
  // for a while, so the list never silently goes stale.
  useEffect(() => {
    let hiddenAt: number | null = null;
    const STALE_AFTER_MS = 30_000;

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible") {
        if (
          hiddenAt &&
          Date.now() - hiddenAt > STALE_AFTER_MS &&
          auth === "in" &&
          tab === "orders"
        ) {
          loadOrders();
        }
        hiddenAt = null;
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    setImportJob(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      // Create resumable import job
      const res = await fetch("/api/imports", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const job = {
        jobId: data.jobId,
        totalRows: data.totalRows,
        processedRows: 0,
        successRows: 0,
        errorRows: 0,
        imagesSynced: 0,
        status: "pending",
      };
      setImportJob(job);

      // Start background processing (non-blocking)
      const startRes = await fetch(`/api/imports/${data.jobId}/start`, { method: "POST" });
      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error || "Start failed");

      setUploadMsg(`Import started — processing on server (job ${data.jobId}).`);
      // Begin polling for job status updates
      const poll = setInterval(async () => {
        const s = await fetch(`/api/imports/${data.jobId}`);
        if (!s.ok) return;
        const jd = await s.json();
        const jobInfo = jd.job || jd;
        setImportJob(() => ({
          jobId: data.jobId,
          totalRows: jobInfo.totalRows,
          processedRows: jobInfo.processedRows || 0,
          successRows: jobInfo.successRows || 0,
          errorRows: jobInfo.errorRows || 0,
          imagesSynced: jobInfo.imagesSynced || 0,
          status: jobInfo.status || jobInfo.state || "processing",
        }));
        if (jobInfo.status === "completed" || jobInfo.status === "failed") {
          clearInterval(poll);
          setUploadMsg(
            `Done: ${jobInfo.successRows} saved, ${jobInfo.errorRows} failed, ${jobInfo.imagesSynced} images synced to Cloudinary.`
          );
          loadRecentJobs();
        }
      }, 2000);
      await checkDb();
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    // Optimistic update — flip the UI instantly, don't wait on the network
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status } : o))
    );
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    if (!res.ok) {
      // Roll back by re-syncing with the server
      loadOrders();
    }
  }

  async function saveTracking(
    orderId: string,
    courierName: string,
    trackingNumber: string
  ) {
    // Optimistic update — flip the UI instantly
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, courierName, trackingNumber } : o
      )
    );
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, courierName, trackingNumber }),
    });
    if (!res.ok) {
      // Roll back by re-syncing with the server
      loadOrders();
    }
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
            ["dashboard", "Dashboard"],
            ["upload", "Excel upload"],
            ["products", "Products"],
            ["orders", "Orders"],
            ["coupons", "Coupons"],
            ["reviews", "Reviews"],
            ["seed", "Sample data"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
             tab === id ? "bg-ink text-white dark:bg-white dark:text-slate-900" : "bg-white ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <AdminAnalytics />}

      {tab === "products" && <ProductAdmin />}

      {tab === "coupons" && <CouponAdmin />}

      {tab === "reviews" && <ReviewAdmin />}

      {tab === "upload" && (
        <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
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

<div className="mt-6 rounded-2xl bg-[#fde8d4] px-5 py-4 text-sm dark:bg-slate-800">
            <p className="font-bold text-ink">Photos via Excel (easy way)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
              <li>
                Put pictures in the project folder{" "}
               <code className="rounded bg-white px-1.5 py-0.5 text-xs dark:bg-slate-700 dark:text-white">
                  public/images/
                </code>{" "}
                then push to GitHub.
              </li>
              <li>
                In Excel, add an <strong>Image</strong> column with just the file
                name, e.g. <code className="text-xs">HW-001.jpg</code>
              </li>
              <li>
                Or name the photo after ProductID (
                <code className="text-xs">HW-001.jpg</code>) — no Image column
                needed; it matches automatically.
              </li>
            </ol>
          </div>

          <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashedborder-black/10 bg-[#fef6ed] px-6 py-14 transition hover:border-coral dark:bg-slate-800">
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

          {importJob && (
            <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-black/5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {importJob.status === "completed" ? "✅ Complete" : "⏳ Processing…"}
                </span>
                <span className="text-muted">
                  {importJob.processedRows} / {importJob.totalRows} rows
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-coral transition-all"
                  style={{
                    width: `${importJob.totalRows ? Math.round((importJob.processedRows / importJob.totalRows) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                ✓ {importJob.successRows} saved &nbsp;·&nbsp;
                {importJob.errorRows > 0 && <span className="text-coral-deep">{importJob.errorRows} failed &nbsp;·&nbsp;</span>}
                ☁️ {importJob.imagesSynced} images synced
              </p>
            </div>
          )}

          {uploadMsg && (
            <p className="mt-4 rounded-xl bg-sky/10 px-4 py-3 text-sm text-sky-deep">
              {uploadMsg}
            </p>
          )}

          <div className="mt-6">
            <h3 className="font-semibold">Recent import jobs</h3>
            <div className="mt-2 space-y-2">
              {recentJobs.length === 0 && (
                <p className="text-sm text-muted">No recent jobs.</p>
              )}
              {recentJobs.map((j) => (
                <div key={String(j._id)} className="flex items-center justify-between gap-2 rounded-md bg-white p-3 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
                  <div className="text-sm">
                    <div className="font-medium">{j.filename || j._id}</div>
                    <div className="text-xs text-muted">{j.status} · {j.totalRows} rows</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/api/imports/${j._id}/failed`} className="btn-secondary text-xs">Download failed</a>
                    <a href={`/api/imports/${j._id}`} className="btn-secondary text-xs">View</a>
                    <button
                      className="btn-secondary text-xs"
                      onClick={async () => {
                        const res = await fetch(`/api/imports/${j._id}/retry`, { method: "POST" });
                        const data = await res.json();
                        if (!res.ok) return alert(data.error || "Retry failed");
                        // start background run after resetting
                        await fetch(`/api/imports/${j._id}/start`, { method: "POST" });
                        alert(`Retry started (${data.reset} rows reset)`);
                        loadRecentJobs();
                      }}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto text-sm">
            <p className="mb-2 font-bold">Example headers</p>
           <code className="block rounded-xl bg-ink px-4 py-3 text-xs text-white dark:bg-slate-900">
              ProductID | ProductName | RetailPrice | Brand | Image
              <br />
              HW-001 | Hot Wheels Car | 850 | Hot Wheels | HW-001.jpg
              <br />
              <br />
              Image column accepts: HW-001.jpg &nbsp;or&nbsp; images/HW-001.jpg
              &nbsp;or&nbsp; full URL
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
                className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700"
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
                        ? "bg-ink text-white dark:bg-white dark:text-slate-900"

                          : "bg-[#fef6ed] text-ink dark:bg-slate-800 dark:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  {order.status === "delivered" && (
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        order.feedbackRequested
                          ? "bg-mint/15 text-mint"
                          : "bg-sun/15 text-sun-deep"
                      }`}
                    >
                      {order.feedbackRequested
                        ? "✓ Feedback email sent"
                        : "Feedback pending"}
                    </span>
                  )}
                </div>
                <form
                  className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    saveTracking(
                      order._id,
                      String(fd.get("courier") || ""),
                      String(fd.get("tracking") || "")
                    );
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
                      Courier
                    </label>
                    <input
                      name="courier"
                      className="input-field py-2 text-sm"
                      placeholder="TCS / Leopards / PostEx"
                      defaultValue={order.courierName || ""}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
                      Tracking #
                    </label>
                    <input
                      name="tracking"
                      className="input-field py-2 text-sm"
                      placeholder="Parcel tracking number"
                      defaultValue={order.trackingNumber || ""}
                    />
                  </div>
                  <button type="submit" className="btn-secondary shrink-0 text-sm">
                    Save tracking
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "seed" && (
        <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700">
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
