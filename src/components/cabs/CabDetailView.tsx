"use client";

/**
 * src/components/cabs/CabDetailView.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cab detail page content — shown at /cabs/[slug]?search_params
 *
 * Layout:
 *   Left column: Gallery + description + features
 *   Right sidebar (sticky): Fare summary + route + Book Now CTA
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  AirVent,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Users,
} from "lucide-react";
import type { CabDetail } from "@/lib/cabs-booking-api";
import type { CabFareBreakdown } from "@/lib/cabs-api";
import { formatCabDate } from "@/lib/cabs-api";
import { siteWhatsAppChatUrl, siteTelHref } from "@/lib/site-contact";
import { cn, formatInrAmount } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  sedan:           "Sedan",
  suv:             "SUV",
  luxury:          "Luxury",
  tempo_traveller: "Tempo Traveller",
  mini:            "Mini",
  bus:             "Bus",
};

type CabDetailViewProps = {
  cab:   CabDetail;
  fare:  CabFareBreakdown | null;
};

export function CabDetailView({ cab, fare }: CabDetailViewProps) {
  const sp = useSearchParams();
  const [activeImg, setActiveImg] = useState(0);

  const pickupCity = sp.get("pickup_city") ?? "";
  const dropCity   = sp.get("drop_city") ?? "";
  const tripType   = sp.get("trip_type") ?? "one_way";
  const travelDate = sp.get("travel_date") ?? "";
  const returnDate = sp.get("return_date") ?? "";
  const passengers = Number(sp.get("passengers") ?? 1);

  const gallery = [cab.featured_image, ...(cab.gallery_images ?? [])].filter(Boolean) as string[];
  const category = CATEGORY_LABELS[cab.cab_category] ?? cab.cab_category;
  const travelLabel = formatCabDate(travelDate);
  const returnLabel = returnDate ? formatCabDate(returnDate) : null;

  const bookHref = `/cabs/${cab.slug}/book?${sp.toString()}`;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-4 lg:px-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-6">

        {/* ── Left column ────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Gallery */}
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="relative aspect-[16/9] w-full bg-[#F0F0F0]">
              {gallery.length > 0 ? (
                <Image
                  src={gallery[activeImg] ?? gallery[0]}
                  alt={cab.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 60vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#BDBDBD]">
                  <span className="text-6xl">🚗</span>
                </div>
              )}
              {/* Category badge */}
              <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {category}
              </span>
              {cab.is_ac && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#E3F2FD] px-2.5 py-0.5 text-xs font-semibold text-[#1565C0]">
                  <AirVent className="h-3 w-3" strokeWidth={2} /> AC
                </span>
              )}
            </div>
            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition",
                      activeImg === i ? "border-[#EF6614]" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <Image src={img} alt="" fill unoptimized className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Name + Specs */}
          <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
            <h1 className="text-xl font-bold text-[#212121] sm:text-2xl">{cab.name}</h1>
            {cab.short_description && (
              <p className="mt-1 text-sm text-[#616161]">{cab.short_description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#424242]">
                <Users className="h-3.5 w-3.5 text-[#757575]" strokeWidth={1.5} />
                {cab.seating_capacity} Seats
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#424242]">
                <Briefcase className="h-3.5 w-3.5 text-[#757575]" strokeWidth={1.5} />
                {cab.luggage_capacity} Bags
              </span>
              {cab.is_ac && (
                <span className="flex items-center gap-1.5 rounded-full border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#424242]">
                  <AirVent className="h-3.5 w-3.5 text-[#757575]" strokeWidth={1.5} />
                  Air Conditioned
                </span>
              )}
            </div>
          </section>

          {/* Features */}
          {cab.features.length > 0 && (
            <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#212121]">Features & Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cab.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#424242]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4CAF50]" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Description */}
          {cab.full_description && (
            <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#212121]">About This Cab</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#616161]">
                {cab.full_description}
              </p>
            </section>
          )}

          {/* Support */}
          <div className="rounded-xl border border-dashed border-[#FDBA74] bg-orange-50/50 p-4">
            <p className="text-[13px] font-bold text-[#1a1a1a]">Need help choosing?</p>
            <p className="mt-0.5 text-[11px] text-[#757575]">
              Our team is available 24/7 — reach us on WhatsApp or call directly.
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={siteWhatsAppChatUrl(`Hi, I need help booking a cab: ${cab.name} from ${pickupCity} to ${dropCity}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a
                href={siteTelHref()}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs font-bold text-[#424242]"
              >
                <Phone className="h-3.5 w-3.5" /> Call us
              </a>
            </div>
          </div>
        </div>

        {/* ── Right sidebar (sticky) ─────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-sm">

            {/* Route header */}
            <div className="border-b border-[#EEE] bg-[#FAFAFA] px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#212121]">
                <MapPin className="h-4 w-4 text-[#EF6614]" strokeWidth={2} />
                {pickupCity || "—"}
                <ArrowRight className="h-3.5 w-3.5 text-[#9E9E9E]" />
                {dropCity || "—"}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-[#757575]">
                <span>{tripType.replace(/_/g, " ")}</span>
                {travelLabel.main !== "—" && <span>{travelLabel.main}</span>}
                {returnLabel && <span>Return: {returnLabel.main}</span>}
                <span>{passengers} passenger{passengers !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Fare breakdown */}
            {fare ? (
              <div className="space-y-2 px-4 py-4 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#616161]">Distance</span>
                  <span className="font-medium text-[#212121]">
                    {fare.actual_km} km {fare.billed_km !== fare.actual_km ? `(billed: ${fare.billed_km} km)` : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#616161]">Rate</span>
                  <span className="font-medium text-[#212121]">₹{fare.per_km_selling}/km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#616161]">Trip fare</span>
                  <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.trip_fare)}</span>
                </div>
                {fare.driver_allowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#616161]">Driver allowance</span>
                    <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.driver_allowance)}</span>
                  </div>
                )}
                {fare.night_charge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#616161]">Night charge</span>
                    <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.night_charge)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#616161]">GST ({fare.gst_rate}%)</span>
                  <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.gst_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-[#EEE] pt-2">
                  <span className="text-[14px] font-bold text-[#212121]">Total</span>
                  <span className="text-[18px] font-bold text-[#EF6614]">
                    ₹{formatInrAmount(fare.total_amount)}
                  </span>
                </div>
                <p className="text-[10px] text-[#9E9E9E]">
                  Tolls, parking & state permits extra (paid directly)
                </p>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[#757575]">
                {pickupCity && dropCity
                  ? "Calculating fare…"
                  : "Search a route to see fare breakdown"}
              </div>
            )}

            {/* Book Now CTA */}
            <div className="border-t border-[#EEE] px-4 pb-4 pt-3">
              <a
                href={bookHref}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-bold text-white transition",
                  fare
                    ? "bg-[#EF6614] hover:bg-[#E65100]"
                    : "pointer-events-none bg-[#BDBDBD]",
                )}
              >
                Book Now →
              </a>
              <p className="mt-2 text-center text-[10px] text-[#9E9E9E]">
                Free cancellation up to 24 hours before pickup
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}