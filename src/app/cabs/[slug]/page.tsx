"use client";

/**
 * src/app/cabs/[slug]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /cabs/swift-dzire?pickup_city=Jaipur&drop_city=Delhi&...
 *
 * Shows cab detail + fare breakdown for the searched route.
 * "Book Now" CTA leads to /cabs/[slug]/book with same query params.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CabDetailView } from "@/components/cabs/CabDetailView";
import { fetchCabDetail, calculateCabFare, type CabDetail } from "@/lib/cabs-booking-api";
import type { CabFareBreakdown } from "@/lib/cabs-api";

export default function CabDetailPage() {
  const params = useParams();
  const sp = useSearchParams();
  const slug = params.slug as string;

  const [cab, setCab] = useState<CabDetail | null>(null);
  const [fare, setFare] = useState<CabFareBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pickupCity = sp.get("pickup_city") ?? "";
  const dropCity   = sp.get("drop_city") ?? "";
  const dropState  = sp.get("drop_state") ?? "";
  const tripType   = sp.get("trip_type") ?? "one_way";
  const travelDate = sp.get("travel_date") ?? "";

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [cabData, fareData] = await Promise.allSettled([
          fetchCabDetail(slug),
          pickupCity && dropCity && travelDate
            ? calculateCabFare({
                cab_type_id: "", // filled below after we have cab
                pickup_city: pickupCity,
                drop_city:   dropCity,
                drop_state:  dropState || "India",
                trip_type:   tripType,
                travel_date: travelDate,
              })
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        if (cabData.status === "rejected") {
          setError("Cab not found. It may have been removed.");
          setLoading(false);
          return;
        }

        const cabDetail = cabData.value;
        setCab(cabDetail);

        // Re-fetch fare with real cab_type_id if we didn't have it
        if (pickupCity && dropCity && travelDate) {
          try {
            const realFare = await calculateCabFare({
              cab_type_id: cabDetail.id,
              pickup_city: pickupCity,
              drop_city:   dropCity,
              drop_state:  dropState || "India",
              trip_type:   tripType,
              travel_date: travelDate,
            });
            if (!cancelled) setFare(realFare);
          } catch {
            // Fare calc failed — still show cab detail without fare
          }
        } else if (fareData.status === "fulfilled" && fareData.value) {
          setFare(fareData.value);
        }
      } catch {
        if (!cancelled) setError("Failed to load cab details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, pickupCity, dropCity, travelDate, tripType]);

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="cabs" />
      <main className="min-h-screen bg-[#F5F5F5]">
        {loading ? (
          <div className="mx-auto max-w-[1320px] px-3 py-8 sm:px-4 lg:px-6">
            <div className="h-64 animate-pulse rounded-xl bg-white" />
            <div className="mt-4 h-48 animate-pulse rounded-xl bg-white" />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-[1320px] px-3 py-12 text-center sm:px-4 lg:px-6">
            <p className="text-[15px] font-semibold text-[#C62828]">{error}</p>
            <a href="/cabs" className="mt-3 inline-block text-sm text-[#2196F3] hover:underline">
              ← Back to cab search
            </a>
          </div>
        ) : cab ? (
          <CabDetailView cab={cab} fare={fare} />
        ) : null}
      </main>
      <Footer />
    </>
  );
}