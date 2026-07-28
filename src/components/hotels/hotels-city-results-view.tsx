"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { TravelMobileTopShell } from "@/components/home/HeroSection";
import { HotelResultCard } from "@/components/hotels/hotel-result-card";
import {
  EMPTY_HOTEL_FILTERS,
  HotelsResultsFilters,
  type HotelFiltersState,
} from "@/components/hotels/hotels-results-filters";
import {
  HotelsResultsSearchStrip,
  type HotelModifySearchPayload,
} from "@/components/hotels/hotels-results-search-strip";
import {
  HOTEL_PRICE_BANDS,
  distanceKmBetween,
  findHotelLocality,
  hotelResultsHref,
  type HotelCity,
  type HotelDestinationOption,
  type HotelListing,
  type HotelSortOption,
} from "@/lib/hotels-catalog";
import { searchHotels } from "@/lib/hotels-api";
import { cn } from "@/lib/utils";

const HOTELS_PER_PAGE = 5;

function applyFilters(
  hotels: HotelListing[],
  filters: HotelFiltersState,
): HotelListing[] {
  const matchAny = (haystack: string[], needles: string[]) => {
    const source = haystack.map((x) => x.trim().toLowerCase()).filter(Boolean);
    return needles.some((needle) => source.includes(needle.trim().toLowerCase()));
  };

  return hotels.filter((h) => {
    if (filters.bookWithZero && !h.bookWithZero) return false;
    if (filters.freeCancellation && !h.freeCancellation) return false;
    if (filters.freeBreakfast && !h.freeBreakfast) return false;
    if (filters.freeParking && !h.freeParking) return false;
    if (filters.stars.length > 0 && !filters.stars.includes(h.stars))
      return false;
    if (filters.priceBands.length > 0) {
      const inBand = filters.priceBands.some((bandId) => {
        const band = HOTEL_PRICE_BANDS.find((b) => b.id === bandId);
        if (!band) return false;
        return h.price >= band.min && h.price <= band.max;
      });
      if (!inBand) return false;
    }
    if (filters.amenities.length > 0 && !matchAny(h.amenities, filters.amenities)) {
      return false;
    }
    if (filters.propertyTypes.length > 0 && !matchAny(h.tags, filters.propertyTypes)) {
      return false;
    }
    return true;
  });
}

function sortHotels(
  hotels: HotelListing[],
  sort: HotelSortOption,
): HotelListing[] {
  const copy = [...hotels];
  switch (sort) {
    case "price-low":
      return copy.sort((a, b) => a.price - b.price);
    case "price-high":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

type HotelsCityResultsViewProps = {
  city: HotelCity;
  hotels: HotelListing[];
  destinations?: HotelDestinationOption[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRooms?: number;
  initialGuests?: number;
  initialLastMinute?: boolean;
  initialSort?: HotelSortOption;
  initialSearchQuery?: string;
};

export function HotelsCityResultsView({
  city: initialCity,
  hotels: initialHotels,
  destinations = [],
  initialCheckIn,
  initialCheckOut,
  initialRooms,
  initialGuests,
  initialLastMinute = false,
  initialSort = "popularity",
  initialSearchQuery = "",
}: HotelsCityResultsViewProps) {
  const [city, setCity] = useState(initialCity);
  const [hotels, setHotels] = useState(initialHotels);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] =
    useState<HotelFiltersState>(EMPTY_HOTEL_FILTERS);
  const [sort, setSort] = useState<HotelSortOption>(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [lastMinuteOnly, setLastMinuteOnly] = useState(initialLastMinute);

  const filtered = useMemo(() => {
    let list = applyFilters(hotels, filters);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.area.toLowerCase().includes(q) ||
          h.locationLine.toLowerCase().includes(q) ||
          (h.address?.toLowerCase().includes(q) ?? false),
      );
    }
    if (lastMinuteOnly) {
      list = list.filter((h) => h.dealOfDay);
    }
    return sortHotels(list, sort);
  }, [hotels, filters, searchQuery, lastMinuteOnly, sort]);

  const displayHotels = useMemo(() => {
    const locality = findHotelLocality(searchQuery);
    if (!locality) return filtered;
    return filtered
      .map((hotel) => {
        if (hotel.latitude == null || hotel.longitude == null) {
          return { ...hotel, searchLocationLabel: locality.name };
        }
        return {
          ...hotel,
          searchLocationLabel: locality.name,
          distanceFromSearchKm: distanceKmBetween(locality, {
            latitude: hotel.latitude,
            longitude: hotel.longitude,
          }),
        };
      })
      .sort((a, b) => (a.distanceFromSearchKm ?? Infinity) - (b.distanceFromSearchKm ?? Infinity));
  }, [filtered, searchQuery]);

  const total = displayHotels.length;
  const totalPages = Math.max(1, Math.ceil(total / HOTELS_PER_PAGE));
  const [page, setPage] = useState(1);

  const listKey = useMemo(
    () => displayHotels.map((h) => h.id).join("|"),
    [displayHotels],
  );

  useEffect(() => {
    setPage(1);
  }, [listKey]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * HOTELS_PER_PAGE;
  const end = Math.min(start + HOTELS_PER_PAGE, total);
  const pageHotels = useMemo(
    () => displayHotels.slice(start, start + HOTELS_PER_PAGE),
    [displayHotels, start],
  );

  const scrollToResults = () => {
    document
      .getElementById("hotel-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPage = (next: number) => {
    const p = Math.min(Math.max(1, next), totalPages);
    setPage(p);
    scrollToResults();
  };

  const handleModifySearch = async (payload: HotelModifySearchPayload) => {
    setSearching(true);
    try {
      const { hotels: nextHotels } = await searchHotels({
        city: payload.city,
        q: payload.q,
        check_in: payload.check_in,
        check_out: payload.check_out,
        adults: payload.guests,
        rooms: payload.rooms,
        limit: 50,
        sort: "popular",
      });

      setCity({
        slug: payload.slug,
        name: payload.city,
        fullLocation: payload.fullLocation,
      });
      setHotels(nextHotels);
      setFilters(EMPTY_HOTEL_FILTERS);
      setSearchQuery(payload.q ?? "");
      setLastMinuteOnly(false);
      setPage(1);

      window.history.replaceState(
        null,
        "",
        hotelResultsHref(payload.slug, {
          check_in: payload.check_in,
          check_out: payload.check_out,
          rooms: payload.rooms,
          guests: payload.guests,
          q: payload.q,
          last_minute: lastMinuteOnly || undefined,
          sort: sort !== "popularity" ? sort : undefined,
        }),
      );

      document
        .getElementById("hotel-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <div className="hidden md:block">
          <HeroGlassNavbar activeId="hotels" />
        </div>
        <TravelMobileTopShell activeId="hotels" showGreeting={false} />
        <Suspense fallback={null}>
          <HotelsResultsSearchStrip
            city={city}
            destinations={destinations}
            searching={searching}
            onSearch={handleModifySearch}
          />
        </Suspense>

        <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          {/* Breadcrumb + search + sort */}
          <div className="flex flex-col gap-3 border-b border-[#e0e0e0] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <nav
              className="flex flex-wrap items-center gap-1 text-[12px] text-[#2196F3] sm:text-[13px]"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-[#9E9E9E]"
                aria-hidden
              />
              <Link href="/hotels" className="hover:underline">
                Hotels
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-[#9E9E9E]"
                aria-hidden
              />
              <span className="font-medium text-[#212121]">
                Hotels in {city.name}
              </span>
            </nav>

            <div className="flex flex-1 flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <label className="relative flex min-w-0 flex-1 items-center">
                <Search
                  className="pointer-events-none absolute left-3 h-4 w-4 text-[#9E9E9E]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter hotel name or location"
                  className="h-10 w-full rounded border border-[#e0e0e0] bg-white pl-9 pr-3 text-[13px] outline-none focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]/30"
                />
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as HotelSortOption)}
                className="h-10 shrink-0 rounded border border-[#e0e0e0] bg-white px-3 text-[13px] font-medium text-[#212121] outline-none focus:border-[#2196F3]"
                aria-label="Sort hotels"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
            <div className="w-full shrink-0 lg:w-[260px] xl:w-[280px]">
              <HotelsResultsFilters
                hotels={hotels}
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(EMPTY_HOTEL_FILTERS)}
              />
            </div>

            <div id="hotel-results" className="min-w-0 flex-1 scroll-mt-24">
              <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-md border border-[#e0e0e0] bg-white px-3 py-2.5 text-[13px] font-medium text-[#212121] shadow-sm">
                <input
                  type="checkbox"
                  checked={lastMinuteOnly}
                  onChange={(e) => setLastMinuteOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-[#BDBDBD] accent-[#2196F3]"
                />
                <Clock className="h-4 w-4 text-[#2196F3]" aria-hidden />
                Last Minute Deals
              </label>

              <p className="mb-3 text-[13px] text-[#757575]">
                {hotels.length === 0 ? (
                  <>No hotels listed in {city.name} yet</>
                ) : total === 0 ? (
                  <>No properties match your filters in {city.name}</>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[#212121]">
                      {start + 1}–{end}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#212121]">
                      {total}
                    </span>{" "}
                    properties in {city.name}
                  </>
                )}
              </p>

              <div className="flex flex-col gap-3 sm:gap-4">
                {hotels.length === 0 ? (
                  <div className="rounded-lg border border-[#e0e0e0] bg-white p-8 text-center">
                    <p className="font-semibold text-[#212121]">
                      No hotels in this destination yet
                    </p>
                    <p className="mt-1 text-sm text-[#757575]">
                      Check back soon or search another city from the hotels
                      home page.
                    </p>
                    <Link
                      href="/hotels"
                      className="mt-4 inline-block text-sm font-semibold text-[#2196F3] hover:underline"
                    >
                      Browse all destinations
                    </Link>
                  </div>
                ) : total === 0 ? (
                  <div className="rounded-lg border border-[#e0e0e0] bg-white p-8 text-center">
                    <p className="font-semibold text-[#212121]">
                      No hotels match your filters
                    </p>
                    <p className="mt-1 text-sm text-[#757575]">
                      Try resetting filters or changing your search.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(EMPTY_HOTEL_FILTERS);
                        setSearchQuery("");
                        setLastMinuteOnly(false);
                        setPage(1);
                      }}
                      className="mt-4 text-sm font-semibold text-[#2196F3] hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <>
                    {pageHotels.map((hotel) => (
                      <HotelResultCard key={hotel.id} hotel={hotel} />
                    ))}

                    {totalPages > 1 ? (
                      <nav
                        className="mt-4 flex flex-col items-center gap-3 border-t border-[#e8e8e8] bg-white px-3 py-4 sm:flex-row sm:justify-between sm:px-4"
                        aria-label="Hotel list pagination"
                      >
                        <p className="order-2 text-center text-xs text-[#757575] sm:order-1 sm:text-left">
                          Showing{" "}
                          <span className="font-semibold text-[#212121]">
                            {start + 1}–{end}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold text-[#212121]">
                            {total}
                          </span>{" "}
                          properties · Page {safePage} of {totalPages}
                        </p>
                        <div className="order-1 flex flex-wrap items-center justify-center gap-1.5 sm:order-2">
                          <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => goToPage(safePage - 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e0e0e0] bg-white px-3 text-xs font-semibold text-[#212121] transition hover:border-[#EF6614]/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden />
                            Prev
                          </button>
                          <div className="flex items-center gap-1 px-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => goToPage(n)}
                                className={cn(
                                  "flex h-9 min-w-9 items-center justify-center rounded-md border text-xs font-semibold transition",
                                  n === safePage
                                    ? "border-[#EF6614] bg-[#EF6614] text-white shadow-sm"
                                    : "border-[#e0e0e0] bg-white text-[#424242] hover:border-[#EF6614]/40 hover:text-[#EF6614]",
                                )}
                                aria-label={`Page ${n}`}
                                aria-current={
                                  n === safePage ? "page" : undefined
                                }
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            disabled={safePage >= totalPages}
                            onClick={() => goToPage(safePage + 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e0e0e0] bg-white px-3 text-xs font-semibold text-[#212121] transition hover:border-[#EF6614]/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </nav>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#2196F3] text-white shadow-lg transition hover:bg-[#1976D2] sm:right-6"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      </main>
      <Footer />
    </>
  );
}
