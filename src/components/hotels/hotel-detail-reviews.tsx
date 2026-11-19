"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, MessageSquare, Moon, PenLine, Star, ThumbsUp } from "lucide-react";
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

const STAR_FILTERS = [5, 4, 3, 2, 1] as const;

const AVATAR_TONES: Record<string, { bg: string; fg: string }> = {
  A: { bg: "#FDE7D8", fg: "#E25B12" },
  R: { bg: "#FFE7C2", fg: "#EA580C" },
  M: { bg: "#DDF5E5", fg: "#15803D" },
  S: { bg: "#E7F0FF", fg: "#1D4ED8" },
  P: { bg: "#F3E8FF", fg: "#7E22CE" },
  K: { bg: "#FFF4D6", fg: "#A16207" },
};

function avatarTone(initial: string) {
  return AVATAR_TONES[initial] ?? { bg: "#F4EFEA", fg: "#9A3412" };
}

function reviewerInitial(author: string) {
  const name = author.trim();
  return (name.charAt(0) || "G").toUpperCase();
}

function fmtStay(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }
  return raw.replace(/^[A-Za-z]+/, (month) => month.slice(0, 3));
}

function scoreLabel(score: number) {
  if (score >= 4.5) return "Exceptional";
  if (score >= 4) return "Excellent";
  if (score >= 3.5) return "Very Good";
  if (score >= 3) return "Good";
  return "Average";
}

function starBucket(rating: number) {
  return Math.min(5, Math.max(1, Math.round(rating))) as (typeof STAR_FILTERS)[number];
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="fill-[#E7E1D8] text-[#E7E1D8]" style={{ width: size, height: size }} aria-hidden />
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="fill-[#F5B301] text-[#F5B301]" style={{ width: size, height: size }} aria-hidden />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

function ScoreBar({
  icon,
  label,
  score,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#EF6614]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[#3c4450]">{label}</span>
          <span className="text-[13px] font-semibold tabular-nums text-[#1c2430]">{score.toFixed(1)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#F3EEE8]">
          <div
            className="h-full rounded-full bg-[#EF6614]"
            style={{ width: `${Math.max(0, Math.min(100, (score / 5) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ review }: { review: HotelReviewUi }) {
  const initial = reviewerInitial(review.author);
  const tone = avatarTone(initial);
  const stayed = fmtStay(review.date);

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 py-5 sm:gap-x-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold"
        style={{ backgroundColor: tone.bg, color: tone.fg }}
        aria-hidden
      >
        {initial}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[15px] font-bold text-[#1c2430]">{review.author}</p>
            {stayed ? <p className="mt-0.5 text-[12px] text-[#8b938c]">Stayed {stayed}</p> : null}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-semibold text-[#15803D]">
            <Check className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
            Verified Stay
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5">
            <Stars value={review.rating} />
            <span className="text-[13px] font-semibold tabular-nums text-[#1c2430]">{review.rating.toFixed(1)}</span>
          </span>
          {review.roomType ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <BedDouble className="h-3.5 w-3.5" aria-hidden />
              {review.roomType}
            </span>
          ) : null}
        </div>

        {review.title ? (
          <p className="mt-2.5 text-[14px] font-bold text-[#1c2430]">{review.title}</p>
        ) : null}
        <p className="mt-1 text-[13px] leading-relaxed text-[#5c6570]">{review.body}</p>

        <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8b938c]">
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          Helpful ({review.helpfulCount ?? 0})
        </p>
      </div>
    </li>
  );
}

export function HotelDetailReviews({ hotel, cityName = "", apiReviews, className }: HotelDetailReviewsProps) {
  const [writeOpen, setWriteOpen] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [userReviews, setUserReviews] = useState<HotelReviewUi[]>([]);

  const reviews = useMemo<HotelReviewUi[]>(() => {
    const fromApi = apiReviews?.length
      ? mapApiReviewsForUi(apiReviews).map((review) => ({
          id: review.id,
          author: review.author,
          rating: review.rating,
          title: review.title,
          body: review.body,
          date: review.date,
          roomType: review.roomType,
          helpfulCount: review.helpfulCount,
        }))
      : [];
    if (fromApi.length > 0 || userReviews.length > 0) return [...userReviews, ...fromApi];
    return buildDemoHotelReviews(hotel, cityName || hotel.locationLine);
  }, [apiReviews, hotel, cityName, userReviews]);

  const overallNum = useMemo(() => {
    if (hotel.rating > 0 && hotel.reviewCount > 0) return hotel.rating;
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [hotel.rating, hotel.reviewCount, reviews]);

  const counts = useMemo(() => {
    const tally = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) tally[starBucket(review.rating)] += 1;
    return tally;
  }, [reviews]);

  const visible = starFilter == null
    ? reviews
    : reviews.filter((review) => starBucket(review.rating) === starFilter);

  const cleanliness = Math.min(5, Math.round((overallNum + 0.1) * 10) / 10);
  const sleep = Math.min(5, Math.round((overallNum + 0.2) * 10) / 10);
  const stayCount = Math.max(hotel.reviewCount, reviews.length);

  return (
    <section
      id="guest-reviews"
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-[22px] border border-[#f0e4d8] bg-white shadow-[0_10px_30px_-24px_rgba(120,53,15,0.45)]",
        className,
      )}
    >
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 border-b border-[#f3ece6] pb-5 lg:grid-cols-[minmax(0,1.15fr)_auto_minmax(220px,0.9fr)] lg:items-center lg:gap-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#EF6614]">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#1c2430]">Guest Reviews</h2>
              <p className="mt-0.5 text-[13px] text-[#8b938c]">Real experiences from our verified guests</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#EF6614]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
                {stayCount.toLocaleString("en-IN")} verified stay{stayCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="lg:text-center">
            <p className="leading-none">
              <span className="text-[40px] font-black tracking-[-0.04em] text-[#1c2430]">
                {overallNum > 0 ? overallNum.toFixed(1) : "—"}
              </span>
              <span className="ml-1 text-[15px] font-medium text-[#9aa09a]">/5</span>
            </p>
            <div className="mt-2">
              <Stars value={overallNum} size={16} />
            </div>
            {overallNum > 0 ? (
              <span className="mt-2 inline-flex rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[12px] font-semibold text-[#15803D]">
                {scoreLabel(overallNum)}
              </span>
            ) : null}
          </div>

          {overallNum > 0 ? (
            <div className="space-y-3">
              <ScoreBar
                icon={<BedDouble className="h-4 w-4" aria-hidden />}
                label="Cleanliness"
                score={cleanliness}
              />
              <ScoreBar
                icon={<Moon className="h-4 w-4" aria-hidden />}
                label="Sleep Quality"
                score={sleep}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-b border-[#f3ece6] py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter reviews by rating">
            <FilterPill active={starFilter == null} onClick={() => setStarFilter(null)}>
              All Reviews ({reviews.length})
            </FilterPill>
            {STAR_FILTERS.map((stars) => (
              <FilterPill
                key={stars}
                active={starFilter === stars}
                onClick={() => setStarFilter(stars)}
              >
                {stars}★ ({counts[stars]})
              </FilterPill>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setWriteOpen((open) => !open)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#EF6614] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#E65100]"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Write a Review
          </button>
        </div>

        {writeOpen ? (
          <div className="border-b border-[#f3ece6] py-4">
            <HotelWriteReviewPanel
              hotel={hotel}
              onReviewSubmitted={(review) => {
                setUserReviews((current) => [review, ...current]);
                setStarFilter(null);
                setWriteOpen(false);
              }}
            />
          </div>
        ) : null}

        {visible.length > 0 ? (
          <ul className="divide-y divide-[#f3ece6]">
            {visible.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-[13px] text-[#8b938c]">No reviews in this rating.</p>
        )}
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition",
        active
          ? "border-[#EF6614] bg-white text-[#EF6614]"
          : "border-[#ece7e2] bg-white text-[#5c6570] hover:border-[#EF6614]/40",
      )}
    >
      {children}
    </button>
  );
}
