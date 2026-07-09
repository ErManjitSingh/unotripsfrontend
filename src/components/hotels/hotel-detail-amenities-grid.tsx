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

type AmenityCategory = {
  label: string;
  chipClass: string;
  iconClass: string;
  match: (key: string) => boolean;
};

const CATEGORIES: AmenityCategory[] = [
  {
    label: "Food & Dining",
    chipClass: "border-[#c8e6c9] bg-[#f1f8f1] text-[#2E7D32]",
    iconClass: "text-[#2E7D32]",
    match: (k) => /restaurant|dining|food|bar|lounge|coffee|caf|room service/.test(k),
  },
  {
    label: "Recreation",
    chipClass: "border-[#bbdefb] bg-[#e8f4fd] text-[#1565C0]",
    iconClass: "text-[#1565C0]",
    match: (k) => /gym|fitness|spa|massage|pool|game|sport/.test(k),
  },
  {
    label: "Connectivity",
    chipClass: "border-[#f0d8c8] bg-[#fdf5ef] text-[#c94e0a]",
    iconClass: "text-[#EF6614]",
    match: (k) => /wifi|wi-fi|internet|tv|cable/.test(k),
  },
  {
    label: "Services",
    chipClass: "border-[#e0e0e0] bg-[#fafafa] text-[#424242]",
    iconClass: "text-[#757575]",
    match: () => true, // catch-all
  },
];

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

  // Group amenities
  const grouped: { category: AmenityCategory; items: string[] }[] = CATEGORIES.map((cat) => ({
    category: cat,
    items: [],
  }));

  for (const label of unique) {
    const key = label.toLowerCase();
    let placed = false;
    for (const group of grouped) {
      if (group.category.match(key) && group.category.label !== "Services") {
        group.items.push(label);
        placed = true;
        break;
      }
    }
    if (!placed) {
      grouped[grouped.length - 1]!.items.push(label);
    }
  }

  const nonEmpty = grouped.filter((g) => g.items.length > 0);

  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Amenities</h2>
      <p className="mt-1 text-[12px] text-[#757575]">
        {unique.length} amenit{unique.length === 1 ? "y" : "ies"} from property &amp; room listings
      </p>

      <div className="mt-5 space-y-5">
        {nonEmpty.map(({ category, items }) => (
          <div key={category.label}>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9E9E9E]">{category.label}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((label) => {
                const Icon = amenityIcon(label);
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] sm:text-[13px]",
                      category.chipClass,
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", category.iconClass)} strokeWidth={1.75} aria-hidden />
                    <span className="leading-snug">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
