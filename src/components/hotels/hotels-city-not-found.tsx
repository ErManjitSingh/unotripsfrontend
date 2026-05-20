"use client";

import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import type { ApiCityEntry } from "@/lib/hotels-city-match";
import { formatCityLabel } from "@/lib/hotels-city-match";
import { hotelResultsHref } from "@/lib/hotels-catalog";

type HotelsCityNotFoundProps = {
  searchTerm: string;
  available: ApiCityEntry[];
};

export function HotelsCityNotFound({ searchTerm, available }: HotelsCityNotFoundProps) {
  return (
    <>
      <Navbar variant="ease" easeActiveNavId="hotels" />
      <main className="min-h-[50vh] bg-[#f5f5f5] px-4 py-10 text-[#424242]">
        <div className="mx-auto max-w-xl rounded-xl border border-[#FFCDD2] bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#C62828]">
            &ldquo;{searchTerm}&rdquo; is not in our hotel list
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#616161]">
            We could not match this city. Try searching one of the cities below to see all available
            hotels.
          </p>
          {available.length > 0 ? (
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {available.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={hotelResultsHref(c.slug, { q: c.city })}
                    className="inline-block rounded-full border border-[#2196F3] bg-[#E3F2FD] px-4 py-2 text-sm font-semibold text-[#1565C0] transition-colors hover:bg-[#BBDEFB]"
                  >
                    {formatCityLabel(c.city)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href="/hotels"
            className="mt-6 inline-block text-sm font-semibold text-[#2196F3] hover:underline"
          >
            ← Back to Hotels
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
