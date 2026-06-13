"use client";

/**
 * src/app/cabs/results/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /cabs/results?pickup_city=Jaipur&drop_city=Delhi&...
 *
 * Layout mirrors hotel city results:
 *   1. CabsSearchSection (sticky-ish search strip at top)
 *   2. Results grid below
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar }  from "@/components/layout/Navbar";
import { Footer }  from "@/components/layout/Footer";
import { CabsSearchSection } from "@/components/cabs/CabsSearchSection";
import { CabResultCard } from "@/components/cabs/CabResultCard";
import { searchCabs, type CabSearchParams, type CabSearchResult } from "@/lib/cabs-api";

export default function CabsResultsPage() {
  const sp     = useSearchParams();
  const router = useRouter();

  const params: CabSearchParams = {
    pickup_city: sp.get("pickup_city") ?? "",
    drop_city:   sp.get("drop_city")   ?? "",
    drop_state:  sp.get("drop_state")  ?? "",
    trip_type:   (sp.get("trip_type")  ?? "one_way") as CabSearchParams["trip_type"],
    travel_date: sp.get("travel_date") ?? "",
    return_date: sp.get("return_date") ?? undefined,
    passengers:  Number(sp.get("passengers") ?? 1),
  };

  const [results,  setResults]  = useState<CabSearchResult[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!params.pickup_city || !params.drop_city || !params.travel_date) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchCabs(params)
      .then((data) => { if (!cancelled) setResults(data); })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error).message ?? "Something went wrong");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  return (
    <>
      <Navbar variant="ease" />
      <main>
        {/* Search strip */}
        <CabsSearchSection />

        {/* Results */}
        <section className="bg-[#F5F5F5] py-6">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

            {/* Route heading */}
            {params.pickup_city && params.drop_city ? (
              <h2 className="mb-4 text-lg font-bold text-[#212121]">
                {params.pickup_city} → {params.drop_city}
                <span className="ml-2 text-sm font-normal text-[#757575]">
                  ({params.trip_type.replace("_", " ")})
                </span>
              </h2>
            ) : null}

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-52 animate-pulse rounded-xl bg-white shadow-sm"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700">
                {error}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-12 text-center">
                <p className="text-[15px] font-semibold text-[#212121]">
                  No cabs found for this route
                </p>
                <p className="mt-1 text-sm text-[#757575]">
                  Try adjusting your dates or passengers count.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((cab) => (
                  <CabResultCard
                    key={cab.cab_type_id}
                    cab={cab}
                    onBook={() =>
                      router.push(
                        `/cabs/${cab.slug}?${sp.toString()}`,
                      )
                    }
                  />
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