"use client";

/**
 * src/app/cabs/results/page.tsx  (v2 — MMT-style redesign)
 * ─────────────────────────────────────────────────────────────────────────────
 * /cabs/results?pickup_city=Jaipur&drop_city=Delhi&...
 *
 * Layout: filter sidebar (left) + vertical cab list (right)
 * Trust banner at top, route/distance header, SELECT CAB → /cabs/[slug]/book
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AirVent, Briefcase, ChevronDown, ChevronUp, Shield, Sparkles, Clock, Users, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CabsSearchSection } from "@/components/cabs/CabsSearchSection";
import { searchCabs, type CabSearchParams, type CabSearchResult, type CabFareBreakdown } from "@/lib/cabs-api";
import { cn, formatInrAmount } from "@/lib/utils";

// ─── Filter helpers ──────────────────────────────────────────────────────────

function uniqueValues(cabs: CabSearchResult[], key: keyof CabSearchResult): string[] {
  const set = new Set<string>();
  for (const c of cabs) {
    const v = c[key];
    if (typeof v === "string" && v) set.add(v);
  }
  return [...set].sort();
}

function toggleSet(set: Set<string>, val: string): Set<string> {
  const next = new Set(set);
  if (next.has(val)) next.delete(val); else next.add(val);
  return next;
}

const CATEGORY_LABELS: Record<string, string> = {
  sedan: "Sedan", suv: "SUV", luxury: "Luxury", hatchback: "Hatchback",
  tempo_traveller: "Tempo Traveller", mini: "Mini", bus: "Bus", compactsuv: "Compact SUV",
};

// ─── Trust banner ────────────────────────────────────────────────────────────

function TrustBanner() {
  return (
    <div className="flex items-center justify-center gap-8 rounded-xl bg-[#1a2332] px-4 py-3 text-white sm:gap-12">
      {[
        { icon: <Shield className="h-5 w-5" />, label: "Trusted Drivers" },
        { icon: <Sparkles className="h-5 w-5" />, label: "Clean Cabs" },
        { icon: <Clock className="h-5 w-5" />, label: "On-Time Pickup" },
      ].map(({ icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-[13px] font-semibold">
          {icon} {label}
        </div>
      ))}
    </div>
  );
}

// ─── Cab list card (horizontal — matches MMT) ────────────────────────────────

function CabListCard({
  cab, onSelect,
}: { cab: CabSearchResult; onSelect: () => void }) {
  const category = CATEGORY_LABELS[cab.cab_category] ?? cab.cab_category;
  const fare = cab.fare_breakdown;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E8E8E8] bg-white transition-shadow hover:shadow-md sm:flex-row">
      {/* Left: image + fuel badge */}
      <div className="relative flex w-full shrink-0 items-center justify-center bg-gradient-to-br from-[#F0F4FF] to-[#E8F0FE] p-4 sm:w-[180px]">
        {cab.featured_image ? (
          <Image src={cab.featured_image} alt={cab.name} width={140} height={90} className="object-contain" unoptimized />
        ) : (
          <span className="text-5xl">🚗</span>
        )}
        {cab.is_ac && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#EF6614] px-2.5 py-0.5 text-[10px] font-bold text-white">
            AC
          </span>
        )}
      </div>

      {/* Center: info */}
      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-[#212121]">{cab.name}</h3>
          <span className="text-[12px] text-[#757575]">or similar</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[12px] text-[#616161]">
          {cab.is_ac && <span>AC</span>}
          <span>•</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cab.seating_capacity} Seats</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {cab.luggage_capacity} Bags</span>
        </div>
        {/* Features as tags */}
        {cab.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cab.features.slice(0, 3).map((f) => (
              <span key={f} className="rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-[#616161]">{f}</span>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-[#9E9E9E]">{category}</p>
      </div>

      {/* Right: price + CTA */}
      <div className="flex shrink-0 flex-col items-end justify-center border-t border-[#F0F0F0] px-4 py-3 sm:border-t-0 sm:border-l sm:px-5">
        <p className="text-xl font-bold text-[#212121]">₹{formatInrAmount(cab.total_fare)}</p>
        {fare && (
          <p className="mt-0.5 text-[11px] text-[#757575]">
            + ₹{formatInrAmount(fare.gst_amount)} (Taxes &amp; Charges)
          </p>
        )}
        <button
          type="button"
          onClick={onSelect}
          className="mt-3 rounded-lg bg-[#EF6614] px-6 py-2.5 text-[13px] font-bold tracking-wide text-white transition-colors hover:bg-[#E65100]"
        >
          SELECT CAB
        </button>
      </div>
    </div>
  );
}

// ─── Filter sidebar ──────────────────────────────────────────────────────────

function FilterSidebar({
  cabs, catFilter, setCatFilter, sortBy, setSortBy,
}: {
  cabs: CabSearchResult[];
  catFilter: Set<string>;
  setCatFilter: (s: Set<string>) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}) {
  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cabs) { map[c.cab_category] = (map[c.cab_category] ?? 0) + 1; }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [cabs]);

  const hasFilters = catFilter.size > 0;

  return (
    <div className="w-full shrink-0 lg:w-[260px]">
      <div className="rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#212121]">Filters</h3>
          {hasFilters && (
            <button type="button" onClick={() => setCatFilter(new Set())}
              className="text-[12px] font-semibold text-[#EF6614] hover:underline">CLEAR ALL</button>
          )}
        </div>

        {/* Sort */}
        <div className="mt-4 border-t border-[#EEE] pt-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#757575]">Sort By</p>
          <div className="mt-2 space-y-1.5">
            {[
              { value: "price_low", label: "Price: Low to High" },
              { value: "price_high", label: "Price: High to Low" },
              { value: "seats", label: "Seating Capacity" },
            ].map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-[13px] text-[#424242]">
                <input type="radio" name="sort" value={value} checked={sortBy === value}
                  onChange={() => setSortBy(value)}
                  className="h-3.5 w-3.5 accent-[#EF6614]" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Cab Type */}
        <div className="mt-4 border-t border-[#EEE] pt-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#757575]">Cab Type</p>
          <div className="mt-2 space-y-1.5">
            {categories.map(([cat, count]) => (
              <label key={cat} className="flex cursor-pointer items-center justify-between gap-2 text-[13px] text-[#424242]">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={catFilter.has(cat)}
                    onChange={() => setCatFilter(toggleSet(catFilter, cat))}
                    className="h-3.5 w-3.5 rounded accent-[#EF6614]" />
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
                <span className="text-[11px] text-[#9E9E9E]">({count})</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CabsResultsPage() {
  const sp     = useSearchParams();
  const router = useRouter();

  const params: CabSearchParams = {
    pickup_city: sp.get("pickup_city") ?? "",
    drop_city:   sp.get("drop_city") ?? "",
    drop_state:  sp.get("drop_state") ?? "",
    trip_type:   (sp.get("trip_type") ?? "one_way") as CabSearchParams["trip_type"],
    travel_date: sp.get("travel_date") ?? "",
    return_date: sp.get("return_date") ?? undefined,
    passengers:  Number(sp.get("passengers") ?? 1),
  };

  const [results, setResults]     = useState<CabSearchResult[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy]       = useState("price_low");

  useEffect(() => {
    if (!params.pickup_city || !params.drop_city || !params.travel_date) {
      setLoading(false); return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchCabs(params)
      .then((data) => { if (!cancelled) setResults(data); })
      .catch((err: unknown) => { if (!cancelled) setError((err as Error).message ?? "Something went wrong"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  const filtered = useMemo(() => {
    let list = results;
    if (catFilter.size > 0) list = list.filter((c) => catFilter.has(c.cab_category));
    if (sortBy === "price_low") list = [...list].sort((a, b) => a.total_fare - b.total_fare);
    else if (sortBy === "price_high") list = [...list].sort((a, b) => b.total_fare - a.total_fare);
    else if (sortBy === "seats") list = [...list].sort((a, b) => b.seating_capacity - a.seating_capacity);
    return list;
  }, [results, catFilter, sortBy]);

  const distanceKm = results[0]?.fare_breakdown?.actual_km;
  const estHours = distanceKm ? Math.round(distanceKm / 50) : null; // rough est

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="cabs" />
      <main>
        <CabsSearchSection />

        <section className="bg-[#F5F5F5] py-5">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 animate-pulse rounded-xl bg-white shadow-sm" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700">
                {error}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-12 text-center">
                <p className="text-[15px] font-semibold text-[#212121]">No cabs found for this route</p>
                <p className="mt-1 text-sm text-[#757575]">Try adjusting your dates or passengers count.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 lg:flex-row">
                {/* Filter sidebar */}
                <FilterSidebar
                  cabs={results}
                  catFilter={catFilter}
                  setCatFilter={setCatFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />

                {/* Results list */}
                <div className="min-w-0 flex-1 space-y-4">
                  <TrustBanner />

                  {/* Route + distance header */}
                  {distanceKm && (
                    <p className="text-sm text-[#424242]">
                      Rates for <strong>{distanceKm} Kms</strong> approx distance
                      {estHours ? <> | <strong>{estHours} hr(s)</strong> approx time</> : null}
                    </p>
                  )}

                  {/* Cab list */}
                  {filtered.length === 0 ? (
                    <p className="rounded-lg bg-white p-6 text-center text-sm text-[#757575]">
                      No cabs match your filters. Try clearing some.
                    </p>
                  ) : (
                    filtered.map((cab) => (
                      <CabListCard
                        key={cab.cab_type_id}
                        cab={cab}
                        onSelect={() => router.push(`/cabs/${cab.slug}/book?${sp.toString()}`)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}