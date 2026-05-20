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

function isHighlightBenefit(text: string) {
  return /upgrade|complimentary room upgrade/i.test(text);
}

function BenefitsColumn({ plan }: { plan: HotelRoomRatePlan }) {
  return (
    <div className="border-b border-[#eee] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:border-[#eee]">
      <p className="text-[13px] font-bold text-[#212121]">{plan.packageName}</p>
      <ul className="mt-2 space-y-1.5">
        {plan.benefits.map((b) => (
          <li
            key={b}
            className={cn(
              "flex items-start gap-2 text-[12px] leading-snug",
              isHighlightBenefit(b) ? "font-medium text-[#1565C0]" : "text-[#424242]",
            )}
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2E7D32]" strokeWidth={2.5} aria-hidden />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriceColumn({
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
    <div className="relative flex flex-col border-b border-[#eee] p-4 last:border-b-0 sm:min-h-[180px]">
      {plan.showBestValueBadge ? (
        <span
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-[#212121] shadow-sm"
          title="Best value"
        >
          <ThumbsUp className="h-4 w-4 fill-current" aria-hidden />
        </span>
      ) : null}

      <p className="rounded-sm bg-[#e8f5e9] px-2 py-1 text-[11px] font-semibold text-[#2E7D32]">
        Book Now and Get Rs. {formatInrAmount(plan.discountAmount)} Off
      </p>

      <div className="mt-3 flex-1 sm:pr-12">
        <p className="text-[12px] text-[#9E9E9E] line-through">₹ {formatInrAmount(plan.originalPrice)}</p>
        <p className="text-2xl font-bold text-[#212121]">₹ {formatInrAmount(plan.price)}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#757575]">
          + ₹{formatInrAmount(plan.taxes)} Taxes &amp; fees
          <br />
          (Per Night)
          <br />
          {plan.nonRefundable ? "non-refundable booking" : null}
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
        {plan.couponCode} Coupon code is applied
      </p>
    </div>
  );
}

function RoomTypeBlock({
  roomType,
  hotel,
  city,
  bookingContext,
  onRoomPhotoClick,
}: {
  roomType: HotelRoomType;
  hotel: HotelListing;
  city: HotelCity;
  bookingContext?: HotelBookingQueryParams;
  onRoomPhotoClick?: (imageSrc: string) => void;
}) {
  const rowSpan = roomType.ratePlans.length;

  return (
    <div className="border-t border-[#e8e8e8] first:border-t-0">
      <div className="sm:hidden">
        <div className="border-b border-[#eee] bg-[#fafafa] p-4">
          <p className="text-base font-bold text-[#212121]">{roomType.name}</p>
          <button
            type="button"
            onClick={() => onRoomPhotoClick?.(roomType.image)}
            className="relative mt-3 aspect-[4/3] w-full max-w-[240px] cursor-zoom-in overflow-hidden rounded-md bg-neutral-100"
          >
            <Image src={roomType.image} alt={roomType.name} fill unoptimized className="object-cover" sizes="240px" />
          </button>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roomType.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[#90caf9] bg-[#e3f2fd] px-2 py-0.5 text-[11px] font-medium text-[#1565C0]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {roomType.ratePlans.map((plan) => (
          <div key={plan.id} className="grid grid-cols-1 border-b border-[#eee] last:border-b-0">
            <BenefitsColumn plan={plan} />
            <PriceColumn
              plan={plan}
              hotel={hotel}
              city={city}
              roomTypeId={roomType.id}
              bookingContext={bookingContext}
            />
          </div>
        ))}
      </div>

      <div
        className="hidden sm:grid sm:grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)]"
        style={{ gridTemplateRows: `repeat(${rowSpan}, minmax(0, auto))` }}
      >
        <div
          className="flex flex-col border-r border-[#eee] bg-white p-4"
          style={{ gridRow: `1 / span ${rowSpan}` }}
        >
          <p className="text-base font-bold leading-snug text-[#212121] lg:text-lg">{roomType.name}</p>
          <button
            type="button"
            onClick={() => onRoomPhotoClick?.(roomType.image)}
            className="relative mt-3 aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-md bg-neutral-100"
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
        </div>

        {roomType.ratePlans.map((plan) => (
          <div key={plan.id} className="contents">
            <BenefitsColumn plan={plan} />
            <PriceColumn
              plan={plan}
              hotel={hotel}
              city={city}
              roomTypeId={roomType.id}
              bookingContext={bookingContext}
            />
          </div>
        ))}
      </div>
    </div>
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
    <div className={cn("overflow-hidden bg-white", className)}>
      <div className="hidden grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)] bg-[#faebe3] text-[13px] font-bold text-[#212121] sm:grid">
        <div className="border-r border-[#f0d9d0] px-4 py-3">Room Type</div>
        <div className="border-r border-[#f0d9d0] px-4 py-3">Benefits</div>
        <div className="px-4 py-3">Per Night Price</div>
      </div>

      {roomTypes.map((roomType) => (
        <RoomTypeBlock
          key={roomType.id}
          roomType={roomType}
          hotel={hotel}
          city={city}
          bookingContext={bookingContext}
          onRoomPhotoClick={onRoomPhotoClick}
        />
      ))}
    </div>
  );
}
