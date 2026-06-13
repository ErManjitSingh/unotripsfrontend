"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
} from "lucide-react";
import Link from "next/link";
import {
  hotelBookingHref,
  hotelListingKey,
  type HotelBookingQueryParams,
  type HotelCity,
  type HotelListing,
  type HotelRoomRatePlan,
  type HotelRoomType,
} from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RoomSelection = {
  roomName: string;
  planName: string;
  planCode: string;
  roomPrice: number;
  extraTotal: number;
  taxes: number;
  totalPerNight: number;
  discountAmount: number;
  couponCode: string;
  extras: Record<ExtraKey, number>;
  bookingHref: string;
};

type HotelDetailRoomsTableProps = {
  city: HotelCity;
  hotel: HotelListing;
  roomTypes?: HotelRoomType[];
  bookingContext?: HotelBookingQueryParams;
  onRoomPhotoClick?: (imageSrc: string) => void;
  onRoomSelect?: (selection: RoomSelection | null) => void;
  className?: string;
};

// ── Extra options (fixed prices — backend doesn't store these yet) ─────────────

const EXTRA_OPTIONS = [
  { key: "extraBed",   label: "Extra Bed",   sub: "For additional guest", price: 800 },
  { key: "cabService", label: "Cab Service", sub: "Airport / station pickup", price: 500 },
] as const;

type ExtraKey = typeof EXTRA_OPTIONS[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function lowestNightlyPrice(plans: HotelRoomRatePlan[]): number {
  if (!plans.length) return 0;
  return Math.min(...plans.map((p) => p.price));
}

function getPlanCode(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return "EP";
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return "CP";
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner") && !n.includes("lunch"))) return "MAP";
  if (n.includes("(ap)") || n.includes("full board") || (n.includes("lunch") && n.includes("dinner"))) return "AP";
  return name.slice(0, 3).toUpperCase();
}

function getMealLabel(plan: HotelRoomRatePlan): string {
  const n = plan.packageName.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return "Room Only";
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return "Room + Breakfast";
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner") && !n.includes("lunch"))) return "Breakfast + Dinner";
  if (n.includes("full board") || n.includes("(ap)") || (n.includes("lunch") && n.includes("dinner"))) return "Breakfast + Lunch + Dinner";
  return plan.benefits.join(", ");
}

const CODE_COLOR: Record<string, string> = {
  EP:  "text-[#2196F3]",
  CP:  "text-[#4CAF50]",
  MAP: "text-[#9C27B0]",
  AP:  "text-[#FF9800]",
};

// ── RoomTypeCard ──────────────────────────────────────────────────────────────

function RoomTypeCard({
  roomType,
  hotel,
  city,
  bookingContext,
  onRoomPhotoClick,
  onRoomSelect,
  roomIndex,
  isExpanded,
  onToggle,
}: {
  roomType: HotelRoomType;
  hotel: HotelListing;
  city: HotelCity;
  bookingContext?: HotelBookingQueryParams;
  onRoomPhotoClick?: (imageSrc: string) => void;
  onRoomSelect?: (selection: RoomSelection | null) => void;
  roomIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(roomType.ratePlans[0]?.id ?? "");
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [cabPickup, setCabPickup]   = useState("");
  const [cabDrop, setCabDrop]       = useState("");
  const [cabAdded, setCabAdded]     = useState(false);
  const [extras, setExtras] = useState<Record<ExtraKey, number>>({
    extraBed: 0, cabService: 0,
  });

  const selectedPlan = useMemo(
    () => roomType.ratePlans.find((p) => p.id === selectedPlanId) ?? roomType.ratePlans[0],
    [roomType.ratePlans, selectedPlanId],
  );

  const extraTotal = useMemo(
    () => EXTRA_OPTIONS.reduce((sum, o) => sum + (extras[o.key] ?? 0) * o.price, 0),
    [extras],
  );

  const fromPrice  = lowestNightlyPrice(roomType.ratePlans);
  const amenities  = roomType.amenities ?? [];
  const totalBase  = selectedPlan ? selectedPlan.price + extraTotal : 0;
  const totalTaxes = Math.round(totalBase * 0.12);

  const changeExtra = (key: ExtraKey, delta: number) =>
    setExtras((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }));

  // Notify parent of current selection
  useEffect(() => {
    if (!isExpanded || !selectedPlan) { onRoomSelect?.(null); return; }
    const href = hotelBookingHref(
      city.slug, hotelListingKey(hotel), roomType.id, selectedPlan.id, bookingContext,
    );
    onRoomSelect?.({
      roomName: roomType.name,
      planName: selectedPlan.packageName,
      planCode: getPlanCode(selectedPlan.packageName),
      roomPrice: selectedPlan.price,
      extraTotal,
      taxes: totalTaxes,
      totalPerNight: totalBase + totalTaxes,
      discountAmount: selectedPlan.discountAmount,
      couponCode: selectedPlan.couponCode,
      extras,
      bookingHref: href,
    });
  }, [isExpanded, selectedPlan, extraTotal, totalBase, totalTaxes]);

  const bookingHref = selectedPlan
    ? hotelBookingHref(city.slug, hotelListingKey(hotel), roomType.id, selectedPlan.id, bookingContext)
    : "#";

  return (
    <article className={cn(
      "overflow-hidden rounded-xl border bg-white shadow-sm transition-all",
      isExpanded ? "border-[#EF6614]" : "border-[#d5d5d5]",
    )}>

      {/* ── COLLAPSED HEADER (always visible) ─────────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
      >
        {/* Thumbnail */}
        <div
          className="relative h-16 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-lg bg-neutral-100 sm:h-20 sm:w-28"
          onClick={(e) => { e.stopPropagation(); onRoomPhotoClick?.(roomType.image); }}
        >
          <Image src={roomType.image} alt={roomType.name} fill unoptimized className="object-cover" sizes="112px" />
        </div>

        {/* Name + tags + amenities */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-[#EF6614] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Room {roomIndex}
            </span>
            {roomType.availableCount != null && roomType.availableCount > 0 && (
              <span className="text-[11px] font-semibold text-[#2E7D32]">{roomType.availableCount} left</span>
            )}
          </div>
          <p className="mt-0.5 text-[15px] font-bold text-[#212121]">{roomType.name}</p>
          <p className="mt-0.5 text-[11px] text-[#757575]">
            {roomType.tags.join(" • ")}
            {amenities.length > 0 && ` • ${amenities.slice(0, 3).join(" • ")}`}
            {amenities.length > 3 && ` +${amenities.length - 3} more`}
          </p>
        </div>

        {/* Price + chevron */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9E9E9E]">From</p>
          <p className="text-[18px] font-bold text-[#212121]">₹ {formatInrAmount(fromPrice)}</p>
          <p className="text-[10px] text-[#9E9E9E]">per night</p>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#EF6614]">
            {isExpanded ? (
              <>Close <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Select <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </span>
        </div>
      </button>

      {/* ── EXPANDED: 70/30 two-column layout ─────────────────────────── */}
      {isExpanded && selectedPlan && (
        <div className="border-t border-[#eee]">
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT 70% — Room configuration ──────────────────────── */}
            <div className="flex-1 space-y-3 p-3 lg:border-r lg:border-[#eee]">

              {/* Meal Plans */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#757575]">Meal Plan</p>
                <div className="flex flex-wrap gap-2">
                  {roomType.ratePlans.map((plan) => {
                    const code    = getPlanCode(plan.packageName);
                    const sel     = plan.id === selectedPlanId;
                    const color   = CODE_COLOR[code] ?? "text-[#212121]";
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={cn(
                          "relative flex min-w-[90px] flex-col items-center rounded-xl border px-3 py-2.5 text-center transition",
                          sel
                            ? "border-[#EF6614] bg-[#fff8f3] ring-1 ring-[#EF6614]"
                            : "border-[#e0e0e0] bg-white hover:border-[#EF6614]/40",
                        )}
                      >
                        {sel && (
                          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF6614]">
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                        <span className={cn("text-[15px] font-bold", color)}>{code}</span>
                        <span className="mt-0.5 text-[10px] leading-tight text-[#757575]">{getMealLabel(plan)}</span>
                        <span className="mt-1.5 text-[13px] font-bold text-[#212121]">₹ {formatInrAmount(plan.price)}</span>
                        <span className="text-[10px] text-[#9E9E9E]">per night</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra Options — collapsible */}
              <div className="rounded-lg border border-[#e8e8e8]">
                <button
                  type="button"
                  onClick={() => setExtrasOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-[#424242]">Extra Options</p>
                    {extraTotal > 0 && (
                      <span className="rounded-full bg-[#EF6614] px-2 py-0.5 text-[10px] font-bold text-white">
                        +₹{formatInrAmount(extraTotal)}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-[#9E9E9E] transition-transform", extrasOpen && "rotate-180")} />
                </button>
                {extrasOpen && (
                  <div className="divide-y divide-[#f0f0f0] border-t border-[#e8e8e8]">

                    {/* Extra Bed — simple counter */}
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div>
                        <p className="text-[12px] font-semibold text-[#212121]">Extra Bed</p>
                        <p className="text-[10px] text-[#9E9E9E]">For additional guest · ₹800/night</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeExtra("extraBed", -1)}
                          disabled={extras["extraBed"] === 0}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d5d5d5] text-[#424242] transition disabled:opacity-30 hover:border-[#EF6614] hover:text-[#EF6614]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-[12px] font-bold text-[#212121]">{extras["extraBed"]}</span>
                        <button
                          type="button"
                          onClick={() => changeExtra("extraBed", 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d5d5d5] text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Cab Service — pickup/drop form */}
                    <div className="px-3 py-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[12px] font-semibold text-[#212121]">Cab Service</p>
                          <p className="text-[10px] text-[#9E9E9E]">One-way transfer · ₹500 flat</p>
                        </div>
                        {cabAdded && (
                          <button
                            type="button"
                            onClick={() => {
                              setCabAdded(false);
                              setCabPickup("");
                              setCabDrop("");
                              setExtras((prev) => ({ ...prev, cabService: 0 }));
                            }}
                            className="text-[11px] font-semibold text-[#e53935] hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {!cabAdded ? (
                        <>
                          <div className="space-y-1.5">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#2E7D32]" />
                              <input
                                type="text"
                                value={cabPickup}
                                onChange={(e) => setCabPickup(e.target.value)}
                                placeholder="Pickup point"
                                className="w-full rounded-md border border-[#e0e0e0] py-2 pl-7 pr-3 text-[12px] outline-none focus:border-[#EF6614]"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#e53935]" />
                              <input
                                type="text"
                                value={cabDrop}
                                onChange={(e) => setCabDrop(e.target.value)}
                                placeholder="Drop point"
                                className="w-full rounded-md border border-[#e0e0e0] py-2 pl-7 pr-3 text-[12px] outline-none focus:border-[#EF6614]"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!cabPickup.trim() || !cabDrop.trim()}
                            onClick={() => {
                              setCabAdded(true);
                              setExtras((prev) => ({ ...prev, cabService: 1 }));
                            }}
                            className="w-full rounded-md bg-[#EF6614] py-1.5 text-[12px] font-bold text-white transition hover:bg-[#E65100] disabled:opacity-40"
                          >
                            Add Cab — ₹500
                          </button>
                        </>
                      ) : (
                        <div className="rounded-md bg-[#e8f5e9] px-3 py-2 text-[11px] text-[#2E7D32]">
                          <p className="font-semibold">✓ Cab added</p>
                          <p className="mt-0.5 text-[#424242]">📍 {cabPickup} → {cabDrop}</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Coupon bar */}
              {selectedPlan.couponCode && (
                <div className="flex items-center justify-between rounded-lg bg-[#e8f5e9] px-4 py-2.5">
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-[#2E7D32]">
                    <Tag className="h-3.5 w-3.5" aria-hidden />
                    {selectedPlan.couponCode} coupon applied
                  </span>
                  {selectedPlan.discountAmount > 0 && (
                    <span className="text-[12px] font-bold text-[#2E7D32]">
                      You Save ₹ {formatInrAmount(selectedPlan.discountAmount)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT 30% — Booking Summary ────────────────────────── */}
            <div className="w-full shrink-0 bg-[#f9f9f9] p-3 lg:w-[260px] xl:w-[280px]">
              <p className="mb-3 text-[13px] font-bold text-[#212121]">Booking Summary</p>

              <div className="space-y-2.5 text-[12px]">
                {/* Selected room */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[#9E9E9E]">Selected Room</p>
                    <p className="font-semibold text-[#212121]">{roomType.name}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-[#212121]">₹ {formatInrAmount(selectedPlan.price)}</p>
                </div>

                {/* Meal plan */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[#9E9E9E]">Meal Plan</p>
                    <p className="font-semibold text-[#212121]">{getPlanCode(selectedPlan.packageName)} — {getMealLabel(selectedPlan)}</p>
                  </div>
                </div>

                {/* Extras if any */}
                {extras["extraBed"] > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#9E9E9E]">Extra Bed ({extras["extraBed"]})</p>
                    <p className="font-semibold text-[#212121]">₹ {formatInrAmount(800 * extras["extraBed"])}</p>
                  </div>
                )}
                {cabAdded && (
                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[#9E9E9E]">Cab Service</p>
                      <p className="font-semibold text-[#212121]">₹ 500</p>
                    </div>
                    <p className="text-[10px] text-[#9E9E9E] leading-tight">📍 {cabPickup} → {cabDrop}</p>
                  </div>
                )}
              </div>

              {/* Divider + price breakdown */}
              <div className="my-3 border-t border-[#e0e0e0]" />

              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#757575]">Room Price</span>
                  <span className="font-medium text-[#212121]">₹ {formatInrAmount(selectedPlan.price)}</span>
                </div>
                {extraTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#757575]">Extra Charges</span>
                    <span className="font-medium text-[#212121]">₹ {formatInrAmount(extraTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#757575]">Taxes &amp; Fees</span>
                  <span className="font-medium text-[#212121]">₹ {formatInrAmount(totalTaxes)}</span>
                </div>
              </div>

              <div className="my-3 border-t border-[#e0e0e0]" />

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#212121]">Total / Night</span>
                <span className="text-[17px] font-bold text-[#EF6614]">₹ {formatInrAmount(totalBase + totalTaxes)}</span>
              </div>

              {selectedPlan.discountAmount > 0 && (
                <p className="mt-1 text-right text-[11px] font-semibold text-[#2E7D32]">
                  You Save ₹ {formatInrAmount(selectedPlan.discountAmount)}
                </p>
              )}

              <Link
                href={bookingHref}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF6614] py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#E65100]"
              >
                Continue Booking
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-1.5 text-center text-[10px] text-[#9E9E9E]">🔒 Secure Booking</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function HotelDetailRoomsTable({
  city,
  hotel,
  roomTypes: roomTypesProp,
  bookingContext,
  onRoomPhotoClick,
  onRoomSelect,
  className,
}: HotelDetailRoomsTableProps) {
  const roomTypes = roomTypesProp ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(
    roomTypes.length === 1 ? (roomTypes[0]?.id ?? null) : null,
  );

  if (roomTypes.length === 0) {
    return (
      <div className={cn("rounded-lg border border-[#e0e0e0] bg-white p-8 text-center", className)}>
        <p className="font-semibold text-[#212121]">No rooms available</p>
        <p className="mt-1 text-sm text-[#757575]">Room rates are not listed right now. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 p-3 sm:p-4", className)}>
      <p className="text-[12px] text-[#757575]">
        Select a room to expand — choose your meal plan and extras, price updates instantly.
      </p>
      {roomTypes.map((roomType, index) => (
        <RoomTypeCard
          key={roomType.id}
          roomType={roomType}
          hotel={hotel}
          city={city}
          bookingContext={bookingContext}
          onRoomPhotoClick={onRoomPhotoClick}
          onRoomSelect={onRoomSelect}
          roomIndex={index + 1}
          isExpanded={expandedId === roomType.id}
          onToggle={() => setExpandedId((cur) => (cur === roomType.id ? null : roomType.id))}
        />
      ))}
    </div>
  );
}