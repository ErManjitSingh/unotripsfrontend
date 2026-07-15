"use client";

/**
 * src/components/activities/ActivitiesClient.tsx
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, MapPin, Search, Tag, Users, ChevronDown, Mountain, ShieldCheck, BadgeIndianRupee, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInrAmount } from "@/lib/utils";

// ── Shared data (no "use client" — safe for server imports too) ──────────────
import { fetchActivities } from "@/lib/activities-api";
import type { Activity } from "@/lib/activities-api";

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "",             label: "All Activities" },
  { value: "adventure",    label: "Adventure"      },
  { value: "trekking",     label: "Trekking"       },
  { value: "water_sports", label: "Water Sports"   },
  { value: "wildlife",     label: "Wildlife"       },
  { value: "cultural",     label: "Cultural"       },
  { value: "camping",      label: "Camping"        },
  { value: "paragliding",  label: "Paragliding"    },
  { value: "snow_sports",  label: "Snow Sports"    },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  hard:     "bg-red-100 text-red-700",
};

const POPULAR_DESTINATIONS = ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "North Goa", "Srinagar", "Gulmarg", "Pahalgam", "Shimla", "Manali"];

const DIFFICULTIES = [
  { value: "", label: "Any difficulty" },
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
];

const PRICE_LIMITS = [
  { value: "", label: "Any price" },
  { value: "1000", label: "Up to ₹1,000" },
  { value: "2500", label: "Up to ₹2,500" },
  { value: "5000", label: "Up to ₹5,000" },
];

const PAGE_SIZE = 24;

const WHY = [
  { icon: Mountain, title: "500+ Experiences",   desc: "Adventures, treks, water sports, cultural tours across India." },
  { icon: ShieldCheck, title: "Verified Operators", desc: "All activity partners are background-checked & safety-certified." },
  { icon: BadgeIndianRupee, title: "Best Price Promise", desc: "No markup. Pay exactly what the operator charges." },
  { icon: CalendarCheck, title: "Flexible Booking",   desc: "Book now, choose date later. Free cancellation on most activities." },
];

// ─── Activity Card ─────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: Activity }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const level     = activity.difficulty_level ?? "easy";
  const diffLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const diffColor = DIFFICULTY_COLORS[level] ?? "bg-gray-100 text-gray-700";

  return (
    <a href={`/activities/${activity.slug}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-[#F0E6DD] bg-white shadow-[0_8px_30px_-18px_rgba(91,55,30,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-lg sm:flex-row">
      <div className="relative m-3 mb-0 h-56 w-[calc(100%-1.5rem)] shrink-0 overflow-hidden rounded-2xl bg-[#F5F5F5] sm:mb-3 sm:mr-0 sm:h-auto sm:min-h-[220px] sm:w-[38%] md:w-[42%]">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#EEEEEE]" />}
        {activity.featured_image && <Image src={activity.featured_image} alt={activity.name} fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className={cn("object-cover transition-all duration-500 group-hover:scale-105", imgLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setImgLoaded(true)} />}
        <div className="absolute left-3 top-3 flex gap-2">
          {activity.is_featured && <span className="rounded-full bg-[#EF6614] px-2.5 py-0.5 text-[10px] font-bold text-white">⭐ Featured</span>}
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", diffColor)}>{diffLabel}</span>
        </div>
        {activity.starting_price && (
          <div className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-3 py-1 text-white backdrop-blur-sm">
            <span className="text-[10px] text-white/80">from </span>
            <span className="text-[14px] font-bold">₹{formatInrAmount(activity.starting_price)}</span>
            <span className="text-[10px] text-white/80">/{activity.price_type === "per_group" ? "group" : "person"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          {activity.category && (
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#EF6614]">
              <Tag className="h-3 w-3" strokeWidth={2}/>{activity.category.replace("_"," ")}
            </span>
          )}
          {activity.destination_name && (
            <span className="flex items-center gap-1 text-[11px] text-[#9E9E9E]">
              <MapPin className="h-3 w-3" strokeWidth={1.5}/>{activity.destination_name}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[17px] font-bold leading-snug text-[#212121] transition-colors group-hover:text-[#EF6614]">{activity.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#757575]">
          {activity.short_description ?? `Discover ${activity.name.toLowerCase()} with UNO Trips.`}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#757575]">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" strokeWidth={1.5}/>{activity.duration ?? "Flexible"}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" strokeWidth={1.5}/>{activity.age_limit ?? "All ages"}</span>
          <span>⏰ {activity.best_time ?? "Year round"}</span>
        </div>
        {activity.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activity.tags.slice(0,3).map((tag) => <span key={tag} className="rounded-full border border-[#EEEEEE] px-2 py-0.5 text-[10px] text-[#616161]">{tag}</span>)}
          </div>
        )}
        <div className="mt-auto pt-4">
          <span className="block w-full rounded-xl border border-[#EF6614] py-2 text-center text-[13px] font-bold text-[#EF6614] transition-colors group-hover:bg-[#EF6614] group-hover:text-white">
            View Activity
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function ActivitiesClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [category,    setCategory]    = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [nextPage, setNextPage] = useState(2);
  const [hasMore, setHasMore] = useState(false);
  const [destOpen,    setDestOpen]    = useState(false);
  const destRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const heroImage = activities.find((activity) => activity.featured_image)?.featured_image ?? "/images/hotels/hero-banner.webp";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActivities([]);
    fetchActivities({
      page: 1,
      limit: PAGE_SIZE,
      destination: destination || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      search: search || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
      .then((response) => {
        if (cancelled) return;
        setActivities(response.items);
        setTotal(response.total);
        setNextPage(2);
        setHasMore(response.page < response.total_pages);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load activities right now. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [category, destination, difficulty, maxPrice, search]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await fetchActivities({
        page: nextPage,
        limit: PAGE_SIZE,
        destination: destination || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        search: search || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setActivities((current) => {
        const known = new Set(current.map((activity) => activity.id));
        return [...current, ...response.items.filter((activity) => !known.has(activity.id))];
      });
      setNextPage((page) => page + 1);
      setHasMore(response.page < response.total_pages);
    } catch {
      setError("We couldn't load more activities right now. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [category, destination, difficulty, hasMore, loading, loadingMore, maxPrice, nextPage, search]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "280px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const filteredDests = destination.trim()
    ? POPULAR_DESTINATIONS.filter((d) => d.toLowerCase().includes(destination.toLowerCase()))
    : POPULAR_DESTINATIONS;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[320px] overflow-visible rounded-b-[32px] border-b-4 border-[#EF6614] bg-[#FFF3E0] px-3 pb-10 pt-28 sm:min-h-[350px] sm:px-4 sm:pb-12 sm:pt-28 lg:px-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center"/>
          <div className="absolute inset-0 bg-[#FFF3E0]/75" aria-hidden/>
        </div>
        <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[#EF6614]">Curated experiences across India</p>
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-[#C94F0B] sm:text-4xl lg:text-5xl">Activities & Experiences</h1>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-[#6B625C] sm:text-base">Adventure, culture, wildlife & more — book unforgettable experiences across India</p>
          <div className="relative mx-auto mt-8 flex w-full max-w-[900px] flex-col gap-3 rounded-[22px] bg-white p-2 shadow-[0_18px_45px_-20px_rgba(91,55,30,0.4)] sm:flex-row">
            <div ref={destRef} className="relative flex-1">
              <div className="flex h-[52px] items-center gap-2 rounded-xl bg-white px-4 shadow-sm">
                <MapPin className="h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5}/>
                <input value={destination} onChange={(e)=>{setDestination(e.target.value);setDestOpen(true);}}
                  onFocus={()=>setDestOpen(true)} onBlur={()=>setTimeout(()=>setDestOpen(false),150)}
                  placeholder="Filter by destination"
                  className="flex-1 border-0 bg-transparent text-[14px] font-medium text-[#212121] outline-none placeholder:text-[#BDBDBD]"/>
              </div>
              {destOpen && filteredDests.length > 0 && (
                <ul className="absolute left-0 top-[calc(100%+4px)] z-[200] w-full overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.2)]">
                  {filteredDests.slice(0,6).map((d)=>(
                    <li key={d}><button type="button" onMouseDown={()=>{setDestination(d);setDestOpen(false);}}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#212121] hover:bg-[#FFF3E0]">
                      <MapPin className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={1.5}/>{d}
                    </button></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex h-[52px] items-center gap-2 rounded-xl bg-white px-4 shadow-sm sm:max-w-[220px]">
              <Search className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={1.5}/>
              <input value={searchInput} onChange={(e)=>setSearchInput(e.target.value)}
                onKeyDown={(e)=>{if(e.key==="Enter") setSearch(searchInput.trim());}}
                placeholder="Search activities"
                className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-medium text-[#212121] outline-none placeholder:text-[#BDBDBD]"/>
            </div>
            <div className="relative flex gap-2">
              <select value={category} onChange={(e)=>setCategory(e.target.value)}
                className="h-[52px] appearance-none rounded-xl bg-white px-4 pr-10 text-[14px] font-medium text-[#212121] shadow-sm outline-none">
                {CATEGORIES.map(({value,label})=><option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" strokeWidth={2}/>
              <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}
                className="h-[52px] rounded-xl bg-white px-3 text-[13px] font-medium text-[#212121] shadow-sm outline-none">
                {DIFFICULTIES.map(({value,label})=><option key={value} value={value}>{label}</option>)}
              </select>
              <select value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)}
                className="h-[52px] rounded-xl bg-white px-3 text-[13px] font-medium text-[#212121] shadow-sm outline-none">
                {PRICE_LIMITS.map(({value,label})=><option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <button type="button" onClick={()=>setSearch(searchInput.trim())} className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#EF6614] px-7 text-[14px] font-bold text-white hover:bg-[#E65100]">
              <Search className="h-4 w-4" strokeWidth={2.5}/> Search
            </button>
          </div>
          <div className="mx-auto mt-7 flex w-full max-w-[1160px] justify-start gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center">
            {CATEGORIES.map(({value,label})=>(
              <button key={value} type="button" onClick={()=>setCategory(value)}
                className={cn("shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
                  category===value?"border-[#EF6614] bg-[#EF6614] text-white":"border-[#E0E0E0] bg-white/90 text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614]")}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#FAF8F6] py-7 sm:py-9">
        <div className="mx-auto w-full max-w-[1120px] px-3 sm:px-4">
          <div className="mb-5 flex items-end justify-between border-b border-[#EDE5DE] pb-3">
            <p className="text-[15px] font-semibold text-[#5F5751]">{total} {total===1?"activity":"activities"} found</p>
            <span className="hidden text-[12px] text-[#9A918A] sm:inline">Curated for your next escape</span>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading activities">
              {[1, 2, 3].map((item) => <div key={item} className="h-[430px] animate-pulse rounded-2xl bg-white" />)}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-16 text-center">
              <p className="text-[15px] font-semibold text-[#212121]">{error}</p>
              <button type="button" onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-[#EF6614] px-6 py-2 text-[13px] font-bold text-white hover:bg-[#E65100]">Try Again</button>
            </div>
          ) : activities.length===0 ? (
            <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-16 text-center">
              <div className="mb-3 text-5xl">🏔️</div>
              <p className="text-[15px] font-semibold text-[#212121]">No activities found</p>
              <button type="button" onClick={()=>{setCategory("");setDestination("");setDifficulty("");setMaxPrice("");setSearch("");setSearchInput("");}}
                className="mt-4 rounded-full bg-[#EF6614] px-6 py-2 text-[13px] font-bold text-white hover:bg-[#E65100]">Clear Filters</button>
            </div>
          ) : (
            <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-5 md:grid-cols-2">
              {activities.map((activity)=><ActivityCard key={activity.id} activity={activity}/>) }
            </div>
          )}
          {!loading && !error && activities.length > 0 && (
            <div ref={loadMoreRef} className="py-8 text-center text-sm text-[#766D67]" aria-live="polite">
              {loadingMore ? "Loading more activities…" : hasMore ? "Scroll to load more activities" : "You’ve reached the end of the activities."}
            </div>
          )}
        </div>
      </section>

      {/* Why book */}
      <section className="border-t border-[#F0E6DD] bg-[#FFFDFC] py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[#EF6614]">The UNO Trips difference</p>
          <h2 className="mt-2 mb-8 text-center text-2xl font-extrabold tracking-tight text-[#2B2521] sm:text-3xl">Why Book Activities with UNO Trips?</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({icon: Icon,title,desc})=>(
              <div key={title} className="group relative flex min-h-[205px] flex-col items-center overflow-hidden rounded-2xl border border-[#F0E6DD] bg-white px-6 py-7 text-center shadow-[0_10px_30px_-22px_rgba(91,55,30,0.55)] transition-all hover:-translate-y-1 hover:border-[#F7B27A] hover:shadow-[0_18px_35px_-22px_rgba(239,102,20,0.5)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FFB15C] via-[#EF6614] to-[#C94F0B] opacity-70" />
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#EF6614] shadow-inner"><Icon className="h-7 w-7" strokeWidth={1.7} /></div>
                <h3 className="mb-2 text-[15px] font-bold text-[#2B2521]">{title}</h3>
                <p className="max-w-[220px] text-[12px] leading-relaxed text-[#766D67]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
