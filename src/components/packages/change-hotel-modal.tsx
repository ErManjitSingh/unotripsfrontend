"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { BedDouble, Check, Search, Sparkles, Star, Users, UtensilsCrossed, X } from "lucide-react";
import type { DestinationHotels, HotelOption } from "@/lib/package-customizer-data";
import { fmtINR } from "@/lib/package-customizer-data";
import { cn } from "@/lib/utils";

export type ChangeHotelModalProps = {
  open: boolean;
  onClose: () => void;
  destination: DestinationHotels | undefined;
  selectedIndex: number;
  /** Real check-in date for this destination leg, only when the visitor picked a travel date upstream. */
  checkIn: Date | null;
  onSelect: (index: number) => void;
};

const STAR_FILTERS = [3, 4, 5] as const;
const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** One physical hotel, with its real room-type options grouped under it —
 *  the backend can (and sometimes does) offer the same hotel with more than
 *  one room_type/price_delta as separate entries; we group by name so
 *  switching rooms within a hotel is a distinct action from switching hotels. */
type HotelGroup = {
  name: string;
  img: string;
  desc: string;
  stars: number;
  pop: boolean;
  rooms: Array<{ opt: HotelOption; index: number }>;
};

function groupByHotel(opts: HotelOption[]): HotelGroup[] {
  const order: string[] = [];
  const map = new Map<string, HotelGroup>();
  opts.forEach((opt, index) => {
    if (!map.has(opt.name)) {
      map.set(opt.name, { name: opt.name, img: opt.img, desc: opt.desc, stars: opt.stars, pop: opt.pop, rooms: [] });
      order.push(opt.name);
    }
    const g = map.get(opt.name)!;
    g.rooms.push({ opt, index });
    if (opt.pop) g.pop = true;
  });
  return order.map((name) => map.get(name)!);
}

/** Real per-room price delta vs. the currently selected option — not vs. the cheapest room. */
function priceDeltaVsCurrent(extra: number, currentExtra: number): number {
  return extra - currentExtra;
}

function formatDateRange(checkIn: Date | null, nights: number): string | null {
  if (!checkIn) return null;
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + nights);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  return `${fmt(checkIn)} – ${fmt(checkOut)}`;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function ChangeHotelModal({
  open, onClose, destination, selectedIndex, checkIn, onSelect,
}: ChangeHotelModalProps) {
  const [query, setQuery] = useState("");
  const [minStars, setMinStars] = useState<number | null>(null);
  const [sort, setSort] = useState<SortValue>("popularity");
  const mounted = useMounted();

  const currentExtra = destination?.opts[selectedIndex]?.extra ?? 0;

  const groups = useMemo(() => {
    if (!destination) return [];
    const q = query.trim().toLowerCase();
    const all = groupByHotel(destination.opts);
    const matches = all.filter((g) => {
      if (minStars && g.stars < minStars) return false;
      if (q && !g.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const containsSelected = (g: HotelGroup) => g.rooms.some((r) => r.index === selectedIndex);
    const selectedGroup = matches.find(containsSelected);
    const rest = matches.filter((g) => g !== selectedGroup);
    const cheapest = (g: HotelGroup) => Math.min(...g.rooms.map((r) => r.opt.extra));
    if (sort === "price_asc") rest.sort((a, b) => cheapest(a) - cheapest(b));
    else if (sort === "price_desc") rest.sort((a, b) => cheapest(b) - cheapest(a));
    else rest.sort((a, b) => Number(b.pop) - Number(a.pop));
    return selectedGroup ? [selectedGroup, ...rest] : rest;
  }, [destination, minStars, query, sort, selectedIndex]);

  if (!mounted) return null;

  const dateRangeLabel = destination ? formatDateRange(checkIn, destination.nights) : null;
  const searchInputClass =
    "h-9 w-full rounded-full border border-[#e0e0e0] bg-[#fafafa] pl-8 pr-3 text-[12px] text-[#1a1a1a] placeholder:text-[#9e9e9e] focus:border-primary focus:bg-white focus:outline-none";

  return createPortal(
    <AnimatePresence>
      {open && destination ? (
        <>
          <motion.button
            type="button"
            key="change-hotel-backdrop"
            aria-label="Close change hotel panel"
            className="fixed inset-0 z-[220] bg-slate-900/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
          <motion.aside
            key="change-hotel-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Change hotel"
            className="fixed right-0 top-0 z-[230] flex h-[100dvh] w-full max-w-[680px] flex-col bg-white shadow-[-12px_0_48px_-12px_rgba(15,23,42,0.35)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#f0f0f0] px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#1a1a1a]">Change Hotel</h2>
                <p className="truncate text-[11px] text-[#9e9e9e]">{destination.dest} · {destination.nights} night{destination.nights === 1 ? "" : "s"}</p>
              </div>
              <button type="button" onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9e9e9e] transition hover:bg-[#f5f5f5] hover:text-[#1a1a1a]">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="shrink-0 border-b border-[#f0f0f0] px-5 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9e9e9e]" aria-hidden />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by hotel name"
                  aria-label="Search by hotel name" className={searchInputClass} />
              </div>
            </div>

            {/* Filters */}
            <div className="flex shrink-0 flex-wrap items-end gap-4 border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9e9e9e]">Star Rating</p>
                <div className="flex gap-1.5">
                  {STAR_FILTERS.map((n) => (
                    <button key={n} type="button" onClick={() => setMinStars(minStars === n ? null : n)}
                      aria-pressed={minStars === n}
                      className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                        minStars === n ? "border-primary bg-primary text-white" : "border-[#e0e0e0] bg-white text-[#616161] hover:border-primary/40")}>
                      {n}★
                    </button>
                  ))}
                </div>
              </div>
              <label className="ml-auto flex items-center gap-2 text-[11px] text-[#616161]">
                <span className="font-medium">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortValue)}
                  className="rounded-md border border-[#e0e0e0] bg-white px-2 py-1.5 text-[11px] font-medium text-[#1a1a1a]">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>

            <p className="shrink-0 px-5 py-2.5 text-[12px] text-[#616161]">
              Showing <b className="font-bold text-[#1a1a1a]">{groups.length}</b> stay{groups.length === 1 ? "" : "s"} in {destination.dest}
            </p>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {groups.length === 0 ? (
                <p className="py-10 text-center text-[12px] text-[#9e9e9e]">No hotels match your filters. Try clearing them.</p>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => {
                    const groupIsSelected = group.rooms.some((r) => r.index === selectedIndex);
                    return (
                      <div key={group.name}
                        className={cn("overflow-hidden rounded-xl border-[1.5px] transition",
                          groupIsSelected ? "border-primary bg-orange-50/50" : "border-[#e8e8e8] bg-white")}>
                        {/* Hotel header */}
                        <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-28 sm:w-32">
                            <Image src={group.img} alt="" fill className="object-cover" sizes="128px" />
                            {groupIsSelected && (
                              <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                <Check className="h-2.5 w-2.5" aria-hidden />Selected
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-sm font-bold text-[#1a1a1a]">{group.name}</p>
                              {group.pop && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#C9A84C]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9A7B1F]">
                                  <Sparkles className="h-2.5 w-2.5" aria-hidden />Popular
                                </span>
                              )}
                            </div>
                            <span className="mt-0.5 flex">{Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-3 w-3", i < group.stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} aria-hidden />
                            ))}</span>
                            {dateRangeLabel && <p className="mt-1 text-[11px] text-[#9e9e9e]">{dateRangeLabel}</p>}
                            {group.desc && <p className="mt-1.5 text-[11px] leading-relaxed text-[#757575]">{group.desc}</p>}
                            {group.rooms.length > 1 && (
                              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9e9e9e]">
                                {group.rooms.length} room types available
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Room options within this hotel */}
                        <div className="divide-y divide-[#f0f0f0] border-t border-[#f0f0f0]">
                          {group.rooms.map(({ opt, index }) => {
                            const isSelected = index === selectedIndex;
                            const delta = priceDeltaVsCurrent(opt.extra, currentExtra);
                            return (
                              <div key={opt.id} className={cn("flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4", isSelected && "bg-orange-50/70")}>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#616161]">
                                    <span className="inline-flex items-center gap-1 font-semibold text-[#1a1a1a]">
                                      <BedDouble className="h-3 w-3 shrink-0 text-[#9e9e9e]" aria-hidden />{opt.roomType ?? "Standard"} Room
                                    </span>
                                    {opt.maxGuests && (
                                      <span className="inline-flex items-center gap-1">
                                        <Users className="h-3 w-3 shrink-0 text-[#9e9e9e]" aria-hidden />Up to {opt.maxGuests} guests
                                      </span>
                                    )}
                                  </div>
                                  {opt.mealsIncluded && opt.mealsIncluded.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {opt.mealsIncluded.map((m) => (
                                        <span key={m} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                          <UtensilsCrossed className="h-2.5 w-2.5" aria-hidden />{m} included
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {!!opt.extraBedPrice && opt.extraBedPrice > 0 && (
                                    <p className="mt-1 text-[10px] text-[#9e9e9e]">+₹{fmtINR(opt.extraBedPrice)} for an extra bed</p>
                                  )}
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                  {isSelected ? (
                                    <span className="text-[11px] font-semibold text-primary">Currently selected</span>
                                  ) : delta === 0 ? (
                                    <span className="text-[11px] font-semibold text-[#616161]">Same price</span>
                                  ) : (
                                    <span className={cn("text-sm font-bold", delta > 0 ? "text-primary" : "text-emerald-700")}>
                                      {delta > 0 ? "+" : "−"}₹{fmtINR(Math.abs(delta))}
                                      <span className="ml-1 text-[10px] font-normal text-[#9e9e9e]">/ person</span>
                                    </span>
                                  )}
                                  {!isSelected && (
                                    <button type="button" onClick={() => { onSelect(index); onClose(); }}
                                      className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90">
                                      Select
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
