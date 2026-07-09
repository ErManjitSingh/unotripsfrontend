"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TourPackage } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PackageListRow } from "@/components/packages/package-list-row";

const PAGE_SIZE = 5;

export type PackageListingPaginatedProps = {
  tours: TourPackage[];
  /** Case-insensitive match on title, location, slug, id (from `?q=`). */
  textFilter?: string;
};

export function PackageListingPaginated({ tours, textFilter }: PackageListingPaginatedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "popular";

  const filtered = useMemo(() => {
    const q = textFilter?.trim().toLowerCase();
    const list = !q
      ? tours
      : tours.filter((t) => {
          const blob = [t.title, t.location, t.slug, t.id].filter(Boolean).join(" ").toLowerCase();
          return blob.includes(q);
        });
    if (sort === "price_asc") return [...list].sort((a, b) => a.priceINR - b.priceINR);
    if (sort === "price_desc") return [...list].sort((a, b) => b.priceINR - a.priceINR);
    return list;
  }, [tours, textFilter, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [page, setPage] = useState(1);

  const tourKey = useMemo(() => filtered.map((t) => t.id).join("|"), [filtered]);

  useEffect(() => {
    setPage(1);
  }, [tourKey, textFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const slice = useMemo(() => filtered.slice(start, start + PAGE_SIZE), [filtered, start]);

  const scrollToListing = () => {
    document.getElementById("all-packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    scrollToListing();
  };

  if (tours.length === 0) return null;

  if (total === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-slate-700">
        No packages match{" "}
        <span className="font-semibold text-slate-900">&ldquo;{textFilter?.trim()}&rdquo;</span>. Try a shorter
        keyword or{" "}
        <button
          type="button"
          className="font-semibold text-primary underline"
          onClick={() => router.push("/packages")}
        >
          view all packages
        </button>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-5">
        {slice.map((t, idx) => {
          const globalIndex = start + idx;
          return <PackageListRow key={t.id} tour={t} showPopularTag={globalIndex === 0} />;
        })}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-col items-center gap-3 border-t border-[#e8e8e8] pt-6 sm:flex-row sm:justify-between"
          aria-label="Package list pagination"
        >
          <p className="order-2 text-center text-xs text-slate-600 sm:order-1 sm:text-left">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {start + 1}–{end}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{total}</span> · Page {safePage} of {totalPages}
          </p>
          <div className="order-1 flex flex-wrap items-center justify-center gap-1.5 sm:order-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-md px-3"
              disabled={safePage <= 1}
              onClick={() => goTo(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </Button>
            {totalPages <= 9 ? (
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goTo(n)}
                    className={cn(
                      "flex h-9 min-w-9 items-center justify-center rounded-md border text-xs font-semibold transition",
                      n === safePage
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-[#e0e0e0] bg-white text-slate-700 hover:border-primary/40 hover:text-primary",
                    )}
                    aria-label={`Page ${n}`}
                    aria-current={n === safePage ? "page" : undefined}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <span className="px-2 text-xs font-medium text-slate-600">
                Page {safePage} / {totalPages}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-md px-3"
              disabled={safePage >= totalPages}
              onClick={() => goTo(safePage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </nav>
      ) : (
        <p className="mt-6 text-center text-xs text-slate-600">
          Showing all {total} package{total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
