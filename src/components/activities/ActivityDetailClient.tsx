"use client";

/**
 * src/components/activities/ActivityDetailClient.tsx
 * Full activity detail page UI — images, description, included/excluded, booking CTA
 */

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Calendar, Check, Clock, MapPin, Minus, Plus, Tag, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInrAmount } from "@/lib/utils";

// Type must match HARDCODED_ACTIVITIES in ActivitiesClient.tsx
type Activity = {
  slug:              string;
  name:              string;
  short_description: string | null;
  featured_image:    string;
  gallery:           string[];
  category:          string | null;
  destination_name:  string | null;
  location:          string;
  tags:              string[];
  duration:          string | null;
  difficulty_level:  string | null;
  age_limit:         string | null;
  best_time:         string | null;
  starting_price:    number | null;
  price_type:        string;
  is_featured:       boolean;
  included:          string[];
  excluded:          string[];
  description:       string;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  hard:     "bg-red-100 text-red-700",
};

export function ActivityDetailClient({ activity }: { activity: Activity }) {
  const [activeImg, setActiveImg] = useState(0);
  const [persons,   setPersons]   = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  const level     = activity.difficulty_level ?? "easy";
  const diffLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const diffColor = DIFFICULTY_COLORS[level] ?? "bg-gray-100 text-gray-700";
  const totalPrice = activity.starting_price ? activity.starting_price * persons : 0;

  return (
    <div className="bg-[#F5F5F5] pb-16">

      {/* ── Hero image ───────────────────────────────────────────────────── */}
      <div className="relative h-[320px] w-full overflow-hidden bg-[#E0E0E0] sm:h-[420px] lg:h-[500px]">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#E0E0E0]" />}
        <Image
          src={activity.gallery[activeImg] ?? activity.featured_image}
          alt={activity.name}
          fill
          priority
          sizes="100vw"
          className={cn("object-cover transition-opacity duration-500", imgLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setImgLoaded(true)}
        />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Back button */}
        <a href="/activities"
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm hover:bg-black/60">
          <ArrowLeft className="h-4 w-4" strokeWidth={2}/> Back
        </a>

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {activity.category && (
                <span className="flex items-center gap-1 rounded-full bg-[#EF6614] px-3 py-0.5 text-[11px] font-bold uppercase text-white">
                  <Tag className="h-3 w-3" strokeWidth={2}/>{activity.category.replace("_"," ")}
                </span>
              )}
              <span className={cn("rounded-full px-3 py-0.5 text-[11px] font-bold", diffColor)}>{diffLabel}</span>
              {activity.is_featured && <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">⭐ Featured</span>}
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl lg:text-4xl">{activity.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/80">
              <MapPin className="h-4 w-4" strokeWidth={1.5}/>{activity.location}
            </p>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip ───────────────────────────────────────────────── */}
      {activity.gallery.length > 1 && (
        <div className="bg-[#212121] px-4 py-2">
          <div className="mx-auto flex max-w-[1320px] gap-2 overflow-x-auto">
            {activity.gallery.map((img, i) => (
              <button key={i} type="button" onClick={() => { setActiveImg(i); setImgLoaded(false); }}
                className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  activeImg===i ? "border-[#EF6614]" : "border-transparent opacity-60 hover:opacity-100")}>
                <Image src={img} alt={`View ${i+1}`} fill sizes="80px" className="object-cover"/>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1320px] px-3 py-6 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Left — details */}
          <div className="flex-1 space-y-5">

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#EEEEEE] bg-white p-4 sm:grid-cols-4 sm:p-5">
              {[
                { icon: <Clock className="h-5 w-5 text-[#EF6614]" strokeWidth={1.5}/>,    label: "Duration",   value: activity.duration    ?? "—" },
                { icon: <Users className="h-5 w-5 text-[#EF6614]" strokeWidth={1.5}/>,    label: "Age Limit",  value: activity.age_limit   ?? "All ages" },
                { icon: <Calendar className="h-5 w-5 text-[#EF6614]" strokeWidth={1.5}/>, label: "Best Time",  value: activity.best_time   ?? "Year round" },
                { icon: <MapPin className="h-5 w-5 text-[#EF6614]" strokeWidth={1.5}/>,   label: "Difficulty", value: diffLabel },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  {icon}
                  <span className="text-[11px] text-[#9E9E9E]">{label}</span>
                  <span className="text-[13px] font-bold text-[#212121]">{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
              <h2 className="mb-3 text-[17px] font-bold text-[#212121]">About this Activity</h2>
              <p className="text-[14px] leading-relaxed text-[#616161]">{activity.description}</p>
              {activity.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activity.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#EEEEEE] bg-[#FAFAFA] px-3 py-1 text-[12px] text-[#616161]">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Included / Excluded */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Included */}
              <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
                <h3 className="mb-3 text-[15px] font-bold text-[#212121]">✅ What's Included</h3>
                <ul className="space-y-2">
                  {activity.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#616161]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" strokeWidth={2.5}/>{item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Excluded */}
              <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5">
                <h3 className="mb-3 text-[15px] font-bold text-[#212121]">❌ What's Not Included</h3>
                <ul className="space-y-2">
                  {activity.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#616161]">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" strokeWidth={2.5}/>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right — Booking card (sticky) */}
          <div className="w-full lg:sticky lg:top-24 lg:w-[340px] lg:shrink-0">
            <div className="rounded-2xl border border-[#EEEEEE] bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)]">
              <div className="p-5">
                <p className="text-[12px] text-[#9E9E9E]">Starting from</p>
                <div className="mt-0.5 flex items-end gap-1">
                  <span className="text-[32px] font-bold leading-tight text-[#212121]">
                    ₹{formatInrAmount(activity.starting_price ?? 0)}
                  </span>
                  <span className="mb-1 text-[14px] text-[#757575]">
                    /{activity.price_type === "per_group" ? "group" : "person"}
                  </span>
                </div>

                {/* Persons counter */}
                {activity.price_type !== "per_group" && (
                  <div className="mt-4">
                    <p className="mb-2 text-[12px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Persons</p>
                    <div className="flex items-center gap-4">
                      <button type="button" disabled={persons<=1}
                        onClick={()=>setPersons(p=>Math.max(1,p-1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30">
                        <Minus className="h-4 w-4" strokeWidth={2}/>
                      </button>
                      <span className="min-w-[2rem] text-center text-[18px] font-bold text-[#212121]">{persons}</span>
                      <button type="button" disabled={persons>=20}
                        onClick={()=>setPersons(p=>Math.min(20,p+1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30">
                        <Plus className="h-4 w-4" strokeWidth={2}/>
                      </button>
                    </div>
                  </div>
                )}

                {/* Total */}
                {activity.starting_price && activity.price_type !== "per_group" && persons > 1 && (
                  <div className="mt-4 rounded-xl bg-[#FFF3E0] px-4 py-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#757575]">₹{formatInrAmount(activity.starting_price)} × {persons} persons</span>
                      <span className="font-bold text-[#EF6614]">₹{formatInrAmount(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button type="button"
                  className="mt-5 h-[52px] w-full rounded-xl bg-[#EF6614] text-[15px] font-bold text-white shadow-[0_4px_14px_-2px_rgba(239,102,20,0.5)] transition-colors hover:bg-[#E65100]">
                  Book Now — ₹{formatInrAmount(totalPrice || activity.starting_price || 0)}
                </button>
                <p className="mt-2 text-center text-[11px] text-[#9E9E9E]">No payment required now · Free cancellation</p>
              </div>

              {/* Location */}
              <div className="border-t border-[#EEEEEE] px-5 py-4">
                <p className="text-[12px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-1">Location</p>
                <p className="flex items-start gap-1.5 text-[13px] text-[#212121]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#EF6614]" strokeWidth={1.5}/>{activity.location}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}