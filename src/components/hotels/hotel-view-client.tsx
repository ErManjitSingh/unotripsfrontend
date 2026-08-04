"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HotelDetailView } from "@/components/hotels/hotel-detail-view";
import { HotelsCityResultsSkeleton } from "@/components/hotels/hotels-page-skeleton";
import { getHotelDetailBundle, type HotelDetailBundle } from "@/lib/hotels-api";

export function HotelViewClient() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city")?.trim() ?? "";
  const hotel = searchParams.get("hotel")?.trim() ?? "";

  const [bundle, setBundle] = useState<HotelDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !hotel) {
      setLoading(false);
      setError("Missing hotel or city in the link.");
      setBundle(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getHotelDetailBundle(city, hotel)
      .then((next) => {
        if (cancelled) return;
        if (!next) {
          setError("Hotel not found. It may have been removed or the link is outdated.");
          setBundle(null);
          return;
        }
        setBundle(next);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load hotel details. Please refresh and try again.");
        setBundle(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city, hotel]);

  if (loading) {
    return <HotelsCityResultsSkeleton />;
  }

  if (error || !bundle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4">
        <h1 className="text-2xl font-bold text-[#212121]">Hotel unavailable</h1>
        <p className="mt-2 max-w-md text-center text-sm text-[#757575]">
          {error ?? "This hotel could not be loaded."}
        </p>
        <Link
          href="/hotels"
          className="mt-6 rounded-md bg-[#EF6614] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E65100]"
        >
          Search hotels
        </Link>
      </div>
    );
  }

  return (
    <HotelDetailView
      city={bundle.city}
      hotel={bundle.hotel}
      roomTypes={bundle.roomTypes}
      policies={bundle.policies}
      apiReviews={bundle.reviews}
    />
  );
}
