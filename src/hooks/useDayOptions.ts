"use client";

/**
 * src/hooks/useDayOptions.ts
 *
 * Fetches and caches the consolidated day-options response
 * from GET /v1/packages/{slug}/day-options.
 *
 * Provides:
 *   - All hotel/cab pools per day (grouped)
 *   - Sightseeing spots per day
 *   - Activities per day
 *   - Trip-level add-ons
 *   - Package pricing config (base_price, token_type, etc.)
 *
 * Falls back to demo data from package-customizer-data.ts if:
 *   - API returns empty hotel_groups / cab_options (package not configured yet)
 *   - Network error
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiData } from "@/lib/api";
import { searchHotels, type HotelListing } from "@/lib/hotels-api";
import {
  DEMO_HOTELS, DEMO_CABS, DEMO_ADDONS,
  type DestinationHotels, type CabOption, type AddonOption,
} from "@/lib/package-customizer-data";

// ── API shapes (mirror backend PackageDayOptionsOut) ─────────────────────────

export type DaySightseeing = {
  id:                      string;
  name:                    string;
  location:                string | null;
  description:             string | null;
  image_url:               string | null;
  duration:                string | null;
  entry_fee:               number;
  price_per_person:        number;
  price_type:              "per_person" | "per_group" | "included";
  is_included:             boolean;
  is_optional:             boolean;
  is_selected_by_default:  boolean;
  seasonal_note:           string | null;
};

export type DayActivity = {
  id:                      string;
  link_id:                 string;
  name:                    string;
  short_description:       string | null;
  category:                string | null;
  difficulty_level:        string;
  duration:                string | null;
  age_limit:               string | null;
  featured_image:          string | null;
  tags:                    string[];
  price:                   number;
  price_type:              "per_person" | "per_group" | "per_vehicle";
  original_price:          number;
  has_override:            boolean;
  is_optional:             boolean;
  is_selected_by_default:  boolean;
  seasonal_note:           string | null;
  sort_order:              number;
};

export type DayOption = {
  day_number:    number;
  title:         string;
  location:      string;
  // Optional: the backend omits these entirely for packages where
  // hotels/cabs haven't been configured yet (not just an empty array).
  hotel_options?: Array<{
    id: string; name: string; stars: number; description: string;
    image_url: string | null; price_delta: number;
    is_default: boolean; is_popular: boolean; dest_name?: string; dest_nights?: number;
    room_type?: string; max_guests?: number; extra_bed_price?: number;
    meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
    meal_prices?: { breakfast: number; lunch: number; dinner: number };
  }>;
  sightseeing:  DaySightseeing[];
  activities:   DayActivity[];
};

export type DayOptionsData = {
  package_id:       string;
  base_price:       number;
  token_type:       string;
  token_amount:     number;
  balance_due_days: number;
  is_customizable:  boolean;
  days:             DayOption[];
  stays?: Array<{
    id: string;
    destination_city: string;
    sort_order?: number;
    nights: number;
    is_active?: boolean;
    default_hotel_id?: string | null;
    default_hotel_name?: string | null;
    default_room_type_name?: string | null;
    default_meal_plan?: string | null;
    hotel_options?: Array<{
      id: string;
      hotel_id: string;
      hotel_name: string;
      default_room_type_name?: string | null;
      sort_order?: number;
      upgrade_price?: number;
      image_url?: string | null;
    }>;
  }>;
  // Trip-level, not per-day — mirrors backend PackageDayOptionsOut.cabs
  // (package_cab_options table). day-level "cab_options" is not a real
  // backend field; cabs cover all transfers for the whole trip.
  cabs: Array<{
    id: string; name: string; description: string | null; seats: number;
    image_url?: string | null; price_delta: number; is_default: boolean; is_popular: boolean; sort_order: number;
  }>;
  addons:           Array<{
    id: string; name: string; icon: string | null;
    description: string | null; price_per_person: number; is_default_on: boolean;
  }>;
};

/**
 * Frontend-only preview of the next package contract.
 *
 * This is deliberately opt-in via ?preview=new-data so the normal page keeps
 * using the live API response. It lets us validate the new top-level `stays`
 * shape before the backend starts returning it.
 */
function addNewDataPreview(data: DayOptionsData): DayOptionsData {
  return {
    ...data,
    stays: [
      {
        id: "e9c67f91-3a83-4222-bc2b-ac954f3f8b75",
        destination_city: "Shimla",
        sort_order: 1,
        nights: 1,
        is_active: true,
        default_hotel_id: "5c92cae7-e7bf-4006-82d3-86f791927ba9",
        default_hotel_name: "CK International",
        default_room_type_name: "Deluxe",
        default_meal_plan: "map",
        hotel_options: [
          {
            id: "37449bc5-a869-4869-9ae5-eeac103667af",
            hotel_id: "5c92cae7-e7bf-4006-82d3-86f791927ba9",
            hotel_name: "CK International",
            default_room_type_name: "Deluxe",
            sort_order: 1,
            upgrade_price: 0,
          },
          {
            id: "6a5cd0dc-fd26-4e17-aa73-b7625648747f",
            hotel_id: "8f6ae0f6-da75-488c-ac67-ae3720c9a7b6",
            hotel_name: "DLS Hillcrest Resort Shimla",
            default_room_type_name: "Deluxe",
            sort_order: 2,
            upgrade_price: 4500,
          },
        ],
      },
      {
        id: "2a5c2062-80cb-4f64-a739-2cdb04305aeb",
        destination_city: "Shimla",
        sort_order: 2,
        nights: 2,
        is_active: true,
        default_hotel_id: "4270c240-8d70-4ec7-a88e-b06c735d3f58",
        default_hotel_name: "Hotel Himalayan Heights",
        default_room_type_name: "Deluxe",
        default_meal_plan: "map",
        hotel_options: [
          {
            id: "28e02454-d456-479b-95e3-f957e90f70b2",
            hotel_id: "4270c240-8d70-4ec7-a88e-b06c735d3f58",
            hotel_name: "Hotel Himalayan Heights",
            default_room_type_name: "Deluxe",
            sort_order: 1,
            upgrade_price: 0,
          },
          {
            id: "c91fc8b5-6666-4284-9d4b-31b83e80c880",
            hotel_id: "5020d30d-277c-48e7-91c8-da0f92f49595",
            hotel_name: "Hotel De Park Shimla",
            default_room_type_name: "Luxury Room",
            sort_order: 2,
            upgrade_price: 7000,
          },
        ],
      },
    ],
  };
}

/** Resolve package hotel ids against the existing Hotels API. */
async function attachHotelDetails(data: DayOptionsData): Promise<DayOptionsData> {
  if (!data.stays?.length) return data;

  const cities = [...new Set(data.stays.map((stay) => stay.destination_city).filter(Boolean))];
  const results = await Promise.all(cities.map(async (city) => {
    try {
      const result = await searchHotels({ city, page: 1, limit: 50, sort: "popular" });
      return [city, result.hotels] as const;
    } catch {
      return [city, [] as HotelListing[]] as const;
    }
  }));
  const hotelsByCity = new Map(results);

  return {
    ...data,
    stays: data.stays.map((stay) => {
      const hotels = hotelsByCity.get(stay.destination_city) ?? [];
      const byId = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      return {
        ...stay,
        hotel_options: stay.hotel_options?.map((option, index) => {
          const hotel = byId.get(option.hotel_id) ?? hotels[index];
          return {
            ...option,
            image_url: option.image_url ?? hotel?.images?.[0] ?? null,
          };
        }),
      };
    }),
  };
}

// ── Derived data ──────────────────────────────────────────────────────────────

function buildHotelGroups(days: DayOption[]): DestinationHotels[] {
  const groups: DestinationHotels[] = [];
  let lastKey: string | null = null;

  for (const day of days) {
    const hotelOptions = day.hotel_options ?? [];
    if (!hotelOptions.length) { lastKey = null; continue; }

    // The backend mints a fresh option id per day even for the identical
    // hotel, and rarely fills in dest_name — so id-based or dest_name-based
    // grouping alone under-merges. Prefer dest_name when the backend gives
    // it; otherwise treat consecutive days offering the exact same set of
    // hotel names as one continuous stay. Nights = counted real days, never
    // a separate dest_nights summary field (which may be missing/stale).
    const key = hotelOptions[0]?.dest_name ?? hotelOptions.map((h) => h.name).sort().join("|");

    if (key === lastKey && groups.length > 0) {
      groups[groups.length - 1]!.nights += 1;
      continue;
    }

    const destName = hotelOptions[0]?.dest_name || day.location?.trim() || `Stop ${day.day_number}`;
    groups.push({
      dest:   destName,
      nights: 1,
      opts:   hotelOptions.map((h) => ({
        id:            h.id,
        name:          h.name,
        stars:         h.stars,
        desc:          h.description,
        img:           h.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70",
        extra:         h.price_delta,
        pop:           h.is_popular,
        roomType:      h.room_type || undefined,
        maxGuests:     h.max_guests,
        extraBedPrice: h.extra_bed_price,
        mealsIncluded: h.meals
          ? (["breakfast", "lunch", "dinner"] as const)
              .filter((m) => h.meals![m])
              .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
          : [],
      })),
    });
    lastKey = key;
  }

  return groups;
}

function buildHotelGroupsFromStays(stays: NonNullable<DayOptionsData["stays"]>): DestinationHotels[] {
  return stays
    .filter((stay) => stay.is_active !== false && (stay.hotel_options?.length ?? 0) > 0)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((stay) => {
      const options = [...(stay.hotel_options ?? [])].sort((a, b) => {
        const aDefault = a.hotel_id === stay.default_hotel_id ? 0 : 1;
        const bDefault = b.hotel_id === stay.default_hotel_id ? 0 : 1;
        return aDefault - bDefault || (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
      return {
        dest: stay.destination_city,
        nights: stay.nights,
        opts: options.map((hotel, index) => ({
          id: hotel.id,
          name: hotel.hotel_name,
          desc: hotel.default_room_type_name || stay.default_room_type_name || "Comfortable stay",
          stars: 3,
          extra: hotel.upgrade_price ?? 0,
          pop: hotel.hotel_id === stay.default_hotel_id || index === 0,
          img: hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
          roomType: hotel.default_room_type_name || stay.default_room_type_name || undefined,
          mealsIncluded: stay.default_meal_plan ? [stay.default_meal_plan.toUpperCase()] : [],
        })),
      };
    });
}

function buildCabOptions(cabs: DayOptionsData["cabs"]): CabOption[] {
  return [...cabs].sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.sort_order - b.sort_order).map((c) => ({
    id:    c.id,
    name:  c.name,
    desc:  c.description ?? "",
    seats: c.seats,
    extra: c.price_delta,
    pop:   c.is_popular,
    img:   c.image_url ?? undefined,
  }));
}

function buildAddonOptions(
  addons: DayOptionsData["addons"],
): AddonOption[] {
  return addons.map((a) => ({
    id:    a.id,
    name:  a.name,
    icon:  a.icon ?? "ShieldCheck",
    note:  a.description ?? "",
    price: a.price_per_person,
    on:    a.is_default_on,
  }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDayOptions(slug: string) {
  const previewEnabled = typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("preview") === "new-data";
  const query = useQuery({
    queryKey: ["packages", "day-options", slug, previewEnabled ? "new-data-preview" : "live"],
    queryFn:  async () => {
      const data = await apiData<DayOptionsData>(
        `/v1/packages/${encodeURIComponent(slug)}/day-options`,
      );
      const previewData = previewEnabled && slug === "test-packages" ? addNewDataPreview(data) : data;
      return attachHotelDetails(previewData);
    },
    staleTime:   5 * 60 * 1000,  // 5 min — matches backend cache TTL
    gcTime:      10 * 60 * 1000,
    retry:       2,
    enabled:     Boolean(slug),
  });

  const data = query.data;

  // ── Stable derived values via useMemo ─────────────────────────────────────
  // WITHOUT useMemo, buildHotelGroups/buildCabOptions/buildAddonOptions run on
  // every render and return NEW array references even when data hasn't changed.
  // This causes useEffect([hotelGroups]), useEffect([addonOptions]),
  // useEffect([days]) in PackageDetailView to fire on every render → infinite loop.
  // useMemo ensures references only change when query.data actually changes.

  const hotelGroups = useMemo(
    () => (data?.stays?.length ? buildHotelGroupsFromStays(data.stays) : data?.days?.length ? buildHotelGroups(data.days) : []),
    [data],
  );

  const cabOptions = useMemo(
    () => (data?.cabs?.length ? buildCabOptions(data.cabs) : []),
    [data],
  );

  const addonOptions = useMemo(
    () => (data?.addons?.length ? buildAddonOptions(data.addons) : []),
    [data],
  );

  const days = useMemo(() => data?.days ?? [], [data]);

  // Use real data if available, else fall back to demo data
  const hasRealHotels = hotelGroups.length > 0;
  const hasRealCabs   = cabOptions.length > 0;
  const hasRealAddons = addonOptions.length > 0;

  return {
    isLoading:    query.isLoading,
    isError:      query.isError,
    raw:          data,
    hotelGroups:  hasRealHotels ? hotelGroups : DEMO_HOTELS,
    cabOptions:   hasRealCabs   ? cabOptions  : DEMO_CABS,
    addonOptions: hasRealAddons ? addonOptions : DEMO_ADDONS,
    usingDemo:    !hasRealHotels && !hasRealCabs,
    days,
    basePrice:    data?.base_price ?? 9500,
    tokenType:    data?.token_type ?? "percent",
    tokenAmount:  data?.token_amount ?? 40,
    balanceDays:  data?.balance_due_days ?? 7,
  };
}
