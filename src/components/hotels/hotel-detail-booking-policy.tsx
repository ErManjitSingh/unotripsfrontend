import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import type { ApiHotelPolicies } from "@/lib/hotels-api";
import type { HotelListing } from "@/lib/hotels-catalog";
import { siteTelHref, siteWhatsAppChatUrl } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

type HotelDetailBookingPolicyProps = {
  hotel: HotelListing;
  /** Structured hotel policies from the API (preferred). */
  hotelPolicies?: ApiHotelPolicies | null;
  /** Legacy bullet list — kept for older call sites. */
  policies?: string[];
  className?: string;
};

export function clockLabel(raw?: string): string {
  if (!raw) return "";
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw.trim();
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

type PolicyRow = {
  label: string;
  value: string;
  listed: boolean;
};

function buildRows(
  hotel: HotelListing,
  hotelPolicies?: ApiHotelPolicies | null,
  legacyBullets?: string[],
): PolicyRow[] {
  const checkIn = clockLabel(hotelPolicies?.check_in_time || hotel.checkInTime) || "2:00 PM";
  const checkOut = clockLabel(hotelPolicies?.check_out_time || hotel.checkOutTime) || "11:00 AM";

  const cancellation = hotelPolicies?.cancellation?.trim() || "";
  const children = hotelPolicies?.children?.trim() || "";
  const pets = hotelPolicies?.pets?.trim() || "";
  const smoking = hotelPolicies?.smoking?.trim() || "";
  const extraBed = hotelPolicies?.extra_bed?.trim() || "";

  // Pull any leftover legacy bullets that aren't the check-in line
  const legacyExtra = (legacyBullets ?? [])
    .map((line) => line.trim())
    .filter((line) => line && !/^check-in from/i.test(line));

  const rows: PolicyRow[] = [
    {
      label: "Check-in / Check-out",
      value: `Check-in from ${checkIn} · Check-out by ${checkOut}`,
      listed: true,
    },
    {
      label: "Cancellation",
      value: cancellation || "Not listed by this property yet — confirm before you book.",
      listed: Boolean(cancellation),
    },
    {
      label: "Children",
      value: children || "Not listed by this property yet — confirm child policy and age rules before you book.",
      listed: Boolean(children),
    },
    {
      label: "ID proof",
      value: "Not listed by this property yet — confirm which IDs are accepted at check-in.",
      listed: false,
    },
    {
      label: "Extra bed",
      value: extraBed || "Ask the hotel if an extra bed is available for your dates.",
      listed: Boolean(extraBed),
    },
  ];

  if (pets) rows.push({ label: "Pets", value: pets, listed: true });
  if (smoking) rows.push({ label: "Smoking", value: smoking, listed: true });

  for (const line of legacyExtra) {
    if (rows.some((r) => r.value === line)) continue;
    rows.push({ label: "Other", value: line, listed: true });
  }

  return rows;
}

export function HotelDetailBookingPolicy({
  hotel,
  hotelPolicies,
  policies: policiesProp,
  className,
}: HotelDetailBookingPolicyProps) {
  const checkIn = clockLabel(hotelPolicies?.check_in_time || hotel.checkInTime) || "2:00 PM";
  const checkOut = clockLabel(hotelPolicies?.check_out_time || hotel.checkOutTime) || "11:00 AM";
  const rows = buildRows(hotel, hotelPolicies, policiesProp);
  const whatsappMsg = `Hi, I'd like to confirm cancellation, child, and ID rules for ${hotel.name}.`;

  return (
    <section
      id="booking-policy"
      className={cn(
        "scroll-mt-24 rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Booking Policy</h2>
      <p className="mt-1 text-[12px] text-[#757575]">
        Times below are from the hotel. Empty rules are not invented — confirm with us before you pay.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9E9E9E]">Check-in</p>
          <p className="mt-1 text-[18px] font-bold text-[#1a1a1a]">{checkIn}</p>
        </div>
        <div className="rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9E9E9E]">Check-out</p>
          <p className="mt-1 text-[18px] font-bold text-[#1a1a1a]">{checkOut}</p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-[#f0f0f0] rounded-xl border border-[#eee]">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6">
            <p className="w-36 shrink-0 text-[11px] font-bold uppercase tracking-[0.06em] text-[#9E9E9E]">
              {row.label}
            </p>
            <p
              className={cn(
                "min-w-0 flex-1 text-[13px] leading-relaxed",
                row.listed ? "text-[#424242]" : "text-[#757575]",
              )}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-[#757575]">
          Platform-wide rules:{" "}
          <Link href="/cancellation-policy" className="font-semibold text-[#EF6614] hover:underline">
            Cancellation Policy
          </Link>
          . Hotel-specific terms in your booking confirmation take priority.
        </p>
        <div className="flex shrink-0 items-center gap-3 text-[12px]">
          <a href={siteTelHref()} className="inline-flex items-center gap-1 font-semibold text-[#1a1a1a]">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            Call
          </a>
          <span className="text-[#e5e7eb]" aria-hidden>
            ·
          </span>
          <a
            href={siteWhatsAppChatUrl(whatsappMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#128C7E]"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
