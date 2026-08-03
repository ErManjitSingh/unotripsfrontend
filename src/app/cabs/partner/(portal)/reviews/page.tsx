"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  listPartnerReviews,
  replyToPartnerReview,
  type PartnerCabReview,
} from "@/lib/cab-partner-api";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function PartnerReviewsPage() {
  const auth = useAuthOptional();
  const [reviews, setReviews] = useState<PartnerCabReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    listPartnerReviews(token)
      .then((rows) => {
        if (!cancelled) setReviews(rows);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load reviews.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length
      : null;

  const saveReply = async (reviewId: string) => {
    const token = auth?.getAccessToken();
    const reply = (replyDrafts[reviewId] || "").trim();
    if (!token || !reply) return;
    setSavingId(reviewId);
    setError("");
    try {
      const next = await replyToPartnerReview(token, reviewId, reply);
      setReviews((prev) => prev.map((row) => (row.id === reviewId ? next : row)));
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save reply.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Reviews</h2>
          <p className="mt-1 text-sm text-slate-500">Ratings from travellers after completed trips.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Average</p>
          <p className="text-lg font-black text-[#192131]">
            {avg != null ? `${avg.toFixed(1)}★` : "—"}{" "}
            <span className="text-xs font-semibold text-slate-400">({reviews.length})</span>
          </p>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      {reviews.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
          <Star className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-600">No reviews yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Travellers can rate trips after you mark bookings completed.
          </p>
        </section>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold text-[#192131]">{review.user_name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {review.route_label || "Trip"}
                    {review.travel_date ? ` · ${formatDate(review.travel_date)}` : ""}
                    {" · "}
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700">
                  {review.rating.toFixed(1)}★
                </span>
              </div>
              {review.title && <p className="mt-2 text-sm font-bold text-[#192131]">{review.title}</p>}
              {review.comment && <p className="mt-1 text-sm leading-6 text-slate-600">{review.comment}</p>}

              {review.partner_reply ? (
                <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#ef6614]">Your reply</p>
                  <p className="mt-1 text-sm text-[#514752]">{review.partner_reply}</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    value={replyDrafts[review.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                    }
                    placeholder="Write a public reply…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={savingId === review.id || !(replyDrafts[review.id] || "").trim()}
                    onClick={() => void saveReply(review.id)}
                    className="rounded-lg bg-[#ef6614] px-3 py-1.5 text-xs font-extrabold text-white disabled:opacity-50"
                  >
                    {savingId === review.id ? "Saving…" : "Post reply"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
