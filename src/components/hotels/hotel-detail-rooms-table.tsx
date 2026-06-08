"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp, Coffee, ThumbsUp, Utensils } from "lucide-react";
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

type HotelDetailRoomsTableProps = {
  city: HotelCity;
  hotel: HotelListing;
  roomTypes?: HotelRoomType[];
  bookingContext?: HotelBookingQueryParams;
  onRoomPhotoClick?: (imageSrc: string) => void;
  className?: string;
};

function lowestNightlyPrice(plans: HotelRoomRatePlan[]): number {
  if (plans.length === 0) return 0;
  return Math.min(...plans.map((p) => p.price));
}

function mealPlanIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("breakfast") && !n.includes("board")) return Coffee;
  if (n.includes("room only")) return Check;
  return Utensils;
}

function MealPlanPicker({
  plans,
  selectedId,
  onSelect,
}: {
  plans: HotelRoomRatePlan[];
  selectedId: string;
  onSelect: (planId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#757575]">Choose your meal plan</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {plans.map((plan) => {
          const Icon = mealPlanIcon(plan.packageName);
          const selected = selectedId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={cn(
                "relative rounded-lg border p-3 text-left transition",
                selected
                  ? "border-[#EF6614] bg-[#fff8f3] ring-1 ring-[#EF6614]"
                  : "border-[#e0e0e0] bg-white hover:border-[#EF6614]/40",
              )}
            >
              {plan.showBestValueBadge ? (
                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC107] text-[#212121]">
                  <ThumbsUp className="h-3.5 w-3.5 fill-current" aria-hidden />
                </span>
              ) : null}
              <div className="flex items-start gap-2 pr-8">
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    selected ? "border-[#EF6614] bg-[#EF6614]" : "border-[#bdbdbd]",
                  )}
                >
                  {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#212121]">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#EF6614]" aria-hidden />
                    {plan.packageName}
                  </p>
                  <ul className="mt-1.5 space-y-0.5">
                    {plan.benefits.map((b) => (
                      <li key={b} className="text-[11px] leading-snug text-[#616161]">
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[12px] font-bold text-[#EF6614]">
                    {plan.mealAddOn > 0
                      ? `+ ₹${formatInrAmount(plan.mealAddOn)}/night on room`
                      : "Room rate only — no meals"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PriceSummary({
  plan,
  hotel,
  city,
  roomTypeId,
  bookingContext,
}: {
  plan: HotelRoomRatePlan;
  hotel: HotelListing;
  city: HotelCity;
  roomTypeId: string;
  bookingContext?: HotelBookingQueryParams;
}) {
  return (
    <div className="rounded-lg border border-[#eee] bg-[#fafafa] p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {plan.discountAmount > 0 ? (
            <p className="mb-1 inline-block rounded-sm bg-[#e8f5e9] px-2 py-0.5 text-[11px] font-semibold text-[#2E7D32]">
              Save ₹{formatInrAmount(plan.discountAmount)}/night
            </p>
          ) : null}
          {plan.originalPrice > plan.price ? (
            <p className="text-[12px] text-[#9E9E9E] line-through">₹ {formatInrAmount(plan.originalPrice)}</p>
          ) : null}
          <p className="text-2xl font-bold text-[#212121]">₹ {formatInrAmount(plan.price)}</p>
          <p className="mt-1 text-[11px] text-[#616161]">
            {plan.mealAddOn > 0
              ? `Room ₹${formatInrAmount(plan.roomBasePrice)} + Meals ₹${formatInrAmount(plan.mealAddOn)}`
              : "Room rate only"}
            {" · "}
            + ₹{formatInrAmount(plan.taxes)} taxes/night
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#2E7D32]">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            {plan.couponCode} coupon applied
          </p>
        </div>

        <Link
          href={hotelBookingHref(city.slug, hotelListingKey(hotel), roomTypeId, plan.id, bookingContext)}
          className="inline-flex min-w-[160px] items-center justify-center rounded-md bg-[#EF6614] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E65100]"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

function RoomTypeCard({
  roomType,
  hotel,
  city,
  bookingContext,
  onRoomPhotoClick,
  roomIndex,
  isExpanded,
  onToggle,
}: {
  roomType: HotelRoomType;
  hotel: HotelListing;
  city: HotelCity;
  bookingContext?: HotelBookingQueryParams;
  onRoomPhotoClick?: (imageSrc: string) => void;
  roomIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(roomType.ratePlans[0]?.id ?? "");

  const selectedPlan = useMemo(
    () => roomType.ratePlans.find((p) => p.id === selectedPlanId) ?? roomType.ratePlans[0],
    [roomType.ratePlans, selectedPlanId],
  );

  const fromPrice = lowestNightlyPrice(roomType.ratePlans);
  const amenities = roomType.amenities ?? [];
  const previewAmenities = amenities.slice(0, 3);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition",
        isExpanded ? "border-[#EF6614]" : "border-[#d0d0d0]",
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => onRoomPhotoClick?.(roomType.image)}
          className="relative aspect-[4/3] w-full shrink-0 cursor-zoom-in overflow-hidden rounded-lg bg-neutral-100 sm:h-24 sm:w-32 sm:aspect-auto"
        >
          <Image src={roomType.image} alt={roomType.name} fill unoptimized className="object-cover" sizes="128px" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-[#EF6614] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Room {roomIndex}
            </span>
            {roomType.availableCount != null && roomType.availableCount > 0 ? (
              <span className="text-[11px] font-medium text-[#2E7D32]">{roomType.availableCount} left</span>
            ) : null}
          </div>
          <h3 className="mt-1 text-base font-bold text-[#212121]">{roomType.name}</h3>
          {roomType.description && !isExpanded ? (
            <p className="mt-0.5 line-clamp-2 text-[12px] text-[#616161]">{roomType.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roomType.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[#90caf9] bg-[#e3f2fd] px-2 py-0.5 text-[10px] font-medium text-[#1565C0]"
              >
                {tag}
              </span>
            ))}
          </div>
          {!isExpanded && previewAmenities.length > 0 ? (
            <p className="mt-2 text-[11px] text-[#757575]">
              {previewAmenities.join(" · ")}
              {amenities.length > 3 ? ` +${amenities.length - 3} more` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">From</p>
            <p className="text-xl font-bold text-[#212121]">₹ {formatInrAmount(fromPrice)}</p>
            <p className="text-[10px] text-[#757575]">per night</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-4 py-2.5 text-sm font-bold transition-colors",
              isExpanded
                ? "border border-[#e0e0e0] bg-white text-[#424242] hover:bg-[#f5f5f5]"
                : "bg-[#EF6614] text-white hover:bg-[#E65100]",
            )}
          >
            {isExpanded ? (
              <>
                Close
                <ChevronUp className="h-4 w-4" aria-hidden />
              </>
            ) : (
              <>
                Select room
                <ChevronDown className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && selectedPlan ? (
        <div className="space-y-4 border-t border-[#eee] bg-[#fafafa] p-4">
          {roomType.description ? (
            <p className="text-[12px] leading-relaxed text-[#616161]">{roomType.description}</p>
          ) : null}

          {amenities.length > 0 ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#757575]">Room amenities</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {amenities.map((item) => (
                  <li key={item} className="flex items-center gap-1 text-[12px] text-[#424242]">
                    <Check className="h-3 w-3 shrink-0 text-[#2E7D32]" strokeWidth={2.5} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <MealPlanPicker
            plans={roomType.ratePlans}
            selectedId={selectedPlanId}
            onSelect={setSelectedPlanId}
          />

          <PriceSummary
            plan={selectedPlan}
            hotel={hotel}
            city={city}
            roomTypeId={roomType.id}
            bookingContext={bookingContext}
          />
        </div>
      ) : null}
    </article>
  );
}

export function HotelDetailRoomsTable({
  city,
  hotel,
  roomTypes: roomTypesProp,
  bookingContext,
  onRoomPhotoClick,
  className,
}: HotelDetailRoomsTableProps) {
  const roomTypes = roomTypesProp ?? [];
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(
    roomTypes.length === 1 ? roomTypes[0]?.id ?? null : null,
  );

  if (roomTypes.length === 0) {
    return (
      <div className={cn("rounded-lg border border-[#e0e0e0] bg-white p-8 text-center", className)}>
        <p className="font-semibold text-[#212121]">No rooms available</p>
        <p className="mt-1 text-sm text-[#757575]">
          Room rates for this property are not listed right now. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-3 sm:p-4", className)}>
      <p className="mb-4 text-sm text-[#616161]">
        Select a room, then choose breakfast / lunch / dinner options — price updates instantly.
      </p>

      <div className="space-y-4">
        {roomTypes.map((roomType, index) => (
          <RoomTypeCard
            key={roomType.id}
            roomType={roomType}
            hotel={hotel}
            city={city}
            bookingContext={bookingContext}
            onRoomPhotoClick={onRoomPhotoClick}
            roomIndex={index + 1}
            isExpanded={expandedRoomId === roomType.id}
            onToggle={() =>
              setExpandedRoomId((current) => (current === roomType.id ? null : roomType.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
