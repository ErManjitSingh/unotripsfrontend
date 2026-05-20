"use client";

import { HotelDetailAbout } from "@/components/hotels/hotel-detail-about";
import { HotelDetailAmenitiesGrid } from "@/components/hotels/hotel-detail-amenities-grid";
import { HotelDetailBookingPolicy } from "@/components/hotels/hotel-detail-booking-policy";
import { HotelDetailReviews } from "@/components/hotels/hotel-detail-reviews";
import { HotelDetailRoomsTable } from "@/components/hotels/hotel-detail-rooms-table";
import type { HotelBookingQueryParams, HotelCity, HotelListing, HotelRoomType } from "@/lib/hotels-catalog";
import type { ApiReview } from "@/lib/hotels-api";
import { cn } from "@/lib/utils";

export type HotelDetailTabId =
  | "rooms"
  | "overview"
  | "amenities"
  | "location"
  | "policy"
  | "reviews";

const TABS: { id: HotelDetailTabId; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "overview", label: "Overview" },
  { id: "amenities", label: "Amenities" },
  { id: "location", label: "Location" },
  { id: "policy", label: "Booking Policy" },
  { id: "reviews", label: "Guest Rating" },
];

type HotelDetailTabsProps = {
  hotel: HotelListing;
  city: HotelCity;
  roomTypes?: HotelRoomType[];
  bookingContext?: HotelBookingQueryParams;
  policies?: string[];
  apiReviews?: ApiReview[];
  className?: string;
  activeTab: HotelDetailTabId;
  onTabChange: (tab: HotelDetailTabId) => void;
  onRoomPhotoClick?: (imageSrc: string) => void;
};

export function HotelDetailTabs({
  hotel,
  city,
  roomTypes,
  bookingContext,
  policies,
  apiReviews,
  activeTab,
  onTabChange,
  onRoomPhotoClick,
  className,
}: HotelDetailTabsProps) {
  return (
    <div id="hotel-tabs" className={cn("scroll-mt-24", className)}>
      <div className="overflow-x-auto rounded-t-lg border border-b-0 border-[#e0e0e0] bg-white shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max px-2 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors sm:px-5 sm:text-sm",
                activeTab === tab.id
                  ? "border-[#212121] font-bold text-[#212121]"
                  : "border-transparent text-[#757575] hover:text-[#212121]",
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-b-lg border border-t-0 border-[#e0e0e0] bg-white p-0 shadow-sm">
        {activeTab === "rooms" ? (
          <HotelDetailRoomsTable
            city={city}
            hotel={hotel}
            roomTypes={roomTypes}
            bookingContext={bookingContext}
            onRoomPhotoClick={onRoomPhotoClick}
            className="rounded-none border-0 shadow-none"
          />
        ) : null}
        {activeTab === "overview" ? <HotelDetailAbout hotel={hotel} city={city} /> : null}
        {activeTab === "amenities" ? <HotelDetailAmenitiesGrid hotel={hotel} /> : null}
        {activeTab === "policy" ? (
          <HotelDetailBookingPolicy
            hotel={hotel}
            policies={policies}
            className="rounded-none border-0 shadow-none"
          />
        ) : null}
        {activeTab === "reviews" ? (
          <HotelDetailReviews
            hotel={hotel}
            apiReviews={apiReviews}
            className="rounded-none border-0 shadow-none"
          />
        ) : null}
        {activeTab === "location" ? <TabPlaceholder tab={activeTab} hotel={hotel} city={city} /> : null}
      </div>
    </div>
  );
}

function TabPlaceholder({
  tab,
  hotel,
  city,
}: {
  tab: Exclude<HotelDetailTabId, "rooms" | "overview" | "amenities" | "policy" | "reviews">;
  hotel: HotelListing;
  city: HotelCity;
}) {
  const copy: Record<typeof tab, string> = {
    location: `${hotel.address || `${city.name}, ${hotel.state}`}. ${hotel.nearbyLandmark}. Use the map above for directions and nearby points of interest.`,
  };

  return (
    <div className="p-5 sm:p-6">
      <p className="text-[14px] leading-relaxed text-[#424242]">{copy[tab]}</p>
    </div>
  );
}
