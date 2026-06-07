"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { HotelTravellersView } from "@/components/hotels/hotel-travellers-view";
import { getHotelDetailBundle, type HotelDetailBundle } from "@/lib/hotels-api";
import { hotelListingKey, hotelListingPathSlug, parseHotelCitySlug } from "@/lib/hotels-catalog";
import { getPendingCheckoutsForUser } from "@/lib/pending-checkout-storage";
import { useAuthOptional } from "@/contexts/auth-context";

function ResumeCheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-3 py-12">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-center gap-3 px-3 py-16 sm:px-4 lg:px-6">
        <Loader2 className="h-8 w-8 animate-spin text-[#2196F3]" aria-hidden />
        <p className="text-sm font-medium text-[#616161]">Loading your checkout…</p>
      </div>
    </main>
  );
}

export function HotelResumeCheckoutClient() {
  const searchParams = useSearchParams();
  const auth = useAuthOptional();
  const [bundle, setBundle] = useState<HotelDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolved = useMemo(() => {
    const bookingId = searchParams.get("booking_id") ?? undefined;
    let citySlug = searchParams.get("city") ?? "";
    let hotelSlug = searchParams.get("hotel") ?? "";
    let roomTypeId = searchParams.get("roomType") ?? "";
    let ratePlanId = searchParams.get("rate") ?? "";
    let checkIn = searchParams.get("check_in") ?? "";
    let checkOut = searchParams.get("check_out") ?? "";
    let rooms = Number(searchParams.get("rooms") ?? "1");
    let guests = Number(searchParams.get("guests") ?? "2");

    if (auth?.user && bookingId) {
      const pending = getPendingCheckoutsForUser(auth.user.id, auth.user.email).find(
        (p) => p.bookingId === bookingId,
      );
      if (pending) {
        citySlug = citySlug || pending.citySlug;
        hotelSlug = hotelSlug || pending.hotelSlug || pending.hotelId;
        roomTypeId = roomTypeId || pending.roomTypeId;
        ratePlanId = ratePlanId || pending.ratePlanId;
        checkIn = checkIn || pending.checkIn;
        checkOut = checkOut || pending.checkOut;
        rooms = rooms || pending.rooms;
        guests = guests || pending.guests;
      }
    }

    return {
      bookingId,
      citySlug,
      hotelSlug,
      roomTypeId,
      ratePlanId,
      checkIn,
      checkOut,
      rooms,
      guests,
    };
  }, [searchParams, auth?.user]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { citySlug, hotelSlug } = resolved;
      if (!citySlug || !hotelSlug) {
        setError("Missing hotel information. Please open checkout from your account again.");
        setLoading(false);
        return;
      }

      try {
        const data = await getHotelDetailBundle(
          parseHotelCitySlug(citySlug),
          decodeURIComponent(hotelSlug),
        );
        if (cancelled) return;
        if (!data) {
          setError(
            "We could not load this hotel. It may no longer be available — try searching again.",
          );
          setBundle(null);
        } else {
          setBundle(data);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading checkout. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [resolved]);

  if (loading) {
    return (
      <>
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <ResumeCheckoutSkeleton />
      </>
    );
  }

  if (error || !bundle) {
    return (
      <>
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <main className="min-h-screen bg-[#f5f5f5] px-4 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-[#FFCDD2] bg-white p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-12 w-12 text-[#E65100]" aria-hidden />
            <h1 className="mt-4 text-xl font-bold text-[#212121]">Checkout unavailable</h1>
            <p className="mt-2 text-sm text-[#616161]">{error ?? "Hotel not found."}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-[#2196F3] hover:bg-[#1976D2]">
                <Link href="/account">Back to account</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/hotels">Search hotels</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const pathSlug = hotelListingPathSlug(bundle.city.slug);
  const hotelKey = hotelListingKey(bundle.hotel);

  return (
    <HotelTravellersView pathSlug={pathSlug} hotelId={hotelKey} bundle={bundle} />
  );
}



