import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Headphones, MapPin, Search, ShieldCheck, Star } from "lucide-react";
import {
  hotelDetailHref,
  hotelListingKey,
  type HotelListing,
} from "@/lib/hotels-catalog";
import { formatInrAmount } from "@/lib/utils";

type HotelsPageCtaProps = {
  searchHref?: string;
  exploreHref?: string;
  hotel?: HotelListing | null;
};

export function HotelsPageCta({
  searchHref = "/hotels#hotel-search",
  exploreHref = "/hotels#popular-destinations",
  hotel,
}: HotelsPageCtaProps) {
  return (
    <section className="pb-10 pt-4 sm:pb-16 sm:pt-6">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-br from-primary via-orange-500 to-amber-500 shadow-[0_24px_60px_-20px_rgba(234,88,12,0.55)]">
          {/* bg blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" aria-hidden />

          <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:p-10">
            {/* ── Left: copy ── */}
            <div className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-100">Book with confidence</p>
              <h2 className="mt-2 font-display text-[1.65rem] font-bold leading-tight sm:text-3xl lg:text-4xl">
                Ready to find your perfect stay?
              </h2>
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-orange-50 sm:text-base">
                Search by city, compare prices instantly, and book in minutes. Best rates, verified hotels, and 24/7 support on every booking.
              </p>

              <ul className="mt-5 flex flex-wrap gap-3 text-xs font-semibold sm:text-sm">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Lowest price guarantee
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                  <Headphones className="h-4 w-4" aria-hidden />
                  24/7 customer care
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={searchHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:text-base"
                >
                  <Search className="h-4 w-4" aria-hidden />
                  Search hotels
                </Link>
                <Link
                  href={exploreHref}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-base"
                >
                  Explore destinations
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            {/* ── Right: hotel card from API ── */}
            {hotel ? (
              <Link
                href={hotelDetailHref(hotel.citySlug, hotelListingKey(hotel))}
                className="group relative hidden overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-2 ring-white/30 transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.24)] lg:block"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {hotel.images[0] ? (
                    <Image
                      src={hotel.images[0]}
                      alt={hotel.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="480px"
                    />
                  ) : (
                    <div className="h-full w-full bg-orange-100" />
                  )}
                  {hotel.dealOfDay && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      Deal of the Day
                    </span>
                  )}
                  {hotel.freeCancellation && (
                    <span className="absolute right-3 top-3 rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-bold text-[#166534] shadow">
                      ✓ Free cancellation
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-[#212121]">{hotel.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#757575]">
                        <MapPin className="h-3 w-3 shrink-0 text-[#EF6614]" aria-hidden />
                        {hotel.locationLine}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-0.5" aria-label={`${hotel.stars} stars`}>
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                      ))}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                    <div>
                      <p className="text-[10px] text-[#9E9E9E]">Starting from</p>
                      <p className="text-[18px] font-extrabold leading-tight text-[#EF6614]">
                        ₹{formatInrAmount(hotel.price)}
                        <span className="ml-1 text-[11px] font-normal text-[#9E9E9E]">/night</span>
                      </p>
                      {hotel.originalPrice > hotel.price && (
                        <p className="text-[11px] text-[#b0b0b0] line-through">₹{formatInrAmount(hotel.originalPrice)}</p>
                      )}
                    </div>
                    <span className="rounded-lg bg-gradient-to-b from-[#e8651c] to-[#c94e0a] px-4 py-2 text-[12px] font-bold text-white shadow-[0_3px_10px_rgba(201,78,10,0.35)]">
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              /* fallback when no hotel data */
              <div className="relative hidden min-h-[220px] overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/25 lg:flex lg:items-center lg:justify-center">
                <p className="text-sm font-semibold text-white/70">Explore our top properties →</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
