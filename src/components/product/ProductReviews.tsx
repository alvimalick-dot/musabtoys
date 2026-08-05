"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

type Review = {
  _id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export function ProductReviews({
  slug,
  initial = [],
}: {
  slug: string;
  initial?: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [average, setAverage] = useState(
    initial.length > 0
      ? Math.round((initial.reduce((s, r) => s + r.rating, 0) / initial.length) * 10) / 10
      : 0
  );
  const [count, setCount] = useState(initial.length);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (res.ok) {
      setReviews(data.reviews || []);
      setAverage(data.average || 0);
      setCount(data.count || 0);
    }
  }, [slug]);

// If the server already provided reviews as initial data, skip the redundant
  // client-side fetch — the included /api/reviews data is already up to date.
  const hasInitial = initial.length > 0;
  useEffect(() => {
    if (!hasInitial) load();
  }, [hasInitial, load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: slug, authorName, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Thanks for your review!");
      setAuthorName("");
      setComment("");
      setRating(5);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post review");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-semibold">Reviews</h2>
          <p className="mt-1 text-sm text-muted">
            {count > 0
              ? `${average.toFixed(1)} / 5 from ${count} parent(s)`
              : "Be the first to review this toy"}
          </p>
        </div>
        {count > 0 && (
          <div className="flex gap-0.5 text-sun">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(average) ? "fill-sun" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r._id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{r.authorName}</p>
                <div className="flex gap-0.5 text-sun">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < r.rating ? "fill-sun" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{r.comment}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={onSubmit} className="h-fit rounded-2xl bg-white p-5 ring-1 ring-black/5">
          <p className="font-display text-xl font-semibold">Write a review</p>
          <input
            className="input-field mt-4"
            placeholder="Your name"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="text-sun"
                aria-label={`${i + 1} stars`}
              >
                <Star className={`h-6 w-6 ${i < rating ? "fill-sun" : ""}`} />
              </button>
            ))}
          </div>
          <textarea
            className="input-field mt-3"
            rows={3}
            placeholder="How was this toy for your kids?"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="btn-primary mt-4" disabled={busy}>
            {busy ? "Posting…" : "Post review"}
          </button>
        </form>
      </div>
    </section>
  );
}
