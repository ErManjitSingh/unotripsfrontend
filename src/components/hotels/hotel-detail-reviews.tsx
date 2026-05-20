"use client";



import type { HotelListing } from "@/lib/hotels-catalog";

import { mapApiReviewsForUi, type ApiReview } from "@/lib/hotels-api";

import { cn, formatInrAmount } from "@/lib/utils";



type HotelDetailReviewsProps = {

  hotel: HotelListing;

  apiReviews?: ApiReview[];

  className?: string;

};



function reviewerInitial(author: string) {

  const cleaned = author.replace(/^[^#]*#?/, "").trim();

  const ch = cleaned.charAt(0).toUpperCase();

  return ch || "G";

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



function RatingBar({ label, score }: { label: string; score: number }) {

  const pct = Math.min(100, Math.max(0, (score / 5) * 100));



  return (

    <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2 sm:grid-cols-[120px_1fr_2.5rem]">

      <span className="text-[12px] text-[#424242] sm:text-[13px]">{label}</span>

      <div className="hidden h-2 overflow-hidden rounded-full bg-[#e8e8e8] sm:block">

        <div className="h-full rounded-full bg-[#2196F3]" style={{ width: `${pct}%` }} />

      </div>

      <span className="text-right text-[12px] font-semibold text-[#212121] sm:text-[13px]">{score.toFixed(1)}</span>

      <div className="col-span-2 h-2 overflow-hidden rounded-full bg-[#e8e8e8] sm:hidden">

        <div className="h-full rounded-full bg-[#2196F3]" style={{ width: `${pct}%` }} />

      </div>

    </div>

  );

}



export function HotelDetailReviews({ hotel, apiReviews, className }: HotelDetailReviewsProps) {

  const reviews = apiReviews?.length

    ? mapApiReviewsForUi(apiReviews).map((r) => ({

        id: r.id,

        author: r.author,

        date: r.date,

        title: r.title,

        body: r.body,

      }))

    : [];



  const categories = ratingCategoriesFromScore(hotel.rating);

  const overall = hotel.rating > 0 ? hotel.rating.toFixed(1) : "—";



  if (hotel.reviewCount === 0 && reviews.length === 0) {

    return (

      <section

        id="guest-reviews"

        className={cn(

          "scroll-mt-24 rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6",

          className,

        )}

      >

        <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Guest Reviews</h2>

        <p className="mt-3 text-[13px] text-[#757575]">No guest reviews yet for this property.</p>

      </section>

    );

  }



  return (

    <section

      id="guest-reviews"

      className={cn(

        "scroll-mt-24 rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6",

        className,

      )}

    >

      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Guest Rating</h2>



      <div className="mt-4 flex flex-col gap-5 border-b border-[#eee] pb-6 lg:flex-row lg:gap-8">

        <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-[#008009] px-6 py-5 text-center text-white sm:min-w-[200px] lg:items-start lg:text-left">

          <p className="text-3xl font-bold leading-none sm:text-4xl">

            {overall}

            {hotel.rating > 0 ? <span className="text-lg font-semibold opacity-90"> /5</span> : null}

          </p>

          <p className="mt-1 text-sm font-semibold">{hotel.ratingLabel}</p>

          <p className="mt-2 text-[11px] opacity-90">

            Based on {formatInrAmount(hotel.reviewCount)} reviews

          </p>

        </div>



        {categories.length > 0 ? (

          <div className="min-w-0 flex-1 space-y-3">

            {categories.map((cat) => (

              <RatingBar key={cat.label} label={cat.label} score={cat.score} />

            ))}

          </div>

        ) : null}

      </div>



      {reviews.length > 0 ? (

        <>

          <h3 className="mt-6 text-[15px] font-bold text-[#212121]">What our guests say</h3>

          <ul className="mt-4 divide-y divide-[#eee]">

            {reviews.map((review) => (

              <li key={review.id} className="flex gap-3 py-4 first:pt-0 sm:gap-4">

                <div

                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2196F3] text-sm font-bold text-white sm:h-11 sm:w-11"

                  aria-hidden

                >

                  {reviewerInitial(review.author)}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[12px] font-medium text-[#616161]">{review.author}</p>

                  <p className="text-[11px] text-[#9E9E9E]">{review.date}</p>

                  <p className="mt-2 text-[14px] font-bold text-[#212121]">{review.title}</p>

                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#424242]">{review.body}</p>

                </div>

              </li>

            ))}

          </ul>

        </>

      ) : null}

    </section>

  );

}

