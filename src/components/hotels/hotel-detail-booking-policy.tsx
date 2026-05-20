"use client";

import type { HotelListing } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type HotelDetailBookingPolicyProps = {
  hotel: HotelListing;
  policies?: string[];
  className?: string;
};

export function HotelDetailBookingPolicy({ policies: policiesProp, className }: HotelDetailBookingPolicyProps) {
  const policies = policiesProp ?? [];

  if (policies.length === 0) return null;

  return (
    <section
      id="booking-policy"
      className={cn(
        "scroll-mt-24 rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Booking Policy</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[12px] leading-relaxed text-[#424242] sm:text-[13px]">
        {policies.map((policy) => (
          <li key={policy}>{policy}</li>
        ))}
      </ul>
    </section>
  );
}
