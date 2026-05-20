"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Bell,
  Car,
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
import type { HotelListing } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type AmenityItem = {
  label: string;
  icon: LucideIcon;
};

const DETAIL_AMENITIES: AmenityItem[] = [
  { label: "Restaurant", icon: Utensils },
  { label: "Gym", icon: Dumbbell },
  { label: "Spa", icon: Sparkles },
  { label: "Bar", icon: Wine },
  { label: "Free Wi-Fi", icon: Wifi },
  { label: "Newspaper", icon: Newspaper },
  { label: "Parking", icon: ParkingCircle },
  { label: "Luggage Storage", icon: Shirt },
  { label: "Heater-on request", icon: Thermometer },
  { label: "Front Desk", icon: Bell },
  { label: "Ironing facilities", icon: Shirt },
  { label: "Room service", icon: Bell },
  { label: "Doctor on call", icon: Stethoscope },
  { label: "Travel Desk", icon: MapPin },
  { label: "Central AC", icon: Thermometer },
  { label: "Fire Extinguishers", icon: Flame },
  { label: "Paid Pick up/drop", icon: Car },
  { label: "CCTV", icon: Video },
  { label: "Coffee Shop", icon: Coffee },
  { label: "Elevator", icon: ArrowUpDown },
  { label: "Massage Centre", icon: Sparkles },
  { label: "Games Room", icon: Gamepad2 },
  { label: "Laundry", icon: Shirt },
  { label: "Taxi service", icon: Car },
  { label: "Airport Transfer", icon: Plane },
];

type HotelDetailAmenitiesGridProps = {
  hotel: HotelListing;
  className?: string;
};

export function HotelDetailAmenitiesGrid({ hotel, className }: HotelDetailAmenitiesGridProps) {
  const extra =
    hotel.amenityMoreCount > 0
      ? [{ label: `+ ${hotel.amenityMoreCount} more amenities`, icon: Sparkles }]
      : [];

  const items = [...DETAIL_AMENITIES, ...extra];

  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Amenities</h2>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2 text-[12px] text-[#424242] sm:text-[13px]">
              <Icon className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={1.75} aria-hidden />
              <span className="leading-snug">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
