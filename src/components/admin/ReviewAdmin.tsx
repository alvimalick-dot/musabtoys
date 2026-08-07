"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, Star } from "lucide-react";

type ReviewRow = {
  _id: string;
  productSlug: string;
  authorName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt?: string;
};

export function ReviewAdmin() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending"
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews?all=true");
      if (!res.ok) {
        toast.error("Failed to load reviews");
        return;
      }
      const data = await res.json();
      setReviews(data.reviews || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproved(id: string, approved: boolean) {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Update failed");
      return;
    }
    toast.success(approved ? "Review approved" : "Review rejected");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Review deleted");
    load();
  }

  const visible = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === id
                ? "bg-ink text-white dark:bg-white dark:text-black"
                : "bg-white ring-1 ring-black/5 dark:bg-raised dark:ring-white/10"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="btn-secondary ml-auto text-sm"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="py-8 text-center text-muted">Loading…</p>}

      {!loading && visible.length === 0 && (
        <p className="rounded-2xl bg-white p-8 text-center text-muted ring-1 ring-black/5 dark:bg-raised dark:ring-white/10">
          No {filter !== "all" ? filter : ""} reviews.
        </p>
      )}

      <div className="space-y-3">
        {visible.map((r) => (
          <div
            key={r._id}
            className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-raised dark:ring-white/10"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{r.authorName}</p>
                  <span className="flex items-center text-sun">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? "fill-current" : "opacity-25"
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {r.productSlug}
                  {r.createdAt
                    ? ` · ${new Date(r.createdAt).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  r.approved
                    ? "bg-mint/15 text-mint"
                    : "bg-sun/15 text-sun-deep"
                }`}
              >
                {r.approved ? "Approved" : "Pending"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink/80 dark:text-white/80">
              {r.comment}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {!r.approved && (
                <button
                  type="button"
                  className="btn-primary min-h-9 text-sm"
                  onClick={() => setApproved(r._id, true)}
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
              )}
              {r.approved && (
                <button
                  type="button"
                  className="btn-secondary min-h-9 text-sm"
                  onClick={() => setApproved(r._id, false)}
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              )}
              <button
                type="button"
                className="btn-secondary min-h-9 text-sm text-coral-deep"
                onClick={() => remove(r._id)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
