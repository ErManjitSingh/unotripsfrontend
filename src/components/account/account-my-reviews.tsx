"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth-context";
import { mapApiReviewsForUi } from "@/lib/hotels-api";
import { fetchMyReviews } from "@/lib/hotels-reviews-api";
import { cn } from "@/lib/utils";

function formatDate(raw: string) {
  try {
    return new Date(raw).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return raw;
  }
}

export function AccountMyReviews() {
  const { getAccessToken } = useAuth();
  const [reviews, setReviews] = useState<ReturnType<typeof mapApiReviewsForUi>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyReviews(token);
      setReviews(mapApiReviewsForUi(data));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-12 text-sm text-[#757575]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading your reviews…
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-3 text-sm font-semibold text-[#2196F3] hover:underline">Try again</button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ccc] bg-white p-8 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-[#bdbdbd]" aria-hidden />
        <p className="mt-3 font-semibold text-[#212121]">No reviews yet</p>
        <p className="mt-1 text-sm text-[#757575]">After a completed stay, open the hotel page and write a review.</p>
        <Link href="/hotels" className="mt-4 inline-flex rounded-xl bg-[#2196F3] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1976D2]">Browse hotels</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border border-[#eee] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-[#212121]">{review.title}</p>
              <p className="text-[12px] text-[#9E9E9E]">{formatDate(review.date)}</p>
            </div>
            <div className="flex gap-0.5" aria-label={`${review.rating} stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", i < Math.round(review.rating) ? "fill-[#FFC107] text-[#FFC107]" : "text-[#e0e0e0]")} aria-hidden />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[#424242]">{review.body}</p>
          {review.roomType ? <p className="mt-2 text-[11px] text-[#757575]">Room: {review.roomType}</p> : null}
        </li>
      ))}
    </ul>
  );
}
