"use client";

/**
 * src/components/activities/ActivitiesClient.tsx
 */

import Image from "next/image";
import { useRef, useState } from "react";
import { Clock, MapPin, Search, Tag, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInrAmount } from "@/lib/utils";

// ── Shared data (no "use client" — safe for server imports too) ──────────────
import { HARDCODED_ACTIVITIES } from "@/data/activities";
import type { Activity } from "@/data/activities";

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

const POPULAR_DESTINATIONS = ["Manali","Rishikesh","Goa","Jaipur","Leh","Coorg","Shimla","Mussoorie","Nainital","Spiti Valley"];

const WHY = [
  { emoji: "🏔️", title: "500+ Experiences",   desc: "Adventures, treks, water sports, cultural tours across India." },
  { emoji: "✅",  title: "Verified Operators", desc: "All activity partners are background-checked & safety-certified." },
  { emoji: "💰",  title: "Best Price Promise", desc: "No markup. Pay exactly what the operator charges." },
  { emoji: "📅",  title: "Flexible Booking",   desc: "Book now, choose date later. Free cancellation on most activities." },
];

// ─── Activity Card ─────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: Activity }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const level     = activity.difficulty_level ?? "easy";
  const diffLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const diffColor = DIFFICULTY_COLORS[level] ?? "bg-gray-100 text-gray-700";

  return (
    <a href={`/activities/${activity.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full overflow-hidden bg-[#F5F5F5]">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#EEEEEE]" />}
        <Image src={activity.featured_image} alt={activity.name} fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className={cn("object-cover transition-all duration-500 group-hover:scale-105", imgLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setImgLoaded(true)} />
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
      <div className="flex flex-1 flex-col p-4">
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
        <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-[#212121] transition-colors group-hover:text-[#EF6614]">{activity.name}</h3>
        {activity.short_description && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#757575]">{activity.short_description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#757575]">
          {activity.duration  && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" strokeWidth={1.5}/>{activity.duration}</span>}
          {activity.age_limit && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" strokeWidth={1.5}/>{activity.age_limit}</span>}
          {activity.best_time && <span>⏰ {activity.best_time}</span>}
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
  const [destination, setDestination] = useState("");
  const [category,    setCategory]    = useState("");
  const [destOpen,    setDestOpen]    = useState(false);
  const destRef = useRef<HTMLDivElement>(null);

  const filtered = HARDCODED_ACTIVITIES.filter((a) => {
    const matchCat  = !category    || a.category === category;
    const matchDest = !destination || (a.destination_name ?? "").toLowerCase().includes(destination.toLowerCase());
    return matchCat && matchDest;
  });

  const filteredDests = destination.trim()
    ? POPULAR_DESTINATIONS.filter((d) => d.toLowerCase().includes(destination.toLowerCase()))
    : POPULAR_DESTINATIONS;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[220px] overflow-visible px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image src="/images/hotels/hero-banner.webp" alt="" fill priority sizes="100vw" className="object-cover object-center"/>
          <div className="absolute inset-0 bg-black/65" aria-hidden/>
        </div>
        <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <h1 className="text-center text-2xl font-bold text-white sm:text-3xl">Activities & Experiences</h1>
          <p className="mt-1 text-center text-sm text-white/80">Adventure, culture, wildlife & more — book unforgettable experiences across India</p>
          <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
            <div ref={destRef} className="relative flex-1">
              <div className="flex h-[52px] items-center gap-2 rounded-xl bg-white px-4 shadow-sm">
                <MapPin className="h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5}/>
                <input value={destination} onChange={(e)=>{setDestination(e.target.value);setDestOpen(true);}}
                  onFocus={()=>setDestOpen(true)} onBlur={()=>setTimeout(()=>setDestOpen(false),150)}
                  placeholder="Where? (Manali, Rishikesh…)"
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
            <div className="relative">
              <select value={category} onChange={(e)=>setCategory(e.target.value)}
                className="h-[52px] appearance-none rounded-xl bg-white px-4 pr-10 text-[14px] font-medium text-[#212121] shadow-sm outline-none">
                {CATEGORIES.map(({value,label})=><option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" strokeWidth={2}/>
            </div>
            <button type="button" className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#EF6614] px-7 text-[14px] font-bold text-white hover:bg-[#E65100]">
              <Search className="h-4 w-4" strokeWidth={2.5}/> Search
            </button>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b border-[#EEEEEE] bg-white px-3 py-3 sm:px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-[1320px] gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(({value,label})=>(
            <button key={value} type="button" onClick={()=>setCategory(value)}
              className={cn("shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
                category===value?"border-[#EF6614] bg-[#EF6614] text-white":"border-[#E0E0E0] bg-white text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614]")}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#F5F5F5] py-8">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <p className="mb-4 text-[13px] text-[#757575]">{filtered.length} {filtered.length===1?"activity":"activities"} found</p>
          {filtered.length===0 ? (
            <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-16 text-center">
              <div className="mb-3 text-5xl">🏔️</div>
              <p className="text-[15px] font-semibold text-[#212121]">No activities found</p>
              <button type="button" onClick={()=>{setCategory("");setDestination("");}}
                className="mt-4 rounded-full bg-[#EF6614] px-6 py-2 text-[13px] font-bold text-white hover:bg-[#E65100]">Clear Filters</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((activity)=><ActivityCard key={activity.slug} activity={activity}/>)}
            </div>
          )}
        </div>
      </section>

      {/* Why book */}
      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <h2 className="mb-6 text-center text-xl font-bold text-[#212121] sm:text-2xl">Why Book Activities with UNO Trips?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({emoji,title,desc})=>(
              <div key={title} className="flex flex-col items-center rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-5 text-center">
                <div className="mb-3 text-3xl">{emoji}</div>
                <h3 className="mb-1 text-[14px] font-bold text-[#212121]">{title}</h3>
                <p className="text-[12px] leading-relaxed text-[#757575]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}