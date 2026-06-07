"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Bell,
  Car,
  Check,
  Coffee,
  Dumbbell,
  Flame,
  Gamepad2,
  MapPin,
  Newspaper,
  ParkingCircle,
  Plane,
  Shirt,
  Sparkles,
  Stethoscope,
  Thermometer,
  Utensils,
  Video,
  Wifi,
  Wine,
} from "lucide-react";
import type { HotelListing, HotelRoomType } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

function amenityIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (/wifi|wi-fi|internet/.test(key)) return Wifi;
  if (/park/.test(key)) return ParkingCircle;
  if (/restaurant|dining|food/.test(key)) return Utensils;
  if (/gym|fitness/.test(key)) return Dumbbell;
  if (/spa|massage/.test(key)) return Sparkles;
  if (/bar|lounge/.test(key)) return Wine;
  if (/coffee|caf/.test(key)) return Coffee;
  if (/laundry|iron/.test(key)) return Shirt;
  if (/doctor|medical/.test(key)) return Stethoscope;
  if (/ac|air.?condition|heater|therm/.test(key)) return Thermometer;
  if (/lift|elevator/.test(key)) return ArrowUpDown;
  if (/cctv|camera|security/.test(key)) return Video;
  if (/fire/.test(key)) return Flame;
  if (/game/.test(key)) return Gamepad2;
  if (/taxi|transfer|car|pick/.test(key)) return Car;
  if (/airport|plane/.test(key)) return Plane;
  if (/desk|reception|front/.test(key)) return Bell;
  if (/travel|tour|map/.test(key)) return MapPin;
  if (/news/.test(key)) return Newspaper;
  if (/room service|service/.test(key)) return Bell;
  return Check;
}

function titleCaseAmenity(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

type HotelDetailAmenitiesGridProps = {
  hotel: HotelListing;
  roomTypes?: HotelRoomType[];
  className?: string;
};

export function HotelDetailAmenitiesGrid({ hotel, roomTypes, className }: HotelDetailAmenitiesGridProps) {
  const roomAmenities = (roomTypes ?? []).flatMap((r) => r.amenities ?? []);
  const combined = [...hotel.amenities, ...roomAmenities].map(titleCaseAmenity);
  const unique = [...new Set(combined.filter(Boolean))];

  if (unique.length === 0) {
    return (
      <div className={cn("p-5 sm:p-6", className)}>
        <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Amenities</h2>
        <p className="mt-4 text-[13px] text-[#757575]">Amenity details for this property are not listed yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Amenities</h2>
      <p className="mt-1 text-[12px] text-[#757575]">
        {unique.length} amenit{unique.length === 1 ? "y" : "ies"} from property &amp; room listings
      </p>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {unique.map((label) => {
          const Icon = amenityIcon(label);
          return (
            <div key={label} className="flex items-center gap-2 text-[12px] text-[#424242] sm:text-[13px]">
              <Icon className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={1.75} aria-hidden />
              <span className="leading-snug">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
