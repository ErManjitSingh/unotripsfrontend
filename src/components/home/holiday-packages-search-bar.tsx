"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, ChevronDown, ChevronLeft, ChevronRight, Crosshair,
  Headphones, Lock, MapPin, Minus, Plus,
  Search, ShieldCheck, SlidersHorizontal, Tag, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

// ─── Constants ────────────────────────────────────────────────────────────────

const PACKAGE_TABS = [
  { id: "search",       label: "Search",              thumb: null,   icon: "search" },
  { id: "honeymoon",    label: "Honeymoon",            thumb: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=80&q=70", icon: null },
  { id: "family",       label: "Family Package",        thumb: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=80&q=70", icon: null },
  { id: "group",        label: "Group Tour Packages",   thumb: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=80&q=70", icon: null },
  { id: "lastminute",   label: "Last Minute Deals",     thumb: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=80&q=70", icon: null },
  { id: "bestprice",    label: "Best Price Guarantee",  thumb: null,   icon: "shield" },
] as const;

const FROM_CITIES = [
  { city: "New Delhi",  country: "India" },
  { city: "Mumbai",     country: "India" },
  { city: "Bangalore",  country: "India" },
  { city: "Chennai",    country: "India" },
  { city: "Kolkata",    country: "India" },
  { city: "Hyderabad",  country: "India" },
  { city: "Pune",       country: "India" },
  { city: "Ahmedabad",  country: "India" },
  { city: "Jaipur",     country: "India" },
  { city: "Chandigarh", country: "India" },
];

const TRENDING_PLACES = ["Himachal", "Kashmir", "Ladakh", "Kerala", "Goa", "Sikkim"];

const POPULAR_TO_CITIES = ["Shimla", "Dharamshala", "Leh", "Manali", "Jaipur", "Vrindavan"];

const BUDGET_OPTIONS   = ["Under ₹10K", "₹10K–₹20K", "₹20K–₹50K", "Above ₹50K"];
const DURATION_OPTIONS = ["1–3 Days", "4–6 Days", "7–10 Days", "10+ Days"];
const TYPE_OPTIONS     = ["Beach", "Mountain", "Heritage", "Wildlife", "Adventure", "Pilgrimage"];

const MO_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"] as const;
const MO_SHORT  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const WD_HEADS  = ["Su","Mo","Tu","We","Th","Fr","Sa"] as const;

const EMPTY_CATALOG: HeroSearchCatalog = { destinations: [], packages: [] };

// Curated destinations shown when a category tab is selected (instead of filling the To field)
const TAB_CURATED: Record<string, { heading: string; places: string[]; featured: { name: string; img: string }[] }> = {
  honeymoon: {
    heading: "Popular Honeymoon Destinations",
    places: ["Maldives", "Bali", "Thailand", "Mauritius", "Seychelles", "Goa", "Kashmir", "Kerala", "Switzerland", "Andaman"],
    featured: [
      { name: "Maldives",   img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=220&q=80" },
      { name: "Bali",       img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=220&q=80" },
      { name: "Santorini",  img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=220&q=80" },
      { name: "View All",   img: "" },
    ],
  },
  family: {
    heading: "Popular Family Destinations",
    places: ["Goa", "Rajasthan", "Himachal", "Kerala", "Andaman", "Manali", "Shimla", "Ooty", "Mussoorie", "Nainital"],
    featured: [
      { name: "Goa",        img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=220&q=80" },
      { name: "Rajasthan",  img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=220&q=80" },
      { name: "Andaman",    img: "https://images.unsplash.com/photo-1589741532720-6d50d2d8c5dd?w=220&q=80" },
      { name: "View All",   img: "" },
    ],
  },
  group: {
    heading: "Popular Group Tour Destinations",
    places: ["Rajasthan", "Kerala", "Himachal", "Kashmir", "Andaman", "North East", "Sikkim", "Ladakh", "Uttarakhand", "Meghalaya"],
    featured: [
      { name: "Rajasthan",  img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=220&q=80" },
      { name: "Kerala",     img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=220&q=80" },
      { name: "Himachal",   img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=220&q=80" },
      { name: "View All",   img: "" },
    ],
  },
  lastminute: {
    heading: "Last Minute Deals",
    places: ["Goa", "Manali", "Shimla", "Mussoorie", "Ooty", "Rishikesh", "Coorg", "Jim Corbett", "Ranthambore", "Kodaikanal"],
    featured: [
      { name: "Goa",        img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=220&q=80" },
      { name: "Manali",     img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=220&q=80" },
      { name: "Rishikesh",  img: "https://images.unsplash.com/photo-1585016495481-91613ea2a4cb?w=220&q=80" },
      { name: "View All",   img: "" },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calendarGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const days     = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatSelectedDate(iso: string) {
  if (!iso) return { primary: "Select Date", sub: "" };
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return { primary: "Select Date", sub: "" };
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const wd = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getUTCDay()];
  return { primary: `${d} ${MO_SHORT[m - 1]}, ${y}`, sub: wd };
}

function matchesQuery(q: string, ...parts: (string | undefined | null)[]) {
  const lq = q.trim().toLowerCase();
  if (!lq) return false;
  return parts.filter(Boolean).join(" ").toLowerCase().includes(lq);
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb, enabled]);
}

// ─── Date Picker Dropdown ─────────────────────────────────────────────────────

function DatePickerPanel({
  value, onChange, onClose,
}: { value: string; onChange: (iso: string) => void; onClose: () => void }) {
  const today = new Date();
  const [year,  setYear]  = useState(() => value ? Number(value.split("-")[0]) : today.getFullYear());
  const [month, setMonth] = useState(() => value ? Number(value.split("-")[1]) - 1 : today.getMonth());

  const cells = useMemo(() => calendarGrid(year, month), [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const isPast = (d: number) =>
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth()) ||
    (year === today.getFullYear() && month === today.getMonth() && d < today.getDate());

  const selectedDay = value?.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
    ? Number(value.split("-")[2])
    : null;

  const pick = (d: number) => {
    onChange(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    onClose();
  };

  return (
    <div className="absolute left-0 top-full z-[200] mt-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
        <span className="text-sm font-bold text-slate-900">{MO_NAMES[month]} {year}</span>
        <button type="button" onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100">
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-px">
        {WD_HEADS.map(d => (
          <div key={d} className="py-1 text-center text-[10px] font-bold uppercase text-slate-400">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={!d || isPast(d)}
            onClick={() => d && !isPast(d) && pick(d)}
            className={cn(
              "flex h-8 w-full items-center justify-center rounded-full text-sm transition",
              !d && "pointer-events-none",
              d && isPast(d) && "cursor-not-allowed text-slate-300",
              d && !isPast(d) && d === selectedDay && "bg-primary font-bold text-white",
              d && !isPast(d) && d !== selectedDay && "text-slate-700 hover:bg-primary/10 hover:text-primary",
            )}
          >
            {d ?? ""}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Rooms & Guests Dropdown ──────────────────────────────────────────────────

type GuestState = { rooms: number; adults: number; children: number };

function RoomsGuestsPanel({
  value, onChange, onClose,
}: { value: GuestState; onChange: (v: GuestState) => void; onClose: () => void }) {
  const [local, setLocal] = useState(value);

  const counter = (label: string, key: keyof GuestState, min: number, max: number, sub?: string) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={local[key] <= min}
          onClick={() => setLocal(p => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-slate-900">{local[key]}</span>
        <button
          type="button"
          disabled={local[key] >= max}
          onClick={() => setLocal(p => ({ ...p, [key]: Math.min(max, p[key] + 1) }))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute left-0 top-full z-[200] mt-2 w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      {counter("Rooms", "rooms", 1, 8)}
      {counter("Adults", "adults", 1, 30, "12+ years")}
      {counter("Children", "children", 0, 10, "Below 12 years")}
      <button
        type="button"
        onClick={() => { onChange(local); onClose(); }}
        className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        Apply
      </button>
    </div>
  );
}

// ─── Filters Dropdown ─────────────────────────────────────────────────────────

type FiltersState = { budget: string; duration: string; type: string };

function FiltersPanel({
  value, onChange, onClose,
}: { value: FiltersState; onChange: (v: FiltersState) => void; onClose: () => void }) {
  const [local, setLocal] = useState(value);

  const toggle = (key: keyof FiltersState, opt: string) =>
    setLocal(p => ({ ...p, [key]: p[key] === opt ? "" : opt }));

  const pills = (key: keyof FiltersState, options: string[]) => (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(key, opt)}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
            local[key] === opt
              ? "border-primary bg-primary text-white"
              : "border-slate-200 text-slate-600 hover:border-primary hover:text-primary",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const hasFilters = local.budget || local.duration || local.type;

  return (
    <div className="absolute right-0 top-full z-[200] mt-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900">Filters</span>
        {hasFilters && (
          <button type="button" onClick={() => setLocal({ budget: "", duration: "", type: "" })} className="text-[11px] font-semibold text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Budget per person</p>
      {pills("budget", BUDGET_OPTIONS)}
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Duration</p>
      {pills("duration", DURATION_OPTIONS)}
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Trip Type</p>
      {pills("type", TYPE_OPTIONS)}
      <button
        type="button"
        onClick={() => { onChange(local); onClose(); }}
        className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        Apply Filters
      </button>
    </div>
  );
}

// ─── Trust Badges Bar ─────────────────────────────────────────────────────────

export function TrustBadgesBar({ className }: { className?: string }) {
  const items = [
    { icon: ShieldCheck, title: "Best Price Guarantee",  sub: "Find a lower price? We'll match it" },
    { icon: Calendar,    title: "Easy Booking",           sub: "Quick, secure & hassle-free" },
    { icon: Users,       title: "Trusted by Travelers",   sub: "4.8 ★ rating from 10M+ guests" },
    { icon: Lock,        title: "Secure Payments",        sub: "100% safe & encrypted" },
  ];
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2 sm:gap-2.5", className)}>
      {items.map(({ icon: Icon, title, sub }) => (
        <div
          key={title}
          className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 backdrop-blur-md transition hover:bg-white/[0.11] sm:px-5 sm:py-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Icon className="h-[15px] w-[15px] text-amber-300" strokeWidth={1.8} />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-[11.5px] font-bold text-white">{title}</p>
            <p className="text-[10.5px] text-white/55">{sub}</p>
          </div>
          <p className="text-[11.5px] font-bold text-white sm:hidden">{title}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export type HolidayPackagesSearchBarProps = {
  className?: string;
  catalog?: HeroSearchCatalog;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
};

export function HolidayPackagesSearchBar({ className, catalog: rawCatalog, initialFrom, initialTo, initialDate }: HolidayPackagesSearchBarProps) {
  const catalog = rawCatalog ?? EMPTY_CATALOG;
  const router  = useRouter();

  // Tab
  const [mode, setMode] = useState("search");

  // From City
  const [from, setFrom]         = useState(initialFrom ?? "New Delhi");
  const [fromOpen, setFromOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  useOutsideClick(fromRef, () => setFromOpen(false), fromOpen);

  const filteredFrom = useMemo(() =>
    from.trim() ? FROM_CITIES.filter(c => c.city.toLowerCase().includes(from.toLowerCase())) : FROM_CITIES,
    [from],
  );

  // To City
  const [to, setTo]         = useState(initialTo ?? "");
  const [toOpen, setToOpen] = useState(false);
  const toRef = useRef<HTMLDivElement>(null);
  useOutsideClick(toRef, () => setToOpen(false), toOpen);

  const destHits = useMemo(() => {
    const q = to.trim();
    if (!q || q.length < 2) return [];
    return catalog.destinations.filter(d => matchesQuery(q, d.name, d.slug.replace(/-/g, " "))).slice(0, 5);
  }, [catalog.destinations, to]);

  const pkgHits = useMemo(() => {
    const q = to.trim();
    if (!q || q.length < 2) return [];
    return catalog.packages.filter(p => matchesQuery(q, p.title, p.location, p.slug.replace(/-/g, " "))).slice(0, 4);
  }, [catalog.packages, to]);

  // Worldwide city search via Photon (OpenStreetMap) — no API key needed
  type CityHit = { name: string; country: string; state: string };
  const [cityHits, setCityHits]     = useState<CityHit[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCities = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setCityLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lang=en`,
        { signal: abortRef.current.signal },
      );
      const data = await res.json();
      const hits: CityHit[] = (data.features ?? [])
        .filter((f: { properties: { type?: string; name?: string; country?: string } }) =>
          ["city", "town", "village", "municipality", "suburb"].includes(f.properties.type ?? "") &&
          f.properties.name,
        )
        .slice(0, 6)
        .map((f: { properties: { name: string; country?: string; state?: string } }) => ({
          name:    f.properties.name,
          country: f.properties.country ?? "",
          state:   f.properties.state   ?? "",
        }));
      setCityHits(hits);
    } catch {
      // AbortError or network error — silently ignore
    } finally {
      setCityLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = to.trim();
    if (!q || q.length < 2) { setCityHits([]); return; }
    const id = setTimeout(() => fetchCities(q), 320);
    return () => clearTimeout(id);
  }, [to, fetchCities]);

  // Date
  const [dateIso, setDateIso]   = useState(initialDate ?? "");
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dateRef, () => setDateOpen(false), dateOpen);
  useLayoutEffect(() => {
    if (!dateIso) {
      const t = new Date();
      setDateIso(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`);
    }
  }, [dateIso]);
  const dateFmt = useMemo(() => formatSelectedDate(dateIso), [dateIso]);

  // Rooms & Guests
  const [guests, setGuests]         = useState<GuestState>({ rooms: 1, adults: 2, children: 0 });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  useOutsideClick(guestsRef, () => setGuestsOpen(false), guestsOpen);
  const guestsMain = `${guests.rooms} Room${guests.rooms > 1 ? "s" : ""}, ${guests.adults} Adult${guests.adults > 1 ? "s" : ""}`;
  const guestsSub  = `${guests.children} ${guests.children === 1 ? "Child" : "Children"}`;

  // Filters
  const [filters, setFilters]         = useState<FiltersState>({ budget: "", duration: "", type: "" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  useOutsideClick(filtersRef, () => setFiltersOpen(false), filtersOpen);
  const activeFilters = [filters.budget, filters.duration, filters.type].filter(Boolean).length;

  // Tab click — never pre-fill To field; category tabs open the curated megamenu
  const onTabClick = (id: string) => {
    if (mode === id) {
      setMode("search");   // clicking active category tab deselects it
      return;
    }
    setMode(id);
    setTo("");
    setToOpen(false);
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (to.trim())            params.set("q",        to.trim());
    if (from.trim())          params.set("from",      from.trim());
    if (dateIso)              params.set("date",      dateIso);
    if (guests.rooms > 1)     params.set("rooms",     String(guests.rooms));
    if (guests.adults > 0)    params.set("adults",    String(guests.adults));
    if (guests.children > 0)  params.set("children",  String(guests.children));
    if (mode !== "search")    params.set("mode",      mode);
    if (filters.budget)       params.set("budget",    filters.budget);
    if (filters.duration)     params.set("duration",  filters.duration);
    if (filters.type)         params.set("type",      filters.type);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <div className={cn("mx-auto w-full max-w-5xl", className)}>

      {/* ── White search card ─────────────────────────────── */}
      <div className="overflow-visible rounded-[28px] border border-white/60 bg-white/[0.97] shadow-[0_32px_80px_-16px_rgba(5,8,16,0.55)] backdrop-blur-xl sm:rounded-[32px]">

        {/* ── Tab row ─────────────────────────────────────── */}
        <div className="flex gap-0.5 overflow-x-auto rounded-t-[28px] border-b border-slate-100 px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1 sm:rounded-t-[32px] sm:px-5 sm:py-3.5">
          {PACKAGE_TABS.map(tab => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabClick(tab.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-[11px]",
                  active ? "text-primary" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {/* Icon / thumb */}
                {tab.thumb ? (
                  <Image
                    src={tab.thumb}
                    alt=""
                    width={22}
                    height={22}
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-full object-cover ring-2 shadow-sm sm:h-[26px] sm:w-[26px]",
                      active ? "ring-primary/40" : "ring-white",
                    )}
                    sizes="26px"
                    unoptimized
                  />
                ) : tab.icon === "shield" ? (
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border sm:h-[26px] sm:w-[26px]", active ? "border-primary/30 bg-primary/10" : "border-slate-200 bg-slate-50")}>
                    <ShieldCheck className={cn("h-3 w-3", active ? "text-primary" : "text-slate-400")} strokeWidth={1.8} />
                  </span>
                ) : (
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full sm:h-[26px] sm:w-[26px]", active ? "bg-primary/10" : "bg-slate-100")}>
                    <Search className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3", active ? "text-primary" : "text-slate-400")} />
                  </span>
                )}
                <span className="whitespace-nowrap">{tab.label}</span>
                {active && <span className="absolute inset-x-2 -bottom-[11px] h-0.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit}>

          {/* ── Category megamenu OR 5-field row (same height, mutually exclusive) ── */}
          {TAB_CURATED[mode] ? (
            /* Compact megamenu — same height as the 5-field row */
            <div className="flex min-h-[90px] items-center gap-4 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
              {/* Destination text links */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {TAB_CURATED[mode].heading}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {TAB_CURATED[mode].places.map(place => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => { setTo(place); setMode("search"); }}
                      className="text-[13px] font-medium text-slate-600 hover:text-primary"
                    >
                      {place}
                    </button>
                  ))}
                </div>
              </div>
              {/* Featured thumbnails — hidden on small screens */}
              <div className="hidden shrink-0 gap-2 sm:flex">
                {TAB_CURATED[mode].featured.map(({ name, img }) =>
                  name === "View All" ? (
                    <button
                      key="view-all"
                      type="button"
                      onClick={() => { setMode("search"); onSubmit(); }}
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-primary/30 text-[9px] font-bold text-primary hover:border-primary hover:bg-primary/5"
                    >
                      View All
                    </button>
                  ) : (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setTo(name); setMode("search"); }}
                      className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                    >
                      <Image src={img} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="56px" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] font-bold leading-tight text-white">{name}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
          /* ── 5-field row ─────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">

            {/* 1 — From City */}
            <div ref={fromRef} className="relative border-b border-slate-100 lg:border-b-0 lg:border-r">
              <button
                type="button"
                onClick={() => setFromOpen(o => !o)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left xl:flex-col xl:items-start xl:gap-0.5 xl:px-5 xl:py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 xl:hidden">
                  <MapPin className="h-5 w-5 text-primary" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <MapPin className="hidden h-3 w-3 xl:block" strokeWidth={2} />
                    From City
                  </span>
                  <span className="text-[15px] font-bold leading-tight text-slate-900 sm:text-[19px]">{from || "Select City"}</span>
                  <span className="text-[11px] text-slate-400">India</span>
                </div>
                <Crosshair className="h-5 w-5 shrink-0 text-primary xl:hidden" strokeWidth={1.5} />
              </button>
              {fromOpen && (
                <div className="absolute left-0 top-full z-[200] mt-1 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                  <div className="px-3 pb-2">
                    <input
                      autoFocus
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                      placeholder="Search city..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  {filteredFrom.map(c => (
                    <button
                      key={c.city}
                      type="button"
                      onClick={() => { setFrom(c.city); setFromOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                    >
                      <span className="text-sm font-semibold text-slate-800">{c.city}</span>
                      <span className="ml-auto text-[11px] text-slate-400">{c.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2 — To City */}
            <div ref={toRef} className="relative border-b border-slate-100 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3 px-4 py-4 xl:flex-col xl:items-start xl:gap-0.5 xl:px-5 xl:py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 xl:hidden">
                  <Search className="h-5 w-5 text-primary" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <Search className="hidden h-3 w-3 xl:block" strokeWidth={2} />
                    To City / Category
                  </span>
                  <input
                    value={to}
                    onChange={e => { setTo(e.target.value); setToOpen(true); }}
                    onFocus={() => setToOpen(true)}
                    onKeyDown={e => { if (e.key === "Escape") setToOpen(false); if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
                    autoComplete="off"
                    placeholder="Search Destination"
                    className="w-full border-0 bg-transparent p-0 text-[15px] font-bold leading-tight text-slate-900 outline-none placeholder:font-bold placeholder:text-slate-300 sm:text-[19px]"
                  />
                  <span className="text-[11px] text-slate-400">{to ? "" : "e.g. Goa, Dubai, Thailand"}</span>
                </div>
              </div>
              {toOpen && to.trim().length < 2 && (
                <div className="absolute left-0 top-full z-[200] mt-1 max-h-[280px] w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-3 shadow-xl">
                  <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Popular Destinations</p>
                  <div className="flex flex-col">
                    {POPULAR_TO_CITIES.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => { setTo(name); setToOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-orange-50"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} />
                        <span className="text-[13px] font-semibold text-slate-800">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {toOpen && to.trim().length >= 2 && (
                <div className="absolute left-0 top-full z-[200] mt-1 max-h-[280px] w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl">

                  {/* World cities from Photon/OpenStreetMap */}
                  {cityLoading && (
                    <div className="flex items-center gap-2 px-4 py-3 text-[12px] text-slate-400">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
                      Searching cities…
                    </div>
                  )}
                  {!cityLoading && cityHits.length > 0 && (
                    <>
                      <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cities &amp; Destinations</p>
                      {cityHits.map((c, i) => (
                        <button
                          key={`${c.name}-${c.country}-${i}`}
                          type="button"
                          onClick={() => { setTo(`${c.name}${c.country ? `, ${c.country}` : ""}`); setToOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                            <p className="truncate text-[11px] text-slate-400">{[c.state, c.country].filter(Boolean).join(", ")}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Catalog packages */}
                  {pkgHits.length > 0 && (
                    <>
                      {cityHits.length > 0 && <div className="my-1 border-t border-slate-100" />}
                      <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Packages</p>
                      {pkgHits.map(p => (
                        <Link key={p.slug} href={`/packages/${p.slug}`} onClick={() => setToOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                          <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate text-sm font-medium text-slate-800">{p.title}</span>
                        </Link>
                      ))}
                    </>
                  )}

                  {/* No results */}
                  {!cityLoading && cityHits.length === 0 && pkgHits.length === 0 && (
                    <p className="px-4 py-3 text-[12px] text-slate-400">No destinations found</p>
                  )}
                </div>
              )}
            </div>

            {/* 3 — Departure Date */}
            <div ref={dateRef} className="relative border-b border-slate-100 lg:border-b-0 lg:border-r">
              <button
                type="button"
                onClick={() => setDateOpen(o => !o)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left xl:flex-col xl:items-start xl:gap-0.5 xl:px-5 xl:py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 xl:hidden">
                  <Calendar className="h-5 w-5 text-primary" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <Calendar className="hidden h-3 w-3 xl:block" strokeWidth={2} />
                    Departure Date
                    <ChevronDown className={cn("hidden h-3 w-3 transition-transform xl:block", dateOpen && "rotate-180")} />
                  </span>
                  <span className="text-[15px] font-bold leading-tight text-slate-900 sm:text-[19px]">{dateFmt.primary}</span>
                  {dateFmt.sub && <span className="text-[11px] text-slate-400">{dateFmt.sub}</span>}
                </div>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform xl:hidden", dateOpen && "rotate-180")} />
              </button>
              {dateOpen && (
                <DatePickerPanel value={dateIso} onChange={setDateIso} onClose={() => setDateOpen(false)} />
              )}
            </div>

            {/* 4 — Rooms & Guests */}
            <div ref={guestsRef} className="relative border-b border-slate-100 lg:border-b-0 lg:border-r">
              <button
                type="button"
                onClick={() => setGuestsOpen(o => !o)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left xl:flex-col xl:items-start xl:gap-0.5 xl:px-5 xl:py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 xl:hidden">
                  <Users className="h-5 w-5 text-primary" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <Users className="hidden h-3 w-3 xl:block" strokeWidth={2} />
                    Rooms &amp; Guests
                    <ChevronDown className={cn("hidden h-3 w-3 transition-transform xl:block", guestsOpen && "rotate-180")} />
                  </span>
                  <span className="text-[15px] font-bold leading-tight text-slate-900 sm:text-[19px]">{guestsMain}</span>
                  <span className="text-[11px] text-slate-400">{guestsSub}</span>
                </div>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform xl:hidden", guestsOpen && "rotate-180")} />
              </button>
              {guestsOpen && (
                <RoomsGuestsPanel value={guests} onChange={setGuests} onClose={() => setGuestsOpen(false)} />
              )}
            </div>

            {/* 5 — Filters */}
            <div ref={filtersRef} className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen(o => !o)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left xl:flex-col xl:items-start xl:gap-0.5 xl:px-5 xl:py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 xl:hidden">
                  <SlidersHorizontal className="h-5 w-5 text-primary" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <SlidersHorizontal className="hidden h-3 w-3 xl:block" strokeWidth={2} />
                    Filters
                    {activeFilters > 0 && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">{activeFilters}</span>
                    )}
                  </span>
                  <span className={cn("text-[13px] font-bold leading-snug sm:text-[15px]", activeFilters ? "text-primary" : "text-slate-400")}>
                    {activeFilters ? [filters.budget, filters.duration, filters.type].filter(Boolean).join(" · ") : "Select Filters (Optional)"}
                  </span>
                  <span className="text-[11px] text-slate-400">{activeFilters ? "" : "Budget, Amenities, etc."}</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 xl:hidden" />
              </button>
              {filtersOpen && (
                <FiltersPanel value={filters} onChange={setFilters} onClose={() => setFiltersOpen(false)} />
              )}
            </div>
          </div>
          )} {/* end of fields row conditional */}

          {/* ── Trending row ─────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 sm:px-5 sm:py-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">Trending:</span>
              {TRENDING_PLACES.map(place => (
                <button
                  key={place}
                  type="button"
                  onClick={() => { setTo(place); setToOpen(false); }}
                  className="rounded-full border border-primary/40 bg-primary/5 px-3 py-0.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                >
                  {place}
                </button>
              ))}
            </div>
            <Link href="/packages" className="hidden shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary sm:flex">
              Explore All Packages
              <ChevronDown className="h-3 w-3 -rotate-90" />
            </Link>
          </div>

          {/* ── Search button row ─────────────────────────────── */}
          <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-100 px-4 py-3 sm:grid-cols-3 sm:gap-4 sm:px-5 sm:py-4">
            {/* Left — Exclusive Deals */}
            <div className="hidden items-center gap-3 sm:flex">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Tag className="h-[18px] w-[18px] text-primary" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[12px] font-bold text-slate-800">Exclusive Deals</p>
                <p className="text-[11px] text-slate-400">Up to 40% Off</p>
              </div>
            </div>

            {/* Center — SEARCH PACKAGES */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-primary py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_8px_24px_-4px_rgba(234,88,12,0.5)] transition hover:bg-primary/90 hover:shadow-[0_12px_28px_-4px_rgba(234,88,12,0.55)] xl:max-w-[340px]"
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
                Search Packages
              </button>
            </div>

            {/* Right — 24/7 Travel Support */}
            <div className="hidden items-center justify-end gap-3 sm:flex">
              <div className="text-right">
                <p className="text-[12px] font-bold text-slate-800">24/7 Travel Support</p>
                <p className="text-[11px] text-slate-400">We&apos;re here for you</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Headphones className="h-[18px] w-[18px] text-primary" strokeWidth={1.8} />
              </span>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
