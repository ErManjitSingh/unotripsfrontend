"use client";

import Image from "next/image";
import { Check, ThumbsUp } from "lucide-react";
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

function RoomAmenitiesList({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="mt-3 border-t border-[#eee] pt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#757575]">Room amenities</p>
      <ul className="mt-2 space-y-1">
        {amenities.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-[12px] text-[#424242]">
            <Check className="h-3 w-3 shrink-0 text-[#2E7D32]" strokeWidth={2.5} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MealPlanColumn({ plan, isLastPlan }: { plan: HotelRoomRatePlan; isLastPlan?: boolean }) {
  return (
    <div
      className={cn(
        "p-4 sm:border-r sm:border-[#eee]",
        !isLastPlan && "border-b border-dashed border-[#ccc]",
      )}
    >
      <p className="text-[13px] font-bold text-[#212121]">{plan.packageName}</p>
      <ul className="mt-2 space-y-1.5">
        {plan.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12px] leading-snug text-[#424242]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2E7D32]" strokeWidth={2.5} aria-hidden />
            {b}
          </li>
        ))}
      </ul>
      {plan.mealAddOn > 0 ? (
        <p className="mt-2 text-[11px] text-[#757575]">
          Meal add-on: +₹{formatInrAmount(plan.mealAddOn)}/night on room rate
        </p>
      ) : null}
    </div>
  );
}

function PriceColumn({
  plan,
  hotel,
  city,
  roomTypeId,
  bookingContext,
  isLastPlan,
}: {
  plan: HotelRoomRatePlan;
  hotel: HotelListing;
  city: HotelCity;
  roomTypeId: string;
  bookingContext?: HotelBookingQueryParams;
  isLastPlan?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col p-4 sm:min-h-[160px]",
        !isLastPlan && "border-b border-dashed border-[#ccc]",
      )}
    >
      {plan.showBestValueBadge ? (
        <span
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-[#212121] shadow-sm"
          title="Best value"
        >
          <ThumbsUp className="h-4 w-4 fill-current" aria-hidden />
        </span>
      ) : null}

      {plan.discountAmount > 0 ? (
        <p className="rounded-sm bg-[#e8f5e9] px-2 py-1 text-[11px] font-semibold text-[#2E7D32]">
          Book Now and Get Rs. {formatInrAmount(plan.discountAmount)} Off
        </p>
      ) : null}

      <div className={cn("flex-1 sm:pr-12", plan.discountAmount > 0 ? "mt-3" : "mt-0")}>
        {plan.originalPrice > plan.price ? (
          <p className="text-[12px] text-[#9E9E9E] line-through">₹ {formatInrAmount(plan.originalPrice)}</p>
        ) : null}
        <p className="text-2xl font-bold text-[#212121]">₹ {formatInrAmount(plan.price)}</p>
        {plan.mealAddOn > 0 ? (
          <p className="mt-1 text-[11px] text-[#616161]">
            Room ₹{formatInrAmount(plan.roomBasePrice)} + Meals ₹{formatInrAmount(plan.mealAddOn)}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-[#616161]">Room rate only</p>
        )}
        <p className="mt-1 text-[11px] leading-relaxed text-[#757575]">
          + ₹{formatInrAmount(plan.taxes)} taxes &amp; fees (per night)
        </p>
      </div>

      <Link
        href={hotelBookingHref(city.slug, hotelListingKey(hotel), roomTypeId, plan.id, bookingContext)}
        className="mt-4 flex w-full max-w-[200px] items-center justify-center rounded-md bg-[#EF6614] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E65100] sm:min-w-[140px]"
      >
        Book Now
      </Link>

      <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#2E7D32]">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        {plan.couponCode} Coupon applied
      </p>
    </div>
  );
}

function RoomInfoColumn({
  roomType,
  onRoomPhotoClick,
  showTitle = true,
}: {
  roomType: HotelRoomType;
  onRoomPhotoClick?: (imageSrc: string) => void;
  showTitle?: boolean;
}) {
  const amenities = roomType.amenities ?? [];

  return (
    <>
      {showTitle ? (
        <p className="text-base font-bold leading-snug text-[#212121] lg:text-lg">{roomType.name}</p>
      ) : null}
      {roomType.description ? (
        <p className={cn("text-[12px] leading-relaxed text-[#616161]", showTitle ? "mt-1.5" : "")}>
          {roomType.description}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => onRoomPhotoClick?.(roomType.image)}
        className="relative mt-3 aspect-[4/3] w-full max-w-[240px] cursor-zoom-in overflow-hidden rounded-md bg-neutral-100 sm:max-w-none"
      >
        <Image src={roomType.image} alt={roomType.name} fill unoptimized className="object-cover" sizes="220px" />
      </button>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {roomType.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-[#90caf9] bg-[#e3f2fd] px-2 py-0.5 text-[11px] font-medium text-[#1565C0]"
          >
            {tag}
          </span>
        ))}
      </div>
      <RoomAmenitiesList amenities={amenities} />
    </>
  );
}

function RoomBlockHeader({
  roomType,
  roomIndex,
}: {
  roomType: HotelRoomType;
  roomIndex: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3">
      <span className="rounded bg-[#EF6614] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Room {roomIndex}
      </span>
      <h3 className="text-[15px] font-bold text-[#212121] sm:text-base">{roomType.name}</h3>
      {roomType.availableCount != null && roomType.availableCount > 0 ? (
        <span className="text-[11px] font-medium text-[#2E7D32]">{roomType.availableCount} available</span>
      ) : null}
    </div>
  );
}

function RoomTypeBlock({
  roomType,
  hotel,
  city,
  bookingContext,
  onRoomPhotoClick,
  roomIndex,
}: {
  roomType: HotelRoomType;
  hotel: HotelListing;
  city: HotelCity;
  bookingContext?: HotelBookingQueryParams;
  onRoomPhotoClick?: (imageSrc: string) => void;
  roomIndex: number;
}) {
  const rowSpan = roomType.ratePlans.length;
  const planCount = roomType.ratePlans.length;

  return (
    <article
      className="overflow-hidden rounded-xl border border-[#d0d0d0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      aria-label={`${roomType.name} — ${planCount} meal plan${planCount === 1 ? "" : "s"}`}
    >
      <RoomBlockHeader roomType={roomType} roomIndex={roomIndex} />

      <div className="sm:hidden">
        <div className="border-b border-[#eee] bg-[#fafafa] p-4">
          <RoomInfoColumn roomType={roomType} onRoomPhotoClick={onRoomPhotoClick} showTitle={false} />
        </div>
        {roomType.ratePlans.map((plan, planIdx) => (
          <div
            key={plan.id}
            className={cn(
              "grid grid-cols-1",
              planIdx < planCount - 1 && "border-b border-dashed border-[#ccc]",
            )}
          >
            <MealPlanColumn plan={plan} isLastPlan={planIdx === planCount - 1} />
            <PriceColumn
              plan={plan}
              hotel={hotel}
              city={city}
              roomTypeId={roomType.id}
              bookingContext={bookingContext}
              isLastPlan={planIdx === planCount - 1}
            />
          </div>
        ))}
      </div>

      <div
        className="hidden sm:grid sm:grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)]"
        style={{ gridTemplateRows: `repeat(${rowSpan}, minmax(0, auto))` }}
      >
        <div
          className="flex flex-col border-r border-[#e0e0e0] bg-[#fafafa] p-4"
          style={{ gridRow: `1 / span ${rowSpan}` }}
        >
          <RoomInfoColumn roomType={roomType} onRoomPhotoClick={onRoomPhotoClick} showTitle={false} />
        </div>

        {roomType.ratePlans.map((plan, planIdx) => (
          <div key={plan.id} className="contents">
            <MealPlanColumn plan={plan} isLastPlan={planIdx === planCount - 1} />
            <PriceColumn
              plan={plan}
              hotel={hotel}
              city={city}
              roomTypeId={roomType.id}
              bookingContext={bookingContext}
              isLastPlan={planIdx === planCount - 1}
            />
          </div>
        ))}
      </div>
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
      <div className="hidden grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)] rounded-t-lg bg-[#faebe3] text-[13px] font-bold text-[#212121] sm:grid">
        <div className="border-r border-[#f0d9d0] px-4 py-3">Room Type</div>
        <div className="border-r border-[#f0d9d0] px-4 py-3">Meal Plan</div>
        <div className="px-4 py-3">Per Night Price</div>
      </div>

      <div className="mt-5 space-y-6 sm:mt-6 sm:space-y-8">
        {roomTypes.map((roomType, index) => (
          <RoomTypeBlock
            key={roomType.id}
            roomType={roomType}
            hotel={hotel}
            city={city}
            bookingContext={bookingContext}
            onRoomPhotoClick={onRoomPhotoClick}
            roomIndex={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
