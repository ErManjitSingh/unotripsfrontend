"use client";

import { useMemo, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import type { HotelListing } from "@/lib/hotels-catalog";
import { buildDemoHotelReviews, type HotelReviewUi } from "@/lib/hotel-demo-reviews";
import { mapApiReviewsForUi, type ApiReview } from "@/lib/hotels-api";
import { HotelWriteReviewPanel } from "@/components/hotels/hotel-write-review-panel";
import { cn } from "@/lib/utils";

type HotelDetailReviewsProps = {
  hotel: HotelListing;
  cityName?: string;
  apiReviews?: ApiReview[];
  className?: string;
};

const INITIAL_VISIBLE = 4;

function reviewerInitial(author: string) {
  const cleaned = author.replace(/^[^#]*#?/, "").trim();
  return cleaned.charAt(0).toUpperCase() || "G";
}

function formatReviewDate(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function ratingCategoriesFromScore(rating: number) {
  const clamp = (n: number) => Math.min(5, Math.max(0, Math.round(n * 10) / 10));
  const r = rating > 0 ? rating : 0;
  return [
    { label: "Cleanliness", score: clamp(r + 0.1) },
    { label: "Sleep Quality", score: clamp(r + 0.2) },
    { label: "Location", score: clamp(r - 0.5) },
    { label: "Rooms", score: clamp(r - 0.1) },
    { label: "Service", score: clamp(r - 0.1) },
    { label: "Value", score: clamp(r - 0.1) },
  ].filter((c) => c.score > 0);
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const full = Math.round(rating);
  const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i < full ? "fill-[#FFC107] text-[#FFC107]" : "fill-[#e0e0e0] text-[#e0e0e0]",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

function RatingBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 5) * 100));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2 sm:grid-cols-[120px_1fr_2.5rem]">
      <span className="text-[12px] text-[#424242] sm:text-[13px]">{label}</span>
      <div className="hidden h-2 overflow-hidden rounded-full bg-[#e8e8e8] sm:block">
        <div className="h-full rounded-full bg-[#2196F3]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-right text-[12px] font-semibold text-[#212121] sm:text-[13px]">
        {score.toFixed(1)}
      </span>
      <div className="col-span-2 h-2 overflow-hidden rounded-full bg-[#e8e8e8] sm:hidden">
        <div className="h-full rounded-full bg-[#2196F3]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: HotelReviewUi }) {
  return (
    <li className="rounded-xl border border-[#eee] bg-[#fafafa] p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2196F3] to-[#1565C0] text-sm font-bold text-white"
          aria-hidden
        >
          {reviewerInitial(review.author)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold text-[#212121]">{review.author}</p>
              <p className="text-[11px] text-[#9E9E9E]">{formatReviewDate(review.date)}</p>
            </div>
            <StarRow rating={review.rating} />
          </div>

          {review.roomType ? (
            <span className="mt-2 inline-block rounded-full border border-[#e0e0e0] bg-white px-2.5 py-0.5 text-[10px] font-medium text-[#616161]">
              {review.roomType}
            </span>
          ) : null}

          <p className="mt-2 text-[15px] font-bold text-[#212121]">{review.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#424242]">{review.body}</p>

          {review.helpfulCount != null && review.helpfulCount > 0 ? (
            <p className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#757575]">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              {review.helpfulCount} found this helpful
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function HotelDetailReviews({ hotel, cityName = "", apiReviews, className }: HotelDetailReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const [userReviews, setUserReviews] = useState<HotelReviewUi[]>([]);

  const reviews = useMemo<HotelReviewUi[]>(() => {
    const fromApi = apiReviews?.length
      ? mapApiReviewsForUi(apiReviews).map((r) => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          title: r.title,
          body: r.body,
          date: r.date,
          roomType: r.roomType,
          helpfulCount: r.helpfulCount,
        }))
      : [];

    if (fromApi.length > 0 || userReviews.length > 0) {
      return [...userReviews, ...fromApi];
    }
    return buildDemoHotelReviews(hotel, cityName || hotel.locationLine);
  }, [apiReviews, hotel, cityName, userReviews]);

  const categories = ratingCategoriesFromScore(hotel.rating);
  const overall = hotel.rating > 0 ? hotel.rating.toFixed(1) : reviews[0]?.rating.toFixed(1) ?? "—";
  const totalCount = hotel.reviewCount > 0 ? hotel.reviewCount : reviews.length;
  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);

  return (
    <section
      id="guest-reviews"
      className={cn(
        "scroll-mt-24 rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Guest feedback</p>
          <h2 className="mt-1 text-xl font-bold text-[#212121] sm:text-2xl">Reviews</h2>
          <p className="mt-1 text-sm text-[#616161]">
            {totalCount} verified guest review{totalCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#008009] px-4 py-2 text-white">
          <span className="text-2xl font-bold leading-none">{overall}</span>
          <div>
            <StarRow rating={Number(overall) || 0} size="md" />
            <p className="mt-0.5 text-[11px] font-medium opacity-90">{hotel.ratingLabel || "Guest rating"}</p>
          </div>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-6 grid gap-6 border-b border-[#eee] pb-6 lg:grid-cols-[200px_1fr]">
          <div className="rounded-lg bg-[#f5f5f5] p-4 text-center lg:text-left">
            <p className="text-3xl font-bold text-[#212121]">{overall}</p>
            <p className="mt-1 text-sm font-semibold text-[#424242]">{hotel.ratingLabel}</p>
            <p className="mt-1 text-[12px] text-[#757575]">Out of 5.0</p>
          </div>
          <div className="space-y-3">
            {categories.map((cat) => (
              <RatingBar key={cat.label} label={cat.label} score={cat.score} />
            ))}
          </div>
        </div>
      ) : null}

      <HotelWriteReviewPanel
        hotel={hotel}
        className="mt-6"
        onReviewSubmitted={(review) => {
          setUserReviews((current) => [review, ...current]);
          setShowAll(true);
        }}
      />

      <h3 className="mt-8 text-[15px] font-bold text-[#212121]">What our guests say</h3>

      <ul className="mt-4 grid gap-4">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>

      {reviews.length > INITIAL_VISIBLE ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 w-full rounded-lg border border-[#e0e0e0] bg-white py-2.5 text-sm font-semibold text-[#2196F3] transition hover:border-[#2196F3]/40 hover:bg-[#f5f9ff]"
        >
          {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </button>
      ) : null}
    </section>
  );
}
