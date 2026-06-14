"use client";

/**
 * src/app/trains/results/page.tsx
 * ────────────────────────────────
 * Train search results — frontend placeholder.
 * Reads from, to, date, class from URL query params.
 * Backend integration to be added later.
 */

import { useSearchParams } from "next/navigation";
import { Suspense }        from "react";
import { Navbar }          from "@/components/layout/Navbar";
import { Footer }          from "@/components/layout/Footer";
import { TrainSearchBar }  from "@/components/trains/TrainSearchBar";
import { Train }           from "lucide-react";

function ResultsContent() {
  const params   = useSearchParams();
  const from     = params.get("from")  ?? "";
  const to       = params.get("to")    ?? "";
  const date     = params.get("date")  ?? "";
  const tClass   = params.get("class") ?? "ALL";

  const displayDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <>
      <Navbar variant="ease" />

      {/* Search bar strip */}
      <div className="bg-[#1a237e] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <TrainSearchBar />
        </div>
      </div>

      {/* Results */}
      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <Train className="h-5 w-5 text-[#EF6614]" />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#212121]">
              {from} → {to}
            </h1>
            <p className="text-[12px] text-[#9E9E9E]">
              {displayDate} · {tClass === "ALL" ? "All Classes" : tClass}
            </p>
          </div>
        </div>

        {/* Coming soon placeholder */}
        <div className="rounded-2xl border border-dashed border-[#E0E0E0] bg-[#fafafa] px-8 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
            <Train className="h-8 w-8 text-[#EF6614]" />
          </div>
          <h2 className="text-[18px] font-bold text-[#212121]">Train results coming soon</h2>
          <p className="mt-2 text-[13px] text-[#9E9E9E] max-w-sm mx-auto">
            We&apos;re building the train booking engine. Search results for{" "}
            <strong>{from} → {to}</strong> on {displayDate} will appear here.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-[12px] font-semibold text-[#EF6614]">
            🚂 Backend integration in progress
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function TrainResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResultsContent />
    </Suspense>
  );
}