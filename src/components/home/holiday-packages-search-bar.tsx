"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

export type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

export type SearchBarProps = {
  className?: string;
  /** From server: destinations index + packages list for live suggestions. */
  catalog?: HeroSearchCatalog;
};

type PackageMode = {
  id: string;
  label: string;
  thumb: string | null;
};

const PACKAGE_MODES: PackageMode[] = [
  { id: "search", label: "Search", thumb: null },
  {
    id: "honeymoon",
    label: "Honeymoon",
    thumb:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=80&q=70",
  },
  {
    id: "family",
    label: "Family Package",
    thumb:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=80&q=70",
  },
  {
    id: "trending",
    label: "Trending tour packages",
    thumb:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=80&q=70",
  },
  {
    id: "lastminute",
    label: "Last Minute Deals",
    thumb:
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=80&q=70",
  },
];

const TRENDING_PLACES: { label: string; query: string; accent: string }[] = [
  { label: "Himachal", query: "Himachal", accent: "text-emerald-600 hover:text-emerald-500" },
  { label: "Sikkim", query: "Sikkim", accent: "text-cyan-600 hover:text-cyan-500" },
  { label: "Kashmir", query: "Kashmir", accent: "text-sky-600 hover:text-sky-500" },
  { label: "Leh Ladakh", query: "Leh Ladakh", accent: "text-amber-600 hover:text-amber-500" },
  { label: "Arunachal", query: "Arunachal", accent: "text-violet-600 hover:text-violet-500" },
];

const EMPTY_CATALOG: HeroSearchCatalog = { destinations: [], packages: [] };

function matchesQuery(qRaw: string, ...parts: (string | undefined | null)[]) {
  const q = qRaw.trim().toLowerCase();
  if (!q) return false;
  const hay = parts.filter(Boolean).join(" ").toLowerCase();
  return hay.includes(q);
}

/** Fixed calendar labels — no `Intl` (Node vs browser ICU can differ and break hydration). */
const MO_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const WD_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function formatTravelDate(iso: string): { line: string; weekday: string } {
  if (!iso) return { line: "Pick date", weekday: "" };
  const [y, m, d] = iso.split("-").map((x) => Number.parseInt(x, 10));
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31)
    return { line: "Pick date", weekday: "" };
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (Number.isNaN(utc.getTime())) return { line: "Pick date", weekday: "" };
  return {
    line: `${d} ${MO_SHORT[m - 1]}, ${y}`,
    weekday: WD_LONG[utc.getUTCDay()],
  };
}

/** `YYYY-MM-DD` in the user's local calendar (for `<input type="date" />`). */
function localDateInputString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Holiday Packages hero search: package tabs, fields, trending places, SEARCH. */
const GUEST_MIN = 1;
const GUEST_MAX = 30;

export function HolidayPackagesSearchBar({ className, catalog: catalogProp }: SearchBarProps) {
  const catalog = catalogProp ?? EMPTY_CATALOG;
  const router = useRouter();
  const [packageMode, setPackageMode] = useState("search");
  const [to, setTo] = useState("");
  const [departIso, setDepartIso] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [toOpen, setToOpen] = useState(false);
  const toWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setDepartIso((prev) => (prev === "" ? localDateInputString() : prev));
  }, []);

  const departFmt = useMemo(() => formatTravelDate(departIso), [departIso]);

  const trimmedTo = to.trim();

  const suggestionDestinations = useMemo(() => {
    if (!trimmedTo) return [];
    return catalog.destinations
      .filter((d) =>
        matchesQuery(trimmedTo, d.name, d.region, d.slug.replace(/-/g, " ")),
      )
      .slice(0, 6);
  }, [catalog.destinations, trimmedTo]);

  const suggestionPackages = useMemo(() => {
    if (trimmedTo) {
      return catalog.packages
        .filter((p) =>
          matchesQuery(
            trimmedTo,
            p.title,
            p.location,
            p.slug.replace(/-/g, " "),
          ),
        )
        .slice(0, 8);
    }
    return catalog.packages.slice(0, 6);
  }, [catalog.packages, trimmedTo]);

  const showSuggestionsPanel =
    toOpen &&
    (suggestionDestinations.length > 0 || suggestionPackages.length > 0);

  useEffect(() => {
    if (!toOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (toWrapRef.current && !toWrapRef.current.contains(e.target as Node)) {
        setToOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [toOpen]);

  const openDatePicker = useCallback(() => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dest = String(fd.get("to") ?? "").trim();
    setToOpen(false);
    if (!dest) {
      router.push("/packages");
      return;
    }
    router.push(`/packages?q=${encodeURIComponent(dest)}`);
  };

  const applyTrendingPlace = (query: string) => {
    setTo(query);
    setToOpen(true);
  };

  return (
    <div
      className={cn(
        "relative z-20 mx-auto w-full max-w-5xl px-1 sm:px-0",
        className,
      )}
    >
      <div className="relative overflow-visible rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_48px_-12px_rgba(15,23,42,0.2)] sm:rounded-3xl">
        {/* Package type tabs */}
        <div className="flex gap-2 overflow-x-auto rounded-t-2xl border-b border-slate-100 px-2 py-2 sm:gap-3 sm:rounded-t-3xl sm:px-4 sm:py-2.5">
          {PACKAGE_MODES.map((m) => {
            const active = packageMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPackageMode(m.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-2 py-1 pr-3 text-left text-[11px] font-semibold transition sm:text-xs",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
                )}
              >
                {m.thumb ? (
                  <Image
                    src={m.thumb}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover"
                    sizes="32px"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Search className="h-3.5 w-3.5" aria-hidden />
                  </span>
                )}
                <span className="max-w-[8.5rem] leading-snug sm:max-w-[10rem]">
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={onSubmit}
          className="relative px-3 pb-16 pt-3 sm:px-5 sm:pb-[4.25rem] sm:pt-4"
        >
          <div className="grid gap-0 overflow-visible rounded-xl border border-slate-200 bg-slate-50/50 sm:grid-cols-2 lg:grid-cols-4">
            <div
              ref={toWrapRef}
              className="relative flex cursor-pointer flex-col gap-0.5 border-b border-slate-100 p-3 sm:border-b-0 sm:border-r lg:border-r"
            >
              <span className="text-[10px] font-semibold text-slate-500">
                To City/Country/Category
              </span>
              <Input
                name="to"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setToOpen(true);
                }}
                onFocus={() => setToOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setToOpen(false);
                }}
                autoComplete="off"
                className="h-auto border-0 bg-transparent p-0 text-base font-bold text-slate-900 shadow-none placeholder:text-slate-300 focus-visible:ring-0 sm:text-lg"
                placeholder="Search Destination"
              />
              {showSuggestionsPanel ? (
                <div
                  className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-[min(70vh,22rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 text-left shadow-xl sm:left-2 sm:right-2"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {suggestionDestinations.length > 0 ? (
                    <div className="border-b border-slate-100 pb-2">
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Destinations
                      </p>
                      {suggestionDestinations.map((d) => (
                        <Link
                          key={d.slug}
                          href={`/destinations/${encodeURIComponent(d.slug)}`}
                          className="block px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                          onClick={() => setToOpen(false)}
                        >
                          {d.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {suggestionPackages.length > 0 ? (
                    <div className="pt-1">
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {trimmedTo
                          ? "Packages"
                          : packageMode === "trending"
                            ? "Trending tour packages"
                            : "Popular packages"}
                      </p>
                      {suggestionPackages.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/packages/${encodeURIComponent(p.slug)}`}
                          className="block px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                          onClick={() => setToOpen(false)}
                        >
                          {p.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={openDatePicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDatePicker();
                }
              }}
              className="flex cursor-pointer flex-col gap-0.5 border-b border-slate-100 p-3 sm:border-b-0 sm:border-r lg:border-r"
            >
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-500">
                Travel date
                <ChevronDown className="h-3 w-3 text-primary" aria-hidden />
              </span>
              <span className="text-base font-bold text-slate-900 sm:text-lg">
                {departFmt.line}
              </span>
              {departFmt.weekday ? (
                <span className="text-[10px] text-slate-500">
                  {departFmt.weekday}
                </span>
              ) : null}
              <input
                ref={dateInputRef}
                type="date"
                name="depart"
                value={departIso}
                onChange={(e) => setDepartIso(e.target.value)}
                className="sr-only"
                aria-label="Travel date"
              />
            </div>

            <div className="flex flex-col gap-1.5 border-b border-slate-100 p-3 sm:border-b-0 sm:border-r lg:border-r">
              <span className="text-[10px] font-semibold text-slate-500">
                Guests
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full border-slate-200"
                  aria-label="Fewer guests"
                  disabled={guestCount <= GUEST_MIN}
                  onClick={() =>
                    setGuestCount((n) => Math.max(GUEST_MIN, n - 1))
                  }
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </Button>
                <span className="min-w-[5.5rem] text-center text-base font-bold text-slate-900 sm:text-lg">
                  {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full border-slate-200"
                  aria-label="More guests"
                  disabled={guestCount >= GUEST_MAX}
                  onClick={() =>
                    setGuestCount((n) => Math.min(GUEST_MAX, n + 1))
                  }
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <input type="hidden" name="guests" value={guestCount} />
            </div>

            <button
              type="button"
              className="flex flex-col gap-0.5 p-3 text-left"
            >
              <span className="text-[10px] font-semibold text-slate-500">
                Filters
              </span>
              <span className="text-sm font-bold text-slate-900 sm:text-base">
                Select Filters (Optional)
              </span>
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0 flex-1 rounded-lg border border-fuchsia-200/60 bg-gradient-to-r from-rose-50/90 via-amber-50/70 to-cyan-50/90 px-2.5 py-1.5 shadow-sm ring-1 ring-white/60 sm:px-3 sm:py-2">
              <p className="bg-gradient-to-r from-orange-600 via-pink-600 to-violet-600 bg-clip-text text-[9px] font-bold uppercase tracking-[0.14em] text-transparent sm:text-[10px]">
                Trending places
              </p>
              <div
                className="mt-1 flex flex-nowrap items-center gap-x-0 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="list"
                aria-label="Trending places"
              >
                {TRENDING_PLACES.map((place, index) => (
                  <span
                    key={place.query}
                    className="inline-flex shrink-0 items-center whitespace-nowrap"
                  >
                    {index > 0 ? (
                      <span
                        className={cn(
                          "select-none px-1.5 text-[10px] sm:px-2",
                          index % 4 === 1 && "text-rose-400",
                          index % 4 === 2 && "text-amber-400",
                          index % 4 === 3 && "text-cyan-400",
                          index % 4 === 0 && "text-violet-400",
                        )}
                        aria-hidden
                      >
                        ·
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => applyTrendingPlace(place.query)}
                      className={cn(
                        "text-left text-[11px] font-semibold tracking-tight underline-offset-2 transition hover:underline sm:text-xs",
                        place.accent,
                      )}
                    >
                      {place.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <p className="shrink-0 self-end text-right text-[9px] font-medium text-slate-400 sm:self-center sm:text-[10px]">
              Holiday Packages
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 -bottom-5 flex justify-center sm:-bottom-6">
            <Button
              type="submit"
              className="pointer-events-auto min-w-[min(100%,15rem)] rounded-full border-0 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 px-12 py-6 text-base font-bold uppercase tracking-[0.14em] text-slate-950 shadow-[0_14px_32px_-6px_rgba(234,88,12,0.45)] transition hover:brightness-105 sm:min-w-[17rem] sm:px-16 sm:text-lg"
            >
              SEARCH
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
