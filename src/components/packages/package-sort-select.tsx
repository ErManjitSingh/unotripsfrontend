"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

// Mirrors PackageListParams["sort"] in @/services/packages — only options
// the backend actually supports (no "Duration" — the API has no such sort).
const SORT_OPTIONS = [
  { value: "popular", label: "Deals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

const SELECT_CLASS =
  "rounded-md border border-[#e0e0e0] bg-white px-2.5 py-2 text-xs font-medium text-slate-800 shadow-sm";

function PackageSortSelectInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "popular";

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className={SELECT_CLASS}
      aria-label="Sort packages"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Reads/writes `?sort=` on the client — routes here may render with no ancestor Suspense. */
export function PackageSortSelect() {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm">
      <span className="font-medium">Sort by</span>
      <Suspense
        fallback={
          <select className={SELECT_CLASS} disabled aria-label="Sort packages" defaultValue="popular">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        }
      >
        <PackageSortSelectInner />
      </Suspense>
    </label>
  );
}
