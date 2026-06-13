"use client";

/**
 * src/app/flights/results/page.tsx
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar }              from "@/components/layout/Navbar";
import { Footer }              from "@/components/layout/Footer";
import { FlightSearchSection } from "@/components/flights/FlightSearchSection";
import {
  searchFlights, formatFlightDate, getAirport,
  CABIN_CLASS_LABELS, type FlightResult,
} from "@/lib/flight-api";
import { cn } from "@/lib/utils";

// ─── Flight Result Card ───────────────────────────────────────────────────────

function FlightCard({ flight, onBook }: { flight: FlightResult; onBook: () => void }) {
  const stopsLabel = flight.stops === 0 ? "Non-stop" : flight.stops === 1 ? "1 Stop" : `${flight.stops} Stops`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      {/* Airline logo + name */}
      <div className="flex items-center gap-3 border-b border-[#EEEEEE] px-5 py-4 sm:w-[180px] sm:flex-col sm:items-start sm:border-b-0 sm:border-r sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD] text-[12px] font-bold text-[#1565C0]">
          {flight.airline_code}
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#212121]">{flight.airline}</p>
          <p className="text-[11px] text-[#9E9E9E]">{flight.flight_no}</p>
          <p className="mt-1 text-[11px] text-[#9E9E9E]">{CABIN_CLASS_LABELS[flight.cabin]}</p>
        </div>
      </div>

      {/* Timings */}
      <div className="flex flex-1 items-center gap-4 px-5 py-4 sm:py-5">
        <div className="text-center">
          <p className="text-[22px] font-bold text-[#212121]">{flight.departure}</p>
          <p className="text-[12px] font-semibold text-[#616161]">{flight.from_code}</p>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <p className="text-[11px] text-[#9E9E9E]">{flight.duration}</p>
          <div className="relative flex w-full items-center">
            <div className="h-[1px] flex-1 bg-[#E0E0E0]" />
            <div className="mx-1 h-2 w-2 rounded-full bg-[#E0E0E0]" />
            <div className="h-[1px] flex-1 bg-[#E0E0E0]" />
          </div>
          <p className={cn("text-[11px] font-semibold", flight.stops === 0 ? "text-green-600" : "text-orange-500")}>
            {stopsLabel}
          </p>
          {flight.stop_info && <p className="text-[10px] text-[#9E9E9E]">{flight.stop_info}</p>}
        </div>
        <div className="text-center">
          <p className="text-[22px] font-bold text-[#212121]">{flight.arrival}</p>
          <p className="text-[12px] font-semibold text-[#616161]">{flight.to_code}</p>
        </div>
      </div>

      {/* Fare + book */}
      <div className="flex items-center justify-between gap-4 border-t border-[#EEEEEE] px-5 py-3 sm:w-[180px] sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:py-5">
        <div className="sm:text-right">
          <p className="text-[22px] font-bold text-[#212121]">₹{flight.fare.toLocaleString("en-IN")}</p>
          {flight.seats_left !== null && flight.seats_left <= 5 && (
            <p className="text-[11px] font-semibold text-red-500">{flight.seats_left} seats left!</p>
          )}
          <p className={cn("text-[11px]", flight.refundable ? "text-green-600" : "text-[#9E9E9E]")}>
            {flight.refundable ? "✓ Refundable" : "Non-refundable"}
          </p>
          <p className="text-[11px] text-[#9E9E9E]">{flight.baggage}</p>
        </div>
        <button type="button" onClick={onBook}
          className="shrink-0 rounded-full bg-[#EF6614] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#E65100]">
          Book Now
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlightsResultsPage() {
  const sp     = useSearchParams();
  const router = useRouter();

  const fromCode  = sp.get("from_code")   ?? "";
  const toCode    = sp.get("to_code")     ?? "";
  const departure = sp.get("departure")   ?? "";

  const fromApt = getAirport(fromCode);
  const toApt   = getAirport(toCode);
  const fmt     = formatFlightDate(departure);

  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!fromCode || !toCode || !departure) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);

    searchFlights({
      from_code:   fromCode,
      to_code:     toCode,
      trip_type:   (sp.get("trip_type") ?? "one_way") as "one_way",
      departure,
      return_date: sp.get("return_date") ?? undefined,
      adults:      Number(sp.get("adults") ?? 1),
      children:    Number(sp.get("children") ?? 0),
      infants:     Number(sp.get("infants") ?? 0),
      cabin:       (sp.get("cabin") ?? "economy") as "economy",
    })
      .then((data) => { if (!cancelled) setResults(data); })
      .catch((err: unknown) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sp.toString()]);

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="flights" />
      <main>
        <FlightSearchSection />
        <section className="bg-[#F5F5F5] py-6">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            {fromApt && toApt && (
              <h2 className="mb-4 text-lg font-bold text-[#212121]">
                {fromApt.city} → {toApt.city}
                <span className="ml-2 text-sm font-normal text-[#757575]">
                  {fmt.day} {fmt.mo}'{fmt.yr} · {fmt.wd}
                </span>
              </h2>
            )}

            {loading ? (
              <div className="flex flex-col gap-4">
                {[1,2,3,4].map((n) => <div key={n} className="h-32 animate-pulse rounded-xl bg-white shadow-sm" />)}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700">{error}</div>
            ) : results.length === 0 ? (
              <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-12 text-center">
                <p className="text-[15px] font-semibold text-[#212121]">No flights found for this route</p>
                <p className="mt-1 text-sm text-[#757575]">Try different dates or a nearby airport.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {results.map((f) => (
                  <FlightCard key={f.id} flight={f}
                    onBook={() => router.push(`/flights/book/${f.id}?${sp.toString()}`)} />
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