"use client";

/**
 * src/components/packages/discovery/PackageDiscovery.tsx
 *
 * Discovery container — replaces the old
 * PackageListingWithSearch → PackageListingPaginated → PackageListRow stack.
 *
 * Responsibilities: read `?q=` and `?sort=`, page the results, render the grid.
 * It owns no card markup and no pricing logic.
 *
 * Behaviour deliberately carried over from the old paginated list:
 *   - `?q=` free-text match on title / location / slug / id
 *   - `?sort=` price_asc | price_desc, otherwise API order
 *   - page resets when the result set or query changes
 *   - "no matches" copy with a reset link
 *
 * Changed: page size is 9 (was 5). Five tiles leaves a ragged final row in a
 * 3-up grid; nine fills three rows exactly and cuts a 22-package catalogue
 * from five pages to three.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";

import type { TourPackage } from "@/lib/constants";

import { PackageGrid } from "./PackageGrid";
import { PackagePagination } from "./PackagePagination";

const PAGE_SIZE = 9;

export type PackageDiscoveryProps = {
  tours: TourPackage[];
};

function PackageDiscoveryInner({ tours }: PackageDiscoveryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "popular";
  const rawQuery = searchParams.get("q");
  const textFilter =
    typeof rawQuery === "string" && rawQuery.trim() ? rawQuery.trim() : undefined;

  const filtered = useMemo(() => {
    const q = textFilter?.toLowerCase();
    const list = !q
      ? tours
      : tours.filter((t) => {
          const blob = [t.title, t.location, t.slug, t.id]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
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

  const goTo = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    document.getElementById("all-packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (tours.length === 0) return null;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <SearchX className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
        <p className="mt-3 text-sm font-bold text-slate-900">
          No packages match &ldquo;{textFilter}&rdquo;
        </p>
        <p className="mt-1.5 text-xs text-slate-600">
          Try a shorter keyword, or{" "}
          <button
            type="button"
            className="font-semibold text-primary underline"
            onClick={() => router.push("/packages")}
          >
            view all packages
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {textFilter ? (
        <p className="mb-3 text-xs text-slate-600 sm:text-sm">
          Showing matches for{" "}
          <span className="font-semibold text-slate-800">&ldquo;{textFilter}&rdquo;</span>{" "}
          <Link href="/packages" className="font-semibold text-primary hover:underline">
            Clear filter
          </Link>
        </p>
      ) : null}

      <PackageGrid
        tours={slice}
        popularIndex={safePage === 1 ? 0 : -1}
        priorityCount={3}
      />

      <PackagePagination
        page={safePage}
        totalPages={totalPages}
        rangeStart={start + 1}
        rangeEnd={end}
        total={total}
        onPageChange={goTo}
      />
    </div>
  );
}

/** Reads `?q=` on the client so `/packages` stays static-export friendly. */
export function PackageDiscovery({ tours }: PackageDiscoveryProps) {
  return (
    <Suspense fallback={<PackageGrid tours={tours.slice(0, PAGE_SIZE)} />}>
      <PackageDiscoveryInner tours={tours} />
    </Suspense>
  );
}

export default PackageDiscovery;
