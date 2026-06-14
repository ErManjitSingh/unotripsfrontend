"use client";

/**
 * src/app/bus/results/page.tsx  — /bus/results?from_city=...&to_city=...&travel_date=...
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar }           from "@/components/layout/Navbar";
import { Footer }           from "@/components/layout/Footer";
import { BusSearchSection } from "@/components/bus/BusSearchSection";
import { searchBus, formatBusDate, type BusResult } from "@/lib/bus-api";
import { cn } from "@/lib/utils";
import { Wifi, Zap, Wind, Clock, Star } from "lucide-react";

// ─── Bus Result Card ──────────────────────────────────────────────────────────

const AMENITY_ICON: Record<string, React.ReactNode> = {
  "WiFi":     <Wifi     className="h-3.5 w-3.5" strokeWidth={1.5} />,
  "Charging": <Zap      className="h-3.5 w-3.5" strokeWidth={1.5} />,
  "AC":       <Wind     className="h-3.5 w-3.5" strokeWidth={1.5} />,
};

function BusResultCard({ bus, onBook }: { bus: BusResult; onBook: () => void }) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-stretch">

      {/* Left — operator + timings */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* Operator + type */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[15px] font-bold text-[#212121]">{bus.operator}</p>
            <p className="text-[12px] text-[#757575]">{bus.bus_type}</p>
          </div>
          {bus.rating ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[12px] font-semibold text-green-700">
              <Star className="h-3 w-3 fill-green-600 text-green-600" /> {bus.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        {/* Departure → Arrival timeline */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-[20px] font-bold leading-tight text-[#212121]">{bus.departure}</p>
            {bus.boarding_points[0] && (
              <p className="mt-0.5 text-[10px] text-[#9E9E9E] line-clamp-1">{bus.boarding_points[0]}</p>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5">
            <span className="text-[11px] text-[#9E9E9E]">{bus.duration}</span>
            <div className="relative flex w-full items-center">
              <div className="h-[2px] flex-1 bg-[#E0E0E0]" />
              <Clock className="mx-1 h-3.5 w-3.5 shrink-0 text-[#BDBDBD]" strokeWidth={1.5} />
              <div className="h-[2px] flex-1 bg-[#E0E0E0]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-bold leading-tight text-[#212121]">{bus.arrival}</p>
            {bus.dropping_points[0] && (
              <p className="mt-0.5 text-[10px] text-[#9E9E9E] line-clamp-1">{bus.dropping_points[0]}</p>
            )}
          </div>
        </div>

        {/* Amenities */}
        {bus.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bus.amenities.map((a) => (
              <span key={a} className="flex items-center gap-1 rounded-full border border-[#EEEEEE] px-2.5 py-0.5 text-[11px] text-[#616161]">
                {AMENITY_ICON[a] ?? null}{a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right — fare + seats + book */}
      <div className="flex flex-row items-center justify-between gap-4 border-t border-[#EEEEEE] px-4 py-3 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:px-5 sm:py-4 sm:min-w-[160px]">
        <div className="sm:text-right">
          <p className="text-[11px] text-[#9E9E9E]">Starts from</p>
          <p className="text-[22px] font-bold leading-tight text-[#212121]">
            ₹{bus.fare.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#9E9E9E]">
            {bus.available_seats} seats left
          </p>
        </div>
        <button type="button" onClick={onBook}
          className="shrink-0 rounded-full bg-[#2196F3] px-5 py-2.5 text-[13px] font-bold tracking-wide text-white shadow-sm transition-colors hover:bg-[#1E88E5]">
          Book Now
        </button>
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────

export default function BusResultsPage() {
  const sp     = useSearchParams();
  const router = useRouter();

  const fromCity   = sp.get("from_city")   ?? "";
  const toCity     = sp.get("to_city")     ?? "";
  const travelDate = sp.get("travel_date") ?? "";

  const [results, setResults] = useState<BusResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!fromCity || !toCity || !travelDate) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);

    searchBus({ from_city: fromCity, to_city: toCity, travel_date: travelDate })
      .then((data) => { if (!cancelled) setResults(data); })
      .catch((err: unknown) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [fromCity, toCity, travelDate]);

  const fmt = formatBusDate(travelDate);

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="bus" />
      <main>
        <BusSearchSection />

        <section className="bg-[#F5F5F5] py-6">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

            {fromCity && toCity && (
              <h2 className="mb-4 text-lg font-bold text-[#212121]">
                {fromCity} → {toCity}
                <span className="ml-2 text-sm font-normal text-[#757575]">
                  {fmt.day} {fmt.mo}'{fmt.yr} · {fmt.wd}
                </span>
              </h2>
            )}

            {loading ? (
              <div className="flex flex-col gap-4">
                {[1,2,3].map((n) => (
                  <div key={n} className="h-40 animate-pulse rounded-xl bg-white shadow-sm" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700">
                {error}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-12 text-center">
                <p className="text-[15px] font-semibold text-[#212121]">No buses found for this route</p>
                <p className="mt-1 text-sm text-[#757575]">Try a different date or nearby city.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {results.map((bus) => (
                  <BusResultCard key={bus.id} bus={bus}
                    onBook={() => router.push(`/bus/book/${bus.id}?${sp.toString()}`)} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}