"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { TourPackage } from "@/lib/constants";
import { PackageListingPaginated } from "@/components/packages/package-listing-paginated";

function PackageListingWithSearchInner({ tours }: { tours: TourPackage[] }) {
  const sp = useSearchParams();
  const q = useMemo(() => {
    const raw = sp.get("q");
    return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
  }, [sp]);

  return (
    <>
      {q ? (
        <p className="mb-3 text-xs text-slate-600 sm:text-sm">
          Showing matches for{" "}
          <span className="font-semibold text-slate-800">&ldquo;{q}&rdquo;</span>{" "}
          <Link href="/packages" className="font-semibold text-primary hover:underline">
            Clear filter
          </Link>
        </p>
      ) : null}
      <PackageListingPaginated tours={tours} textFilter={q} />
    </>
  );
}

/** Reads `?q=` on the client so `/packages` stays static-export friendly. */
export function PackageListingWithSearch({ tours }: { tours: TourPackage[] }) {
  return (
    <Suspense fallback={<PackageListingPaginated tours={tours} />}>
      <PackageListingWithSearchInner tours={tours} />
    </Suspense>
  );
}
