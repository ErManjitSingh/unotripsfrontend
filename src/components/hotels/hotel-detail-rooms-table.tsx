"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  Lock,
  ShieldCheck,
  Tag,
  Utensils,
  UtensilsCrossed,
  BedDouble,
  Users,
  Calendar,
  Maximize2,
  Wifi,
  Tv,
  Wind,
  ShowerHead,
  Percent,
  PlusCircle,
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
  taxes: number;
  totalPerNight: number;
  discountAmount: number;
  couponCode: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function lowestNightlyPrice(plans: HotelRoomRatePlan[]): number {
  if (!plans.length) return 0;
  return Math.min(...plans.map((p) => p.price));
}

function nightCount(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(`${checkOut}T12:00:00`).getTime() - new Date(`${checkIn}T12:00:00`).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function getMealLabel(plan: HotelRoomRatePlan): string {
  const n = plan.packageName.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return "Room Only";
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return "Breakfast Included";
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner") && !n.includes("lunch"))) return "Breakfast + Dinner";
  if (n.includes("full board") || n.includes("(ap)") || (n.includes("lunch") && n.includes("dinner"))) return "All Meals Included";
  return plan.packageName;
}

function getMealDescription(plan: HotelRoomRatePlan): string {
  const n = plan.packageName.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return "No meals included";
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return "Daily breakfast included";
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner") && !n.includes("lunch"))) return "Breakfast & dinner included";
  if (n.includes("full board") || n.includes("(ap)") || (n.includes("lunch") && n.includes("dinner"))) return "All meals included";
  return plan.benefits.join(", ");
}

function MealIcon({ plan, className }: { plan: HotelRoomRatePlan; className?: string }) {
  const n = plan.packageName.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return <BedDouble className={className} />;
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return <Coffee className={className} />;
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner"))) return <Utensils className={className} />;
  return <UtensilsCrossed className={className} />;
}

function formatDateShort(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  const date = new Date(y, m - 1, d, 12);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function parseRoomSpecs(tags: string[]): { bed?: string; size?: string; view?: string; smoking?: string } {
  const bed   = tags.find(t => /bed|suite|studio/i.test(t));
  const size  = tags.find(t => /sq\s?ft|sq\s?m|sqft|sqm/i.test(t));
  const view  = tags.find(t => /view|facing|overlook/i.test(t));
  const smoking = tags.find(t => /smok/i.test(t));
  return { bed, size, view, smoking };
}

type AmenityGroup = { label: string; icon: React.ReactNode; items: string[] };

function groupAmenities(amenities: string[]): AmenityGroup[] {
  const groups: (AmenityGroup & { keywords: string[] })[] = [
    { label: "Bedroom",        icon: <BedDouble   className="h-3.5 w-3.5" />, keywords: ["bed","pillow","blanket","wardrobe","closet","safe","iron","curtain","mirror","linen"], items: [] },
    { label: "Bathroom",       icon: <ShowerHead  className="h-3.5 w-3.5" />, keywords: ["bath","shower","toilet","towel","hair","soap","shampoo","tub","hygiene","toiletries"], items: [] },
    { label: "Entertainment",  icon: <Tv          className="h-3.5 w-3.5" />, keywords: ["tv","television","wifi","wi-fi","internet","phone","streaming","channel","music"], items: [] },
    { label: "Comfort",        icon: <Wind        className="h-3.5 w-3.5" />, keywords: ["ac","air conditi","heating","fan","temperature","climate","balcony","terrace"], items: [] },
    { label: "Food & Drink",   icon: <Coffee      className="h-3.5 w-3.5" />, keywords: ["minibar","coffee","tea","kettle","fridge","refriger","room service","dining"], items: [] },
  ];
  amenities.forEach(a => {
    const lower = a.toLowerCase();
    const matched = groups.find(g => g.keywords.some(k => lower.includes(k)));
    if (matched) matched.items.push(a);
    else groups[0].items.push(a);
  });
  return groups.filter(g => g.items.length > 0);
}

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
  const [showFullDescription, setShowFullDescription] = useState(false);

  const selectedPlan = useMemo(
    () => roomType.ratePlans.find((p) => p.id === selectedPlanId) ?? roomType.ratePlans[0],
    [roomType.ratePlans, selectedPlanId],
  );

  const fromPrice    = lowestNightlyPrice(roomType.ratePlans);
  const amenities    = roomType.amenities ?? [];
  const nights       = nightCount(bookingContext?.check_in, bookingContext?.check_out);
  const roomsCount   = bookingContext?.rooms ?? 1;
  const pricePerNight = selectedPlan ? selectedPlan.price : 0;
  const baseTotal    = pricePerNight * nights * roomsCount;
  const totalTaxes   = (selectedPlan ? selectedPlan.taxes : 0) * nights * roomsCount;
  const discountTotal = selectedPlan ? selectedPlan.discountAmount * nights * roomsCount : 0;
  const grandTotal   = (selectedPlan ? selectedPlan.total : 0) * nights * roomsCount - discountTotal;

  // Notify parent of current selection
  useEffect(() => {
    if (!isExpanded || !selectedPlan) { onRoomSelect?.(null); return; }
    const href = hotelBookingHref(
      city.slug, hotelListingKey(hotel), roomType.id, selectedPlan.id, bookingContext,
    );
    onRoomSelect?.({
      roomName: roomType.name,
      planName: selectedPlan.packageName,
      planCode: getMealLabel(selectedPlan),
      roomPrice: pricePerNight,
      taxes: totalTaxes,
      totalPerNight: grandTotal,
      discountAmount: selectedPlan.discountAmount * nights * roomsCount,
      couponCode: selectedPlan.couponCode,
      bookingHref: href,
    });
  }, [isExpanded, selectedPlan, baseTotal, totalTaxes, nights, roomsCount]);

  const bookingHref = selectedPlan
    ? hotelBookingHref(city.slug, hotelListingKey(hotel), roomType.id, selectedPlan.id, bookingContext)
    : "#";

  const specs        = parseRoomSpecs(roomType.tags);
  const amenityGroups = groupAmenities(amenities);
  const guests       = bookingContext?.guests ?? 2;
  const lowestOriginalPrice = Math.min(...roomType.ratePlans.map(p => p.originalPrice || p.price));
  const hasDiscount = lowestOriginalPrice > fromPrice;
  const discountPct = hasDiscount ? Math.round((1 - fromPrice / lowestOriginalPrice) * 100) : 0;
  // cheapest plan's total for collapsed header (API taxes + discount)
  const cheapestPlan = roomType.ratePlans.reduce((a, b) => a.price <= b.price ? a : b);
  const fromPriceTotal = nights > 1
    ? Math.round(fromPrice * nights * roomsCount + cheapestPlan.taxes * nights * roomsCount - cheapestPlan.discountAmount * nights * roomsCount)
    : fromPrice;

  return (
    <article className={cn(
      "overflow-hidden rounded-xl border bg-white transition-all",
      isExpanded ? "border-[#EF6614] shadow-[0_0_0_1px_#EF6614]" : "border-[#e0e0e0] shadow-sm hover:border-[#bbb] hover:shadow-md",
    )}>

      {/* ── ROOM HEADER ── */}
      <div className="flex flex-col gap-3 p-3 sm:flex-row">
        {/* Thumbnail */}
        <button
          type="button"
          onClick={() => onRoomPhotoClick?.(roomType.image)}
          className="relative h-[152px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[168px] sm:w-[252px]"
          tabIndex={-1}
        >
          <Image src={roomType.image} alt={roomType.name} fill unoptimized className="object-cover object-center transition-transform duration-500 hover:scale-105" sizes="(max-width: 640px) 100vw, 252px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          {roomType.availableCount != null && roomType.availableCount <= 5 && roomType.availableCount > 0 && (
            <span className="absolute bottom-2 left-2 rounded bg-[#c62828] px-1.5 py-0.5 text-[10px] font-bold text-white">
              Only {roomType.availableCount} left
            </span>
          )}
        </button>

        {/* Room info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-1 py-1.5 text-left sm:flex-row sm:items-start sm:gap-4 sm:px-2 sm:py-2">
          <div className="min-w-0 flex-1">
            {/* Top badges */}
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {roomIndex === 1 && (
                <span className="rounded-sm bg-[#EF6614] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Most Popular</span>
              )}
              {hasDiscount && discountPct >= 5 && (
                <span className="flex items-center gap-0.5 rounded-sm bg-[#e8f5e9] px-2 py-0.5 text-[9px] font-bold text-[#2E7D32]">
                  <Percent className="h-2.5 w-2.5" />{discountPct}% off
                </span>
              )}
              {hotel.freeCancellation && (
                <span className="rounded-sm border border-[#c8e6c9] bg-[#f1fdf3] px-2 py-0.5 text-[9px] font-bold text-[#2E7D32]">Free cancellation</span>
              )}
            </div>

            {/* Room name */}
            <p className="text-[18px] font-bold leading-snug text-[#1a1a1a]">{roomType.name}</p>

            {/* Key specs row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#616161]">
              {specs.bed && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 shrink-0 text-[#9E9E9E]" />
                  {specs.bed}
                </span>
              )}
              {specs.size && (
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[#9E9E9E]" />
                  {specs.size}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-[#9E9E9E]" />
                Sleeps {roomType.maxOccupancy}
              </span>
              {specs.view && (
                <span className="text-[#616161]">{specs.view}</span>
              )}
              {specs.smoking && (
                <span className="text-[#9E9E9E]">{specs.smoking}</span>
              )}
              {roomType.tags.filter(t => t !== specs.bed && t !== specs.size && t !== specs.view && t !== specs.smoking).slice(0, 2).map(t => (
                <span key={t} className="text-[#616161]">{t}</span>
              ))}
            </div>

            {/* Description */}
            {roomType.description && (
              <div className="mt-1.5 hidden sm:block">
                <p className={cn(
                  "text-[12px] leading-relaxed text-[#757575]",
                  !showFullDescription && "line-clamp-3",
                )}>
                  {roomType.description}
                </p>
                {roomType.description.length > 220 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription((value) => !value)}
                    className="mt-1 text-[11px] font-bold text-[#EF6614] hover:underline"
                  >
                    {showFullDescription ? "Read less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* Amenity chips */}
            {amenities.length > 0 && (
              <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
                {amenities.slice(0, 6).map(a => (
                  <span key={a} className="flex items-center gap-1 rounded bg-[#f5f5f5] px-2 py-0.5 text-[10px] text-[#424242]">
                    <Check className="h-2.5 w-2.5 shrink-0 text-[#2E7D32]" strokeWidth={3} />
                    {a}
                  </span>
                ))}
                {amenities.length > 6 && (
                  <span className="rounded bg-[#f5f5f5] px-2 py-0.5 text-[10px] text-[#9E9E9E]">+{amenities.length - 6} more</span>
                )}
              </div>
            )}

            {/* Extra bed */}
            {roomType.extraBedPrice != null && (
              <p className="mt-1.5 hidden items-center gap-1.5 text-[11px] text-[#757575] sm:flex">
                <PlusCircle className="h-3.5 w-3.5 shrink-0 text-[#9E9E9E]" />
                Extra bed available · ₹{formatInrAmount(roomType.extraBedPrice)}/night
              </p>
            )}
          </div>

          {/* Pricing + expand */}
          <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-[#f1f1f1] pt-3 text-left sm:block sm:w-auto sm:border-0 sm:pt-0 sm:text-right">
            {hasDiscount && (
              <p className="text-[11px] text-[#9E9E9E] line-through">
                ₹{formatInrAmount(nights > 1
                  ? Math.round(lowestOriginalPrice * nights * roomsCount + cheapestPlan.taxes * nights * roomsCount)
                  : lowestOriginalPrice
                )}
              </p>
            )}
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#9E9E9E]">
              {nights > 1 ? `${nights} nights from` : "Starts from"}
            </p>
            <p className="text-[22px] font-extrabold leading-tight text-[#1a1a1a]">
              ₹{formatInrAmount(fromPriceTotal)}
            </p>
            <p className="text-[10px] text-[#9E9E9E]">
              {nights > 1 ? `incl. taxes · ${roomsCount} room${roomsCount > 1 ? "s" : ""}` : "per night + taxes"}
            </p>
            <button type="button" onClick={onToggle} className={cn(
              "mt-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12px] font-bold transition sm:mt-2.5",
              isExpanded
                ? "border-[#EF6614] text-[#EF6614]"
                : "border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]"
            )}>
              {isExpanded ? <>Close <ChevronUp className="h-3.5 w-3.5" /></> : <>See options <ChevronDown className="h-3.5 w-3.5" /></>}
            </button>
          </div>
        </div>
      </div>

      {/* ── EXPANDED ─────────────────────────────────────────────────── */}
      {isExpanded && selectedPlan && (
        <div className="border-t border-[#f0f0f0]">
          <div className="flex flex-col xl:flex-row">

            {/* ── LEFT — Plan table + amenities ──────────────────────── */}
            <div className="flex-1 xl:border-r xl:border-[#f0f0f0]">

              {/* Column headers */}
              <div className="hidden grid-cols-[1fr_150px_150px_140px] gap-4 border-b border-[#f0f0f0] bg-[#f7f7f7] px-5 py-2.5 sm:grid">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Board Basis</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Cancellation</p>
                <p className="text-right text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Per Night</p>
                <p className="text-right text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">
                  {nights > 1 ? `Total (${nights} nights)` : "Total (incl. tax)"}
                </p>
              </div>

              {/* Plan rows */}
              <div className="divide-y divide-[#f5f5f5]">
                {roomType.ratePlans.map((plan) => {
                  const sel = plan.id === selectedPlanId;
                  const planTaxes = plan.taxes * nights * roomsCount;
                  const planGrandTotal = plan.total * nights * roomsCount - (plan.discountAmount * nights * roomsCount);
                  const planDiscPct = plan.originalPrice > plan.price
                    ? Math.round((1 - plan.price / plan.originalPrice) * 100)
                    : 0;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 px-3 py-2.5 text-left transition sm:grid-cols-[1fr_150px_150px_140px] sm:items-start sm:gap-4 sm:px-5 sm:py-4",
                        sel ? "bg-[#fff8f3]" : "bg-white hover:bg-[#fafafa]",
                      )}
                    >
                      {/* Board + benefits */}
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition",
                          sel ? "border-[#EF6614] bg-[#EF6614]" : "border-[#ccc] bg-white",
                        )}>
                          {sel && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <MealIcon plan={plan} className={cn("h-3.5 w-3.5 shrink-0", sel ? "text-[#EF6614]" : "text-[#9E9E9E]")} />
                            <p className={cn("text-[13px] font-bold", sel ? "text-[#EF6614]" : "text-[#1a1a1a]")}>
                              {getMealLabel(plan)}
                            </p>
                            {plan.showBestValueBadge && (
                              <span className="rounded-sm bg-[#003580] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Best Value</span>
                            )}
                            {planDiscPct >= 5 && (
                              <span className="rounded-sm bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold text-[#92400e]">{planDiscPct}% off</span>
                            )}
                            {plan.couponCode && (
                              <span className="flex items-center gap-1 rounded-sm bg-[#e8f5e9] px-1.5 py-0.5 text-[9px] font-bold text-[#2E7D32]">
                                <Tag className="h-2.5 w-2.5" />{plan.couponCode}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#757575]">{getMealDescription(plan)}</p>
                          {plan.benefits.length > 0 && (
                          <ul className="mt-1.5 hidden space-y-0.5 sm:block">
                              {plan.benefits.slice(0, 4).map(b => (
                                <li key={b} className="flex items-center gap-1.5 text-[11px] text-[#424242]">
                                  <Check className="h-3 w-3 shrink-0 text-[#2E7D32]" strokeWidth={2.5} />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Cancellation */}
                      <div className="hidden pl-7 sm:block sm:pl-0">
                        {plan.nonRefundable ? (
                          <>
                            <p className="text-[12px] font-semibold text-[#c62828]">Non-refundable</p>
                            <p className="mt-0.5 text-[10px] text-[#9E9E9E]">No refund on cancellation</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[12px] font-semibold text-[#2E7D32]">Free cancellation</p>
                            <p className="mt-0.5 text-[10px] text-[#9E9E9E]">Cancel any time before check-in</p>
                          </>
                        )}
                      </div>

                      {/* Per-night price */}
                      <div className="pl-7 text-left sm:pl-0 sm:text-right">
                        {plan.originalPrice > plan.price && (
                          <p className="text-[11px] text-[#9E9E9E] line-through">₹{formatInrAmount(plan.originalPrice)}</p>
                        )}
                        <p className="text-[16px] font-extrabold text-[#1a1a1a]">₹{formatInrAmount(plan.price)}</p>
                        <p className="text-[10px] text-[#9E9E9E]">per room / night</p>
                        {plan.discountAmount > 0 && (
                          <p className="mt-0.5 text-[11px] font-semibold text-[#2E7D32]">
                            Save ₹{formatInrAmount(plan.discountAmount)}/nt
                          </p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="col-span-2 flex items-center justify-between border-t border-[#f5f5f5] pt-1.5 pl-7 text-left sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:pl-0 sm:text-right">
                        <p className="text-[18px] font-extrabold text-[#EF6614]">
                          ₹{formatInrAmount(planGrandTotal)}
                        </p>
                        <p className="text-[10px] text-[#9E9E9E]">incl. all taxes</p>
                        {roomsCount > 1 && (
                          <p className="text-[10px] text-[#9E9E9E]">{roomsCount} rooms</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Amenities section */}
              {amenityGroups.length > 0 && (
                <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-5 py-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E]">Room Amenities</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3">
                    {amenityGroups.map(group => (
                      <div key={group.label}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-[#424242]">
                          <span className="text-[#9E9E9E]">{group.icon}</span>
                          {group.label}
                        </div>
                        <ul className="space-y-0.5">
                          {group.items.slice(0, 5).map(item => (
                            <li key={item} className="flex items-center gap-1.5 text-[11px] text-[#616161]">
                              <Check className="h-2.5 w-2.5 shrink-0 text-[#2E7D32]" strokeWidth={3} />
                              {item}
                            </li>
                          ))}
                          {group.items.length > 5 && (
                            <li className="text-[11px] text-[#9E9E9E]">+{group.items.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {roomType.extraBedPrice != null && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-3 py-2">
                      <PlusCircle className="h-3.5 w-3.5 shrink-0 text-[#9E9E9E]" />
                      <p className="text-[12px] text-[#424242]">
                        Extra bed available on request · <span className="font-semibold">₹{formatInrAmount(roomType.extraBedPrice)}/night</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT — Booking summary panel ──────────────────────── */}
            <div className="w-full shrink-0 border-t border-[#f0f0f0] xl:w-[300px] xl:border-t-0">
              <div className="flex h-full flex-col divide-y divide-[#f0f0f0]">

                {/* Stay dates */}
                <div className="bg-[#f7f7f7] px-5 py-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E]">Your Stay</p>
                  <div className="flex items-stretch gap-3">
                    <div className="flex-1 rounded-lg border border-[#e8e8e8] bg-white px-3 py-2.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9E9E9E]">Check-in</p>
                      <p className="mt-0.5 text-[13px] font-bold text-[#1a1a1a]">{formatDateShort(bookingContext?.check_in)}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f0f0]">
                        <span className="text-[10px] font-bold text-[#757575]">{nights}N</span>
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg border border-[#e8e8e8] bg-white px-3 py-2.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9E9E9E]">Check-out</p>
                      <p className="mt-0.5 text-[13px] font-bold text-[#1a1a1a]">{formatDateShort(bookingContext?.check_out)}</p>
                    </div>
                  </div>

                  {/* Room, board, guests */}
                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#9E9E9E]">Room</span>
                      <span className="font-semibold text-[#1a1a1a]">{roomType.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#9E9E9E]">Board</span>
                      <span className="font-semibold text-[#1a1a1a]">{getMealLabel(selectedPlan)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#9E9E9E]">Guests</span>
                      <span className="font-semibold text-[#1a1a1a]">{guests} adult{guests !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#9E9E9E]">Rooms</span>
                      <span className="font-semibold text-[#1a1a1a]">{roomsCount}</span>
                    </div>
                  </div>
                </div>

                {/* What's included */}
                {selectedPlan.benefits.length > 0 && (
                  <div className="px-5 py-3.5">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E]">What&apos;s Included</p>
                    <ul className="space-y-1">
                      {selectedPlan.benefits.map(b => (
                        <li key={b} className="flex items-center gap-2 text-[12px] text-[#424242]">
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#2E7D32]" strokeWidth={2.5} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 px-5 py-4">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#757575]">
                      ₹{formatInrAmount(pricePerNight)} × {nights} nt{roomsCount > 1 ? ` × ${roomsCount} rooms` : ""}
                    </span>
                    <span className="font-medium text-[#1a1a1a]">₹{formatInrAmount(baseTotal)}</span>
                  </div>
                  {totalTaxes > 0 && (
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#757575]">Taxes &amp; fees</span>
                      <span className="font-medium text-[#1a1a1a]">₹{formatInrAmount(totalTaxes)}</span>
                    </div>
                  )}
                  {discountTotal > 0 && (
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#2E7D32]">Rate discount</span>
                      <span className="font-semibold text-[#2E7D32]">−₹{formatInrAmount(discountTotal)}</span>
                    </div>
                  )}
                </div>

                {/* Grand total + CTA */}
                <div className="px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-bold text-[#1a1a1a]">Total amount</p>
                    <p className="text-[24px] font-extrabold leading-none text-[#EF6614]">₹{formatInrAmount(grandTotal)}</p>
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-[#9E9E9E]">All taxes &amp; fees included</p>

                  <div className="mt-3">
                    {selectedPlan.nonRefundable ? (
                      <p className="text-[11px] font-semibold text-[#c2410c]">⚠ Non-refundable — no refund on cancellation</p>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#2E7D32]" strokeWidth={2.5} />
                        <p className="text-[12px] font-semibold text-[#2E7D32]">Free cancellation before check-in</p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={bookingHref}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#EF6614] py-4 text-[15px] font-extrabold text-white shadow-[0_4px_16px_rgba(239,102,20,0.4)] transition hover:bg-[#d95d10] active:scale-[0.98]"
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    Reserve This Room
                  </Link>
                  <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#9E9E9E]">
                    <Lock className="h-3 w-3" aria-hidden />
                    No payment charged at this step
                  </p>
                </div>

              </div>
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
