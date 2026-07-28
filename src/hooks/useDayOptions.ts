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
    thumbnail_url?: string | null;
    images?: string[];
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

function firstImage(
  ...candidates: Array<string | null | undefined | Array<string | null | undefined>>
): string | undefined {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const url = candidate.find(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
      if (url) return url.trim();
      continue;
    }

    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
}

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
    default_room_type_name?: string | null;
    default_meal_plan?: string | null;
    /** Hotel Master data for the default hotel, sent by the backend. */
    default_hotel_info?: {
      star_category?: number | null;
      thumbnail_url?: string | null;
      images?: string[];
      amenities?: string[];
      address?: string | null;
      description?: string | null;
      rating?: number | null;
      review_count?: number;
      check_in_time?: string | null;
      check_out_time?: string | null;
      /** Property.slug — used by the frontend for the Change Room flow. */
      hotel_slug?: string | null;
      /** Active room types — lets the UI show "Change room" without waiting. */
      room_count?: number;
    } | null;
    hotel_options?: Array<{
      id: string;
      hotel_id: string;
      hotel_name: string;
      default_room_type_name?: string | null;
      sort_order?: number;
      /** Live upgrade price from PricingEngine (cheapest room delta). */
      upgrade_price?: number | null;
      /** Per-night starting price from PricingEngine (display only). */
      starting_price?: number | null;
      /** Number of active room types at this hotel. */
      room_count?: number;
      image_url?: string | null;
      images?: string[];
      hotel_slug?: string | null;
      // Hotel Master enrichment from backend
      star_category?: number | null;
      thumbnail_url?: string | null;
      amenities?: string[];
      address?: string | null;
      city?: string | null;
      state?: string | null;
      description?: string | null;
      rating?: number | null;
      review_count?: number;
      check_in_time?: string | null;
      check_out_time?: string | null;
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
    /** Absolute price of this vehicle for the whole trip. */
    price_delta: number;
    /** Price difference vs the package's default vehicle — 0 for the default. */
    upgrade_price?: number | null;
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
        img: firstImage(h.thumbnail_url, h.images, h.image_url),
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
      // The default hotel is included in the options list by the backend
      // when it has alternates. If the default hotel is not in the list
      // (e.g. no alternates configured), add it so the UI always shows
      // the included hotel.
      const hasDefault = configuredOptions.some(
        (option) => option.hotel_id === stay.default_hotel_id,
      );
      if (stay.default_hotel_id && !hasDefault) {
        const info = stay.default_hotel_info;
        // Resolve the best available image from default_hotel_info so
        // all three image fields on the synthetic option are populated.
        // firstImage() in buildHotelGroupsFromStays checks thumbnail_url
        // first, then images[], then image_url — fill all three so at least
        // one of them survives the cascade.
        const resolvedDefaultImg = firstImage(info?.thumbnail_url, info?.images) ?? null;
        configuredOptions.unshift({
          id: `${stay.id}-default`,
          hotel_id: stay.default_hotel_id,
          hotel_name: stay.default_hotel_name ?? "Selected hotel",
          default_room_type_name: stay.default_room_type_name,
          thumbnail_url: info?.thumbnail_url ?? resolvedDefaultImg,
          images: info?.images?.length ? info.images : (resolvedDefaultImg ? [resolvedDefaultImg] : undefined),
          image_url: resolvedDefaultImg,
          starting_price: null,
          sort_order: -1,
          upgrade_price: 0,
          star_category: info?.star_category,
          amenities: info?.amenities,
          address: info?.address,
          description: info?.description,
          rating: info?.rating,
          review_count: info?.review_count,
          check_in_time: info?.check_in_time,
          check_out_time: info?.check_out_time,
          // hotel_slug from default_hotel_info — needed for Change Room flow
          hotel_slug: info?.hotel_slug ?? null,
          // Without this the default hotel reports 0 room types and the
          // customiser hides its "Change room" control entirely.
          room_count: info?.room_count ?? 0,
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
          const defaultInfo = isIncludedHotel ? stay.default_hotel_info : null;

          // Image resolution — cascade through every available field so we
          // always show something. For the default/included hotel the backend
          // stores the authoritative photo in default_hotel_info; for upgrade
          // options it lives on the option row itself.
          const optionImages = firstImage(
            hotel.thumbnail_url,   // Hotel Master thumbnail (most reliable)
            hotel.images,          // Hotel Master gallery array
            hotel.image_url,       // Legacy image_url field
          );
          // When the option is the default hotel but its Hotel Master fields
          // are empty, use default_hotel_info as a last resort.
          const resolvedImg = optionImages ?? firstImage(
            isIncludedHotel ? (defaultInfo?.thumbnail_url ?? null) : null,
            isIncludedHotel ? (defaultInfo?.images ?? null) : null,
          );

          return {
            id: hotel.id,
            name: hotel.hotel_name,
            desc:
              hotel.default_room_type_name ||
              stay.default_room_type_name ||
              "Comfortable stay",
            stars: hotel.star_category ?? defaultInfo?.star_category ?? 3,
            extra: isIncludedHotel
              ? 0
              : (hotel.upgrade_price ?? 0),
            priceStatus: "confirmed" as const,
            startingPrice: hotel.starting_price ?? undefined,
            roomCount: hotel.room_count,
            hotelId: hotel.hotel_id,
            hotelSlug: hotel.hotel_slug ?? undefined,
            pop: isIncludedHotel || index === 0,
            img: resolvedImg,
            // Gallery for the stay card's thumbnail strip. Same cascade as
            // `img`: option-level gallery first, then default_hotel_info for
            // the included hotel, then whatever single image we resolved.
            images: (() => {
              const gallery = hotel.images?.length
                ? hotel.images
                : isIncludedHotel && defaultInfo?.images?.length
                  ? defaultInfo.images
                  : [];
              const cleaned = gallery.filter(
                (url): url is string => typeof url === "string" && url.trim().length > 0,
              );
              return cleaned.length ? cleaned : resolvedImg ? [resolvedImg] : [];
            })(),
            roomType:
              hotel.default_room_type_name ||
              stay.default_room_type_name ||
              undefined,
            mealsIncluded: stay.default_meal_plan
              ? [stay.default_meal_plan.toUpperCase()]
              : [],
            // Hotel Master enrichment
            hotelDescription: hotel.description ?? defaultInfo?.description ?? null,
            rating: hotel.rating ?? defaultInfo?.rating ?? null,
            reviewCount: hotel.review_count ?? defaultInfo?.review_count ?? 0,
            address: hotel.address ?? defaultInfo?.address ?? null,
            amenities: hotel.amenities ?? defaultInfo?.amenities ?? [],
            checkInTime: hotel.check_in_time ?? defaultInfo?.check_in_time ?? null,
            checkOutTime: hotel.check_out_time ?? defaultInfo?.check_out_time ?? null,
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
      // CabOption.extra is a DELTA vs the included vehicle (same contract as
      // hotel upgrade_price), not the vehicle's absolute price. Using
      // price_delta here made every vehicle show its full cost as a "+₹"
      // upgrade. The real total still comes from the fulfillment price API.
      extra: c.upgrade_price ?? 0,
      price: c.price_delta,
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

export function useDayOptions(slug: string, travelDate?: string | null) {
  const previewEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "new-data";
  const query = useQuery({
    // travelDate is part of the key: hotel upgrade prices are date-dependent,
    // so changing the date must refetch rather than serve stale prices.
    queryKey: [
      "packages",
      "day-options",
      slug,
      travelDate ?? "no-date",
      previewEnabled ? "new-data-preview" : "live",
    ],
    queryFn: async () => {
      // The supplied next-contract payload is preview-only: production URLs
      // continue to consume the backend response untouched.
      const previewData =
        previewEnabled && slug === "test-packages"
          ? (NEW_DATA_PREVIEW as unknown as DayOptionsData)
          : await apiData<DayOptionsData>(
              // Without travel_date the backend cannot price rooms and every
              // upgrade_price comes back null — the customiser then renders
              // "₹0 change to package price" for every hotel.
              `/v1/packages/${encodeURIComponent(slug)}/day-options` +
                (travelDate
                  ? `?travel_date=${encodeURIComponent(travelDate)}`
                  : ""),
            );
      return previewData;
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