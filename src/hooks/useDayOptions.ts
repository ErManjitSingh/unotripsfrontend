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
import { NEW_DATA_PREVIEW } from "@/lib/new-data-preview";
import {
  DEMO_HOTELS,
  DEMO_CABS,
  DEMO_ADDONS,
  type DestinationHotels,
  type CabOption,
  type AddonOption,
} from "@/lib/package-customizer-data";

// ── API shapes (mirror backend PackageDayOptionsOut) ─────────────────────────

export type DaySightseeing = {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  entry_fee: number;
  price_per_person: number;
  price_type: "per_person" | "per_group" | "included";
  is_included: boolean;
  is_optional: boolean;
  is_selected_by_default: boolean;
  seasonal_note: string | null;
};

export type DayActivity = {
  id: string;
  link_id: string;
  name: string;
  short_description: string | null;
  category: string | null;
  difficulty_level: string;
  duration: string | null;
  age_limit: string | null;
  featured_image: string | null;
  tags: string[];
  price: number;
  price_type: "per_person" | "per_group" | "per_vehicle";
  original_price: number;
  has_override: boolean;
  is_optional: boolean;
  is_selected_by_default: boolean;
  seasonal_note: string | null;
  sort_order: number;
};

export type DayOption = {
  day_number: number;
  title: string;
  location: string;
  day_image?: string | null;
  // Optional: the backend omits these entirely for packages where
  // hotels/cabs haven't been configured yet (not just an empty array).
  hotel_options?: Array<{
    id: string;
    name: string;
    stars: number;
    description: string;
    image_url: string | null;
    price_delta: number;
    is_default: boolean;
    is_popular: boolean;
    dest_name?: string;
    dest_nights?: number;
    room_type?: string;
    max_guests?: number;
    extra_bed_price?: number;
    meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
    meal_prices?: { breakfast: number; lunch: number; dinner: number };
  }>;
  sightseeing: DaySightseeing[];
  activities: DayActivity[];
};

export type DayOptionsData = {
  package_id: string;
  base_price: number;
  token_type: string;
  token_amount: number;
  balance_due_days: number;
  is_customizable: boolean;
  days: DayOption[];
  stays?: Array<{
    id: string;
    destination_city: string;
    sort_order?: number;
    nights: number;
    is_active?: boolean;
    default_hotel_id?: string | null;
    default_hotel_name?: string | null;
    default_hotel_image_url?: string | null;
    /** Client-enriched from the Hotels API when the package API has no delta. */
    default_hotel_starting_price?: number | null;
    default_hotel_slug?: string | null;
    default_room_type_name?: string | null;
    default_meal_plan?: string | null;
    hotel_options?: Array<{
      id: string;
      hotel_id: string;
      hotel_name: string;
      default_room_type_name?: string | null;
      sort_order?: number;
      /** Authoritative package-specific delta, when configured by the backend. */
      upgrade_price?: number | null;
      image_url?: string | null;
      /** Client-enriched live hotel starting rate, per night. */
      starting_price?: number | null;
      hotel_slug?: string | null;
    }>;
  }>;
  // Trip-level, not per-day — mirrors backend PackageDayOptionsOut.cabs
  // (package_cab_options table). day-level "cab_options" is not a real
  // backend field; cabs cover all transfers for the whole trip.
  cabs: Array<{
    id: string;
    name: string;
    description: string | null;
    seats: number;
    image_url?: string | null;
    price_delta: number;
    is_default: boolean;
    is_popular: boolean;
    sort_order: number;
  }>;
  addons: Array<{
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    price_per_person: number;
    is_default_on: boolean;
  }>;
};

/** Resolve package hotel ids against the existing Hotels API. */
async function attachHotelDetails(
  data: DayOptionsData,
): Promise<DayOptionsData> {
  if (!data.stays?.length) return data;

  const cities = [
    ...new Set(data.stays.map((stay) => stay.destination_city).filter(Boolean)),
  ];
  const results = await Promise.all(
    cities.map(async (city) => {
      try {
        const result = await searchHotels({
          city,
          page: 1,
          limit: 50,
          sort: "popular",
        });
        return [city, result.hotels] as const;
      } catch {
        return [city, [] as HotelListing[]] as const;
      }
    }),
  );
  const hotelsByCity = new Map(results);

  return {
    ...data,
    stays: data.stays.map((stay) => {
      const hotels = hotelsByCity.get(stay.destination_city) ?? [];
      const byId = new Map(hotels.map((hotel) => [hotel.id, hotel]));
      const defaultHotel = stay.default_hotel_id
        ? byId.get(stay.default_hotel_id)
        : undefined;
      return {
        ...stay,
        default_hotel_image_url: defaultHotel?.images?.[0] ?? null,
        default_hotel_starting_price: defaultHotel?.price ?? null,
        default_hotel_slug: defaultHotel?.hotelSlug ?? null,
        hotel_options: stay.hotel_options?.map((option) => {
          const hotel = byId.get(option.hotel_id);
          return {
            ...option,
            image_url: option.image_url ?? hotel?.images?.[0] ?? null,
            starting_price: hotel?.price ?? null,
            hotel_slug: hotel?.hotelSlug ?? null,
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
    if (!hotelOptions.length) {
      lastKey = null;
      continue;
    }

    // The backend mints a fresh option id per day even for the identical
    // hotel, and rarely fills in dest_name — so id-based or dest_name-based
    // grouping alone under-merges. Prefer dest_name when the backend gives
    // it; otherwise treat consecutive days offering the exact same set of
    // hotel names as one continuous stay. Nights = counted real days, never
    // a separate dest_nights summary field (which may be missing/stale).
    const key =
      hotelOptions[0]?.dest_name ??
      hotelOptions
        .map((h) => h.name)
        .sort()
        .join("|");

    if (key === lastKey && groups.length > 0) {
      groups[groups.length - 1]!.nights += 1;
      continue;
    }

    const destName =
      hotelOptions[0]?.dest_name ||
      day.location?.trim() ||
      `Stop ${day.day_number}`;
    groups.push({
      dest: destName,
      nights: 1,
      opts: hotelOptions.map((h) => ({
        id: h.id,
        name: h.name,
        stars: h.stars,
        desc: h.description,
        img: h.image_url ?? undefined,
        extra: h.price_delta,
        pop: h.is_popular,
        roomType: h.room_type || undefined,
        maxGuests: h.max_guests,
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

function buildHotelGroupsFromStays(
  stays: NonNullable<DayOptionsData["stays"]>,
): DestinationHotels[] {
  return stays
    .filter(
      (stay) =>
        stay.is_active !== false && (stay.hotel_options?.length ?? 0) > 0,
    )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((stay) => {
      const configuredOptions = [...(stay.hotel_options ?? [])];
      // The new payload carries the selected hotel separately from its
      // alternatives. Put it back into the choice list so the page shows the
      // actual included hotel first instead of silently selecting option #1.
      if (
        stay.default_hotel_id &&
        !configuredOptions.some(
          (option) => option.hotel_id === stay.default_hotel_id,
        )
      ) {
        configuredOptions.unshift({
          id: `${stay.id}-default`,
          hotel_id: stay.default_hotel_id,
          hotel_name: stay.default_hotel_name ?? "Selected hotel",
          default_room_type_name: stay.default_room_type_name,
          image_url: stay.default_hotel_image_url,
          starting_price: stay.default_hotel_starting_price,
          hotel_slug: stay.default_hotel_slug,
          sort_order: -1,
          upgrade_price: 0,
        });
      }
      const options = configuredOptions.sort((a, b) => {
        const aDefault = a.hotel_id === stay.default_hotel_id ? 0 : 1;
        const bDefault = b.hotel_id === stay.default_hotel_id ? 0 : 1;
        return aDefault - bDefault || (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
      return {
        dest: stay.destination_city,
        nights: stay.nights,
        stayId: stay.id,
        opts: options.map((hotel, index) => {
          const isIncludedHotel = hotel.hotel_id === stay.default_hotel_id;
          const catalogRateDifference =
            hotel.starting_price != null &&
            stay.default_hotel_starting_price != null
              ? Math.round(
                  (hotel.starting_price - stay.default_hotel_starting_price) *
                    Math.max(1, stay.nights),
                )
              : 0;

          return {
            id: hotel.id,
            name: hotel.hotel_name,
            desc:
              hotel.default_room_type_name ||
              stay.default_room_type_name ||
              "Comfortable stay",
            stars: 3,
            // The Hotels API rate is per night. Compare it with the included
            // hotel's rate for this exact stay; package-specific overrides
            // still take precedence whenever the API supplies one.
            extra: isIncludedHotel
              ? 0
              : (hotel.upgrade_price ?? catalogRateDifference),
            priceStatus: "confirmed",
            catalogPrice: hotel.starting_price ?? undefined,
            hotelId: hotel.hotel_id,
            hotelSlug: hotel.hotel_slug ?? undefined,
            pop: isIncludedHotel || index === 0,
            img: hotel.image_url ?? undefined,
            roomType:
              hotel.default_room_type_name ||
              stay.default_room_type_name ||
              undefined,
            mealsIncluded: stay.default_meal_plan
              ? [stay.default_meal_plan.toUpperCase()]
              : [],
          };
        }),
      };
    });
}

function buildCabOptions(cabs: DayOptionsData["cabs"]): CabOption[] {
  return [...cabs]
    .sort(
      (a, b) =>
        Number(b.is_default) - Number(a.is_default) ||
        a.sort_order - b.sort_order,
    )
    .map((c) => ({
      id: c.id,
      name: c.name,
      desc: c.description ?? "",
      seats: c.seats,
      extra: c.price_delta,
      pop: c.is_popular,
      img: c.image_url ?? undefined,
    }));
}

function buildAddonOptions(addons: DayOptionsData["addons"]): AddonOption[] {
  return addons.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon ?? "ShieldCheck",
    note: a.description ?? "",
    price: a.price_per_person,
    on: a.is_default_on,
  }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDayOptions(slug: string) {
  const previewEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "new-data";
  const query = useQuery({
    queryKey: [
      "packages",
      "day-options",
      slug,
      previewEnabled ? "new-data-preview" : "live",
    ],
    queryFn: async () => {
      // The supplied next-contract payload is preview-only: production URLs
      // continue to consume the backend response untouched.
      const previewData =
        previewEnabled && slug === "test-packages"
          ? (NEW_DATA_PREVIEW as unknown as DayOptionsData)
          : await apiData<DayOptionsData>(
              `/v1/packages/${encodeURIComponent(slug)}/day-options`,
            );
      return attachHotelDetails(previewData);
    },
    staleTime: 5 * 60 * 1000, // 5 min — matches backend cache TTL
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: Boolean(slug),
  });

  const data = query.data;

  // ── Stable derived values via useMemo ─────────────────────────────────────
  // WITHOUT useMemo, buildHotelGroups/buildCabOptions/buildAddonOptions run on
  // every render and return NEW array references even when data hasn't changed.
  // This causes useEffect([hotelGroups]), useEffect([addonOptions]),
  // useEffect([days]) in PackageDetailView to fire on every render → infinite loop.
  // useMemo ensures references only change when query.data actually changes.

  const hotelGroups = useMemo(
    () =>
      data?.stays?.length
        ? buildHotelGroupsFromStays(data.stays)
        : data?.days?.length
          ? buildHotelGroups(data.days)
          : [],
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
  const hasRealCabs = cabOptions.length > 0;
  const hasRealAddons = addonOptions.length > 0;

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    raw: data,
    hotelGroups: hasRealHotels ? hotelGroups : DEMO_HOTELS,
    cabOptions: hasRealCabs ? cabOptions : DEMO_CABS,
    addonOptions: hasRealAddons ? addonOptions : DEMO_ADDONS,
    usingDemo: !hasRealHotels && !hasRealCabs,
    days,
    // The day-options payload is the source of truth for the new package
    // pricing model. Keep this nullable so callers can fall back to the
    // package summary price only when the options request has no price.
    basePrice: data?.base_price ?? null,
    tokenType: data?.token_type ?? "percent",
    tokenAmount: data?.token_amount ?? 40,
    balanceDays: data?.balance_due_days ?? 7,
  };
}
