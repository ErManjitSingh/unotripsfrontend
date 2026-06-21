"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
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

const AVATAR_PALETTE = ["#1e293b","#3730a3","#166534","#92400e","#1e3a5f","#6b21a8","#134e4a"];
function avatarColor(i: string) { return AVATAR_PALETTE[Math.max(0, i.charCodeAt(0) - 65) % AVATAR_PALETTE.length]; }
function reviewerInitial(a: string) { return (a.replace(/^[^#]*#?/, "").trim().charAt(0) || "G").toUpperCase(); }
function fmtDate(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
function scoreLabel(s: number) {
  if (s >= 4.5) return "Exceptional";
  if (s >= 4.0) return "Excellent";
  if (s >= 3.5) return "Very Good";
  if (s >= 3.0) return "Good";
  return "Average";
}
function ratingCategories(rating: number) {
  const c = (n: number) => Math.min(5, Math.max(0, Math.round(n * 10) / 10));
  const r = rating > 0 ? rating : 0;
  return [
    { label: "Cleanliness",   score: c(r + 0.1) },
    { label: "Sleep Quality", score: c(r + 0.2) },
    { label: "Location",      score: c(r - 0.5) },
    { label: "Rooms",         score: c(r - 0.1) },
    { label: "Service",       score: c(r - 0.1) },
    { label: "Value",         score: c(r - 0.1) },
  ].filter((x) => x.score > 0);
}

function Bar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[88px] shrink-0 text-[11px] text-[#757575]">{label}</span>
      <div className="h-[2px] flex-1 rounded-full bg-[#ebebeb]">
        <div className="h-full rounded-full bg-[#1e293b]" style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="w-5 shrink-0 text-right text-[11px] font-semibold text-[#424242]">{score.toFixed(1)}</span>
    </div>
  );
}

function Card({ r }: { r: HotelReviewUi }) {
  const init = reviewerInitial(r.author);
  return (
    <li className="flex gap-3 py-3.5 first:pt-0">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: avatarColor(init) }}
      >{init}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-[#212121]">
            {r.author}
            <span className="ml-1.5 font-normal text-[#b0b0b0]">·</span>
            <span className="ml-1.5 font-normal text-[#9E9E9E]">{fmtDate(r.date)}</span>
            {r.roomType && <><span className="ml-1.5 text-[#b0b0b0]">·</span><span className="ml-1.5 font-normal text-[#9E9E9E]">{r.roomType}</span></>}
          </p>
          <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[#212121]">
            <Star className="h-2.5 w-2.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
            {r.rating.toFixed(1)}
          </span>
        </div>
        {r.title && <p className="mt-1 text-[12px] font-semibold text-[#212121]">{r.title}</p>}
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#616161] line-clamp-2">{r.body}</p>
      </div>
    </li>
  );
}

export function HotelDetailReviews({ hotel, cityName = "", apiReviews, className }: HotelDetailReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);
  const [userReviews, setUserReviews] = useState<HotelReviewUi[]>([]);

  const reviews = useMemo<HotelReviewUi[]>(() => {
    const fromApi = apiReviews?.length
      ? mapApiReviewsForUi(apiReviews).map((r) => ({ id: r.id, author: r.author, rating: r.rating, title: r.title, body: r.body, date: r.date, roomType: r.roomType, helpfulCount: r.helpfulCount }))
      : [];
    if (fromApi.length > 0 || userReviews.length > 0) return [...userReviews, ...fromApi];
    return buildDemoHotelReviews(hotel, cityName || hotel.locationLine);
  }, [apiReviews, hotel, cityName, userReviews]);

  const cats        = ratingCategories(hotel.rating);
  const overallNum  = hotel.rating > 0 ? hotel.rating : (reviews[0]?.rating ?? 0);
  const overall     = overallNum > 0 ? overallNum.toFixed(1) : "—";
  const totalCount  = hotel.reviewCount > 0 ? hotel.reviewCount : reviews.length;
  const visible     = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);
  const fullStars   = Math.round(overallNum);

  return (
    <section
      id="guest-reviews"
      className={cn("scroll-mt-24 rounded-xl border border-[#e8e8e8] bg-white shadow-sm", className)}
    >
      <div className="px-5 py-4 sm:px-6">

        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] pb-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#212121]">Guest Reviews</h2>
            <p className="mt-0.5 text-[11px] text-[#9E9E9E]">
              {totalCount.toLocaleString("en-IN")} verified stay{totalCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[22px] font-black leading-none text-[#212121]">{overall}</span>
              <span className="ml-0.5 text-[12px] font-normal text-[#9E9E9E]"> / 5</span>
              <div className="mt-1 flex justify-end gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3 w-3", i < fullStars ? "fill-[#FFC107] text-[#FFC107]" : "fill-[#e8e8e8] text-[#e8e8e8]")} aria-hidden />
                ))}
              </div>
            </div>
            <span className="rounded border border-[#e8e8e8] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#616161]">
              {scoreLabel(overallNum)}
            </span>
          </div>
        </div>

        {/* ── Score breakdown — 2-col grid ── */}
        {cats.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-[#f2f2f2] py-4 sm:grid-cols-2">
            {cats.map((c) => <Bar key={c.label} label={c.label} score={c.score} />)}
          </div>
        )}

        {/* ── Write a review — collapsible ── */}
        <div className="border-b border-[#f2f2f2] py-3">
          <button
            type="button"
            onClick={() => setWriteOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#424242] hover:text-[#EF6614]"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", writeOpen && "rotate-180")} aria-hidden />
            Write a review
          </button>
          {writeOpen && (
            <div className="mt-3">
              <HotelWriteReviewPanel
                hotel={hotel}
                onReviewSubmitted={(review) => {
                  setUserReviews((c) => [review, ...c]);
                  setShowAll(true);
                  setWriteOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* ── Reviews list ── */}
        <ul className="mt-1 divide-y divide-[#f5f5f5]">
          {visible.map((r) => <Card key={r.id} r={r} />)}
        </ul>

        {reviews.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-1 border-t border-[#f2f2f2] pt-3 text-[12px] font-semibold text-[#424242] underline-offset-2 hover:text-[#EF6614] hover:underline"
          >
            {showAll ? "Show fewer" : `View all ${reviews.length} reviews`}
          </button>
        )}

      </div>
    </section>
  );
}
