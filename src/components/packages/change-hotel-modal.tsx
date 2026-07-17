"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  ImageIcon,
  MapPin,
  ParkingSquare,
  Search,
  Sparkles,
  Star,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import type {
  DestinationHotels,
  HotelOption,
} from "@/lib/package-customizer-data";
import { fmtINR } from "@/lib/package-customizer-data";
import { getHotelDetailBundle } from "@/lib/hotels-api";
import { cn } from "@/lib/utils";

export type ChangeHotelModalProps = {
  open: boolean;
  onClose: () => void;
  destination: DestinationHotels | undefined;
  selectedIndex: number;
  checkIn: Date | null;
  onSelect: (index: number) => void;
  mode?: "hotel" | "room";
};

type SortValue = "popularity" | "price_asc" | "price_desc";
type HotelGroup = {
  name: string;
  image?: string;
  description: string;
  stars: number;
  popular: boolean;
  rooms: Array<{ option: HotelOption; index: number }>;
};

const STARS = [3, 4, 5] as const;

function groupHotels(options: HotelOption[]): HotelGroup[] {
  const groups = new Map<string, HotelGroup>();
  for (const [index, option] of options.entries()) {
    const existing = groups.get(option.name);
    if (existing) {
      existing.rooms.push({ option, index });
      existing.popular ||= option.pop;
      continue;
    }
    groups.set(option.name, {
      name: option.name,
      image: option.img,
      description: option.desc,
      stars: option.stars,
      popular: option.pop,
      rooms: [{ option, index }],
    });
  }
  return [...groups.values()];
}

function StarRating({ value }: { value: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${value} star hotel`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-[18px] w-[18px]",
            index < value
              ? "fill-[#ffad00] text-[#ffad00]"
              : "fill-slate-100 text-slate-200",
          )}
        />
      ))}
    </span>
  );
}

/** Keep internal board codes out of the traveller-facing hotel picker. */
function friendlyMealPlanLabel(value?: string | string[]): string {
  const raw = Array.isArray(value) ? value.join(" · ") : value ?? "";
  const normalized = raw.toLowerCase();

  if (/\bap\b|full board|all meals/.test(normalized)) return "All meals included";
  if (/\bmap\b|half board|breakfast.*dinner|dinner.*breakfast/.test(normalized)) return "Breakfast & dinner included";
  if (/\bcp\b|breakfast/.test(normalized)) return "Breakfast included";
  if (/\bep\b|room only/.test(normalized)) return "Room only";

  return raw.replace(/\s*\((?:ep|cp|map|ap)\)\s*/gi, "").trim() || "Meals included";
}

/** Describe the exact package-total effect of choosing a hotel. */
function hotelPriceImpactLabel(delta: number): string {
  if (delta === 0) return "₹0 change to package price";
  if (delta > 0) return `+₹${fmtINR(delta)} to package price`;
  return `Save ₹${fmtINR(Math.abs(delta))} on package`;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function ChangeHotelModal({
  open,
  onClose,
  destination,
  selectedIndex,
  onSelect,
  mode = "hotel",
}: ChangeHotelModalProps) {
  const mounted = useMounted();
  const [query, setQuery] = useState("");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortValue>("popularity");
  const [pendingIndex, setPendingIndex] = useState(selectedIndex);
  const [roomTab, setRoomTab] = useState<
    "about" | "rooms" | "facilities" | "location"
  >("rooms");
  const [pendingRoomPlan, setPendingRoomPlan] = useState<{
    roomId: string;
    planId: string;
    roomName: string;
    planName: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setPendingIndex(selectedIndex);
      setQuery("");
      setStarFilter(null);
      setSort("popularity");
      setRoomTab("rooms");
      setPendingRoomPlan(null);
    }
  }, [open, selectedIndex]);

  // The drawer has its own scroll container. Lock the page underneath so it
  // cannot move while a hotel/room selector is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  const hotels = useMemo(() => {
    if (!destination) return [];
    const search = query.trim().toLowerCase();
    const result = groupHotels(destination.opts).filter(
      (hotel) =>
        (!starFilter || hotel.stars >= starFilter) &&
        (!search || hotel.name.toLowerCase().includes(search)),
    );
    const cheapest = (hotel: HotelGroup) =>
      Math.min(...hotel.rooms.map((room) => room.option.extra));
    result.sort((a, b) => {
      if (sort === "price_asc") return cheapest(a) - cheapest(b);
      if (sort === "price_desc") return cheapest(b) - cheapest(a);
      return Number(b.popular) - Number(a.popular);
    });
    // Keep the result order stable when a card is selected. Moving the
    // selected card to the top makes the drawer jump under the user's cursor.
    return result;
  }, [destination, pendingIndex, query, sort, starFilter]);

  // Hooks must run for every render. Keep this query disabled until the
  // drawer has a selected hotel, rather than returning before calling it.
  const activeOption = destination?.opts[selectedIndex];
  const roomCatalogQuery = useQuery({
    queryKey: [
      "package-room-catalog",
      destination?.dest,
      activeOption?.hotelSlug ?? activeOption?.hotelId,
    ],
    queryFn: async () => {
      const bundle = await getHotelDetailBundle(
        destination?.dest ?? "",
        activeOption?.hotelSlug ?? activeOption?.hotelId ?? "",
      );

      // Do not cache a failed detail request as an empty catalogue. That
      // previously exposed the package fallback card instead of actual rooms.
      if (!bundle) throw new Error("Unable to load the hotel room catalogue");
      return bundle;
    },
    enabled:
      open &&
      mode === "room" &&
      Boolean(destination?.dest && (activeOption?.hotelSlug || activeOption?.hotelId)),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });
  const roomCatalog = roomCatalogQuery.data?.roomTypes ?? [];

  if (!mounted || !destination) return null;

  const selectedExtra = destination.opts[selectedIndex]?.extra ?? 0;
  const pendingOption = destination.opts[pendingIndex];
  const pendingDelta = (pendingOption?.extra ?? selectedExtra) - selectedExtra;
  const hasPricedChange = pendingIndex !== selectedIndex;
  const hasRoomChange = mode === "room" && pendingRoomPlan !== null;
  const canCommit = mode === "room" ? hasRoomChange : hasPricedChange;
  const activeHotel =
    groupHotels(destination.opts).find((hotel) =>
      hotel.rooms.some((room) => room.index === selectedIndex),
    ) ?? groupHotels(destination.opts)[0];
  const commit = () => {
    if (!canCommit) return;
    onSelect(pendingIndex);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close hotel selector"
            className="fixed inset-0 z-[220] bg-slate-950/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={mode === "room" ? "Change room" : "Change hotel"}
            className="fixed bottom-0 right-0 top-0 z-[230] flex w-full min-h-0 flex-col overflow-hidden rounded-l-[14px] bg-white shadow-2xl lg:w-[78vw] lg:max-w-[1280px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header
              className={cn(
                "flex shrink-0 items-center justify-between border-b border-[#e9edf3] px-5 py-3.5",
                mode === "room" && "border-0 bg-primary text-white",
              )}
            >
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl bg-[#fff0e8] text-primary",
                    mode === "room" && "bg-white/15 text-white",
                  )}
                >
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    className={cn(
                      "text-[21px] font-extrabold tracking-[-0.03em] text-[#172033]",
                      mode === "room" && "text-white",
                    )}
                  >
                    {mode === "room" ? "View Hotel" : "Change Hotel"}
                  </h2>
                  <p
                    className={cn(
                      "mt-0.5 text-xs font-medium text-[#667085]",
                      mode === "room" && "text-white/75",
                    )}
                  >
                    {destination.dest} · {destination.nights} night
                    {destination.nights === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl border border-[#edf0f4] text-[#344054] transition hover:bg-slate-50",
                  mode === "room" &&
                    "border-white/20 text-white hover:bg-white/15",
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {mode === "room" && activeHotel ? (
              <main className="min-h-0 flex-1 overflow-y-auto bg-white">
                <section className="border-b border-orange-100 bg-[#fff9f5] px-5 pb-4 pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[#172033]">
                      {activeHotel.name}
                    </h3>
                    <StarRating value={activeHotel.stars} />
                    <span className="ml-auto rounded-full bg-[#12b76a] px-2.5 py-1 text-[10px] font-bold text-white">
                      ● SELECTED HOTEL
                    </span>
                  </div>
                  <div className="relative mt-4 h-40 max-w-sm overflow-hidden rounded-xl bg-slate-100">
                    {activeHotel.image ? (
                      <Image
                        src={activeHotel.image}
                        alt={activeHotel.name}
                        fill
                        className="object-cover"
                        sizes="380px"
                      />
                    ) : (
                      <Building2 className="m-auto h-full w-10 text-slate-300" />
                    )}
                    <button
                      type="button"
                      className="absolute bottom-2 left-2 rounded-lg bg-black/65 px-2.5 py-1.5 text-[10px] font-bold text-white"
                    >
                      ▧ VIEW GALLERY&nbsp; →
                    </button>
                  </div>
                </section>
                <nav className="flex gap-1.5 border-b border-slate-200 px-5 py-2.5">
                  {(
                    [
                      ["about", "About Hotel"],
                      ["rooms", "Rooms"],
                      ["facilities", "Facilities"],
                      ["location", "Location"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRoomTab(id)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                        roomTab === id
                          ? "bg-primary font-bold text-white shadow-sm"
                          : "text-slate-500 hover:bg-orange-50 hover:text-primary",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                {roomTab === "about" && (
                  <section className="px-5 py-5">
                    <h4 className="text-lg font-extrabold text-[#172033]">
                      About {activeHotel.name}
                    </h4>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      {activeHotel.description ||
                        `${activeHotel.name} is a comfortable stay selected for your ${destination.dest} itinerary, with convenient access to local sightseeing and essential guest services.`}
                    </p>
                  </section>
                )}
                {roomTab === "facilities" && (
                  <section className="px-5 py-5">
                    <h4 className="text-lg font-extrabold text-[#172033]">
                      Hotel Facilities
                    </h4>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        [Wifi, "Free Wi-Fi"],
                        [UtensilsCrossed, "Restaurant"],
                        [ParkingSquare, "Parking"],
                        [Building2, "Room Service"],
                        [BedDouble, "Comfortable Rooms"],
                        [MapPin, "Local Assistance"],
                      ].map(([Icon, label]) => (
                        <div
                          key={label as string}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700"
                        >
                          {typeof Icon === "function" && (
                            <Icon className="h-4 w-4 text-primary" />
                          )}
                          {label as string}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {roomTab === "location" && (
                  <section className="px-5 py-5">
                    <h4 className="text-lg font-extrabold text-[#172033]">
                      Location
                    </h4>
                    <div className="mt-4 rounded-2xl border border-orange-100 bg-[#fffaf7] p-5">
                      <MapPin className="h-6 w-6 text-primary" />
                      <p className="mt-3 text-base font-bold text-slate-800">
                        {destination.dest}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Your stay is arranged close to the planned sightseeing
                        and transfers in your itinerary.
                      </p>
                    </div>
                  </section>
                )}
                {roomTab === "rooms" && (
                  <section className="px-5 py-4">
                    <div className="flex gap-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <span>
                        Check In:{" "}
                        <b className="ml-1 text-slate-800">12:00 PM</b>
                      </span>
                      <span>
                        Check Out:{" "}
                        <b className="ml-1 text-slate-800">11:00 AM</b>
                      </span>
                    </div>
                    <h4 className="mt-5 text-lg font-extrabold text-[#172033]">
                      Available Rooms
                    </h4>
                    {roomCatalogQuery.isLoading && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                        Loading room types and meal plans…
                      </div>
                    )}
                    {roomCatalog.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {roomCatalog.map((room) => (
                          <article
                            key={room.id}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
                          >
                            <div className="flex gap-3">
                              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                {room.image ? (
                                  <Image
                                    src={room.image}
                                    alt={room.name}
                                    fill
                                    className="object-cover"
                                    sizes="112px"
                                  />
                                ) : (
                                  <BedDouble className="m-auto h-full w-7 text-slate-300" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-base font-extrabold text-[#172033]">
                                  {room.name}
                                </h5>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {room.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                {(room.amenities?.length ?? 0) > 0 && (
                                  <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-500">
                                    {room.amenities?.slice(0, 5).join(" · ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
                              {room.ratePlans.map((plan) => (
                                <button
                                  type="button"
                                  key={plan.id}
                                  onClick={() =>
                                    setPendingRoomPlan({
                                      roomId: room.id,
                                      planId: plan.id,
                                      roomName: room.name,
                                      planName: friendlyMealPlanLabel(plan.packageName),
                                      price: plan.price,
                                    })
                                  }
                                  className={cn(
                                    "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                                    pendingRoomPlan?.planId === plan.id
                                      ? "border-primary bg-[#fff2ea] ring-1 ring-primary/15"
                                      : "border-transparent bg-[#fffaf7] hover:border-orange-200 hover:bg-[#fff7f2]",
                                  )}
                                >
                                  <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#344054]">
                                      {pendingRoomPlan?.planId === plan.id && (
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                      )}
                                      {friendlyMealPlanLabel(plan.packageName)}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                      {plan.benefits.join(" · ")}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-xs font-extrabold text-primary">
                                    ₹{fmtINR(plan.price)} / night
                                  </span>
                                </button>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    {!roomCatalogQuery.isLoading && roomCatalog.length === 0 && (
                      <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        We could not load the current hotel&apos;s room types. Please try again.
                      </div>
                    )}
                  </section>
                )}
              </main>
            ) : (
              <>
                <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-[#e9edf3] px-4 py-2 md:grid-cols-[230px_minmax(300px,1fr)_180px_180px] md:items-center md:gap-0">
                  <label className="relative flex h-9 items-center md:pr-4">
                    <Search className="absolute left-3.5 h-4.5 w-4.5 text-[#475467]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search by hotel name"
                      className="h-full w-full rounded-xl border border-[#dce2ea] bg-white pl-11 pr-3.5 text-sm text-[#172033] outline-none placeholder:text-[#98a2b3] focus:border-primary"
                    />
                  </label>
                  <div className="border-l-0 border-[#edf0f4] md:flex md:items-center md:gap-2 md:border-l md:px-4">
                    <p className="mb-1 text-[11px] font-bold text-[#475467] md:mb-0 md:shrink-0">
                      Star Rating
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStarFilter(null)}
                        className={cn(
                          "h-9 min-w-10 rounded-full border px-3 text-xs font-semibold",
                          !starFilter
                            ? "border-primary bg-[#fff7f2] text-primary"
                            : "border-[#dce2ea] text-[#344054]",
                        )}
                      >
                        All
                      </button>
                      {STARS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setStarFilter(starFilter === value ? null : value)
                          }
                          className={cn(
                            "h-9 min-w-10 rounded-full border px-2 text-xs font-semibold",
                            starFilter === value
                              ? "border-primary bg-[#fff7f2] text-primary"
                              : "border-[#dce2ea] text-[#344054]",
                          )}
                        >
                          {value} ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="border-l-0 border-[#edf0f4] md:flex md:items-center md:gap-2 md:border-l md:px-4">
                    <p className="mb-1 text-[11px] font-bold text-[#475467] md:mb-0 md:shrink-0">
                      Sort by
                    </p>
                    <span className="relative block md:min-w-0 md:flex-1">
                      <select
                        value={sort}
                        onChange={(event) =>
                          setSort(event.target.value as SortValue)
                        }
                        className="h-9 w-full appearance-none rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-medium text-[#344054] outline-none"
                      >
                        <option value="popularity">Popularity</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[#344054]" />
                    </span>
                  </label>
                  <label className="border-l-0 border-[#edf0f4] md:flex md:items-center md:gap-2 md:border-l md:pl-4">
                    <p className="mb-1 text-[11px] font-bold text-[#475467] md:mb-0 md:shrink-0">
                      Hotel Type
                    </p>
                    <span className="relative block md:min-w-0 md:flex-1">
                      <select className="h-9 w-full appearance-none rounded-xl border border-[#dce2ea] bg-white px-3 text-sm font-medium text-[#344054] outline-none">
                        <option>Hotel</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[#344054]" />
                    </span>
                  </label>
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto bg-white px-6 pb-5 pt-4">
                  <p className="mb-3 text-sm font-medium text-[#667085]">
                    Showing{" "}
                    <b className="font-extrabold text-primary">
                      {hotels.length}
                    </b>{" "}
                    hotels in{" "}
                    <b className="font-bold text-[#344054]">
                      {destination.dest}
                    </b>
                  </p>
                  <div className="space-y-3">
                    {hotels.map((hotel) => {
                      const activeRoom =
                        hotel.rooms.find(
                          (room) => room.index === pendingIndex,
                        ) ?? hotel.rooms[0];
                      const isSelectedHotel = hotel.rooms.some(
                        (room) => room.index === pendingIndex,
                      );
                      const room = activeRoom.option;
                      const delta = room.extra - selectedExtra;
                      return (
                        <article
                          key={hotel.name}
                          className={cn(
                            "overflow-hidden rounded-2xl border bg-white shadow-[0_3px_14px_rgba(16,24,40,0.05)]",
                            isSelectedHotel
                              ? "border-primary ring-1 ring-primary/15"
                              : "border-[#e5eaf0]",
                          )}
                        >
                          <div className="grid min-h-[190px] grid-cols-1 gap-4 p-3 md:grid-cols-[280px_minmax(0,1fr)]">
                            <div className="relative min-h-[175px] overflow-hidden rounded-xl bg-slate-100">
                              {hotel.image ? (
                                <Image
                                  src={hotel.image}
                                  alt={hotel.name}
                                  fill
                                  className="object-cover"
                                  sizes="342px"
                                />
                              ) : (
                                <Building2 className="m-auto h-full w-10 text-slate-300" />
                              )}
                              {isSelectedHotel && (
                                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
                                  <Check className="h-3.5 w-3.5" />
                                  SELECTED
                                </span>
                              )}
                              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1 text-xs font-bold text-white">
                                <ImageIcon className="h-3.5 w-3.5" />1 / 24
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-col py-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-extrabold tracking-[-0.02em] text-[#172033]">
                                  {hotel.name}
                                </h3>
                                {hotel.popular && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7df] px-2 py-0.5 text-[10px] font-bold text-[#9a7316]">
                                    <Sparkles className="h-3 w-3" />
                                    POPULAR
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <StarRating value={hotel.stars} />
                                <span className="text-xs font-medium text-[#667085]">
                                  {room.roomType ?? "Deluxe"}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#667085]">
                                <span className="inline-flex items-center gap-1.5">
                                  <Wifi className="h-3.5 w-3.5" />
                                  Free Wi-Fi
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <UtensilsCrossed className="h-3.5 w-3.5" />
                                  Restaurant
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <ParkingSquare className="h-3.5 w-3.5" />
                                  Parking
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5" />
                                  Room Service
                                </span>
                                <span className="rounded-full border border-[#e5eaf0] px-2 py-0.5 text-[10px] font-bold">
                                  +6
                                </span>
                              </div>
                              <div className="mt-auto flex min-h-[58px] items-center justify-between gap-4 rounded-xl bg-[#fffaf7] px-4 py-2.5">
                                <div>
                                  <p className="inline-flex items-center gap-2 text-xs font-bold text-[#344054]">
                                    <BedDouble className="h-3.5 w-3.5" />
                                    {room.roomType ?? "Deluxe"} Room
                                  </p>
                                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-[#1b9c5a]">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {friendlyMealPlanLabel(room.mealsIncluded)}
                                  </p>
                                </div>
                                {isSelectedHotel ? (
                                  <span className="text-xs font-bold text-primary">
                                    Currently selected
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-4">
                                    <span
                                      className={cn(
                                        "text-xs font-extrabold",
                                        delta > 0
                                          ? "text-primary"
                                          : delta < 0
                                            ? "text-[#1b9c5a]"
                                            : "text-[#667085]",
                                      )}
                                    >
                                      {hotelPriceImpactLabel(delta)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingIndex(activeRoom.index)
                                      }
                                      className="rounded-lg border border-primary px-4 py-2 text-xs font-extrabold text-primary transition hover:bg-primary hover:text-white"
                                    >
                                      Select this hotel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </main>
              </>
            )}

            <footer className="flex shrink-0 flex-col gap-3 border-t border-[#e9edf3] bg-gradient-to-r from-[#fffaf7] via-white to-[#f8fbff] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-primary shadow-sm">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#172033]">
                    Review your package change
                    <span className="ml-1.5 text-[10px] font-semibold text-[#667085]">GST included</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#667085]">
                    {hasRoomChange
                      ? `${pendingRoomPlan?.roomName} · ${pendingRoomPlan?.planName}`
                      : hasPricedChange
                        ? `${pendingOption?.name ?? "Selected hotel"} is ready to update`
                        : mode === "room"
                          ? "Choose the room and meal option that suits your stay"
                          : "Choose a hotel to see how it affects your package price"}
                  </p>
                </div>
                {hasPricedChange && mode !== "room" && (
                  <span className={cn(
                    "ml-auto hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold sm:inline-flex",
                    pendingDelta > 0 ? "bg-orange-100 text-primary" : pendingDelta < 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                  )}>
                    {pendingDelta === 0 ? "Same package price" : `${pendingDelta > 0 ? "+" : "−"}₹${fmtINR(Math.abs(pendingDelta))}`}
                  </span>
                )}
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[#dce2ea] bg-white px-5 py-2.5 text-sm font-bold text-[#344054] transition hover:bg-slate-50 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={commit}
                  disabled={!canCommit}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition sm:flex-none",
                    canCommit
                      ? "bg-primary text-white shadow-[0_8px_18px_rgba(255,107,0,0.22)] hover:bg-[#e85d00]"
                      : "cursor-not-allowed bg-slate-100 text-slate-400",
                  )}
                >
                  {canCommit
                    ? `Update ${mode === "room" ? "Room" : "Hotel"}`
                    : mode === "room"
                      ? "Select room & meal plan"
                      : "Choose a different hotel"}
                  <span className="text-xl leading-none">›</span>
                </button>
              </div>
            </footer>
          </motion.section>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
