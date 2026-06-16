"use client";

/**
 * src/app/cabs/[slug]/book/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /cabs/swift-dzire/book?pickup_city=Jaipur&drop_city=Delhi&...
 *
 * Checkout flow: guest details → Razorpay → confirmation.
 * Same pattern as hotel booking — single page, step-based.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CabBookingView } from "@/components/cabs/CabBookingView";
import { fetchCabDetail, calculateCabFare, type CabDetail } from "@/lib/cabs-booking-api";
import type { CabFareBreakdown } from "@/lib/cabs-api";

export default function CabBookPage() {
  const params = useParams();
  const sp = useSearchParams();
  const slug = params.slug as string;

  const pickupCity = sp.get("pickup_city") ?? "";
  const dropCity   = sp.get("drop_city") ?? "";
  const dropState  = sp.get("drop_state") ?? "";
  const tripType   = sp.get("trip_type") ?? "one_way";
  const travelDate = sp.get("travel_date") ?? "";

  const [cab, setCab] = useState<CabDetail | null>(null);
  const [fare, setFare] = useState<CabFareBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !pickupCity || !dropCity || !travelDate) {
      setError("Missing route or date information. Please search again.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const cabData = await fetchCabDetail(slug);
        if (cancelled) return;
        setCab(cabData);

        const fareData = await calculateCabFare({
          cab_type_id: cabData.id,
          pickup_city: pickupCity,
          drop_city:   dropCity,
          drop_state:  dropState || "India",
          trip_type:   tripType,
          travel_date: travelDate,
        });
        if (!cancelled) setFare(fareData);
      } catch {
        if (!cancelled) setError("Failed to load booking details. Please go back and try again.");
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
            <div className="h-12 w-64 animate-pulse rounded-lg bg-white" />
            <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_380px]">
              <div className="h-96 animate-pulse rounded-xl bg-white" />
              <div className="h-72 animate-pulse rounded-xl bg-white" />
            </div>
          </div>
        ) : error || !cab || !fare ? (
          <div className="mx-auto max-w-[1320px] px-3 py-12 text-center sm:px-4 lg:px-6">
            <p className="text-[15px] font-semibold text-[#C62828]">
              {error ?? "Could not calculate fare for this route."}
            </p>
            <a href="/cabs" className="mt-3 inline-block text-sm text-[#2196F3] hover:underline">
              ← Back to cab search
            </a>
          </div>
        ) : (
          <CabBookingView cab={cab} fare={fare} />
        )}
      </main>
      <Footer />
    </>
  );
}