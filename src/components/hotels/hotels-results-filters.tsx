"use client";

import { useEffect, useState } from "react";
import {
  HOTEL_PRICE_BANDS,
  type HotelListing,
} from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

export type HotelFiltersState = {
  bookWithZero: boolean;
  freeCancellation: boolean;
  freeBreakfast: boolean;
  freeParking: boolean;
  priceBands: string[];
  stars: number[];
  amenities: string[];
  propertyTypes: string[];
};

export const EMPTY_HOTEL_FILTERS: HotelFiltersState = {
  bookWithZero: false,
  freeCancellation: false,
  freeBreakfast: false,
  freeParking: false,
  priceBands: [],
  stars: [],
  amenities: [],
  propertyTypes: [],
};

type HotelsResultsFiltersProps = {
  hotels: HotelListing[];
  filters: HotelFiltersState;
  onChange: (next: HotelFiltersState) => void;
  onReset: () => void;
  className?: string;
};

function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
  badge,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2 py-1.5 text-[13px] text-[#424242] hover:text-[#212121]"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#BDBDBD] accent-[#2196F3]"
      />
      <span className="flex flex-wrap items-center gap-1.5 leading-snug">
        {label}
        {badge ? (
          <span className="rounded bg-[#E53935] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border-b border-[#e8e8e8] py-3.5" open={defaultOpen}>
      <summary className="cursor-pointer list-none text-[13px] font-bold text-[#212121] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {title}
          <span className="text-[#9E9E9E] transition group-open:rotate-180" aria-hidden>
            ⌄
          </span>
        </span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

type FacetOption = { label: string; count: number };

function topFacetCounts(values: Array<string | undefined>, limit = 6): FacetOption[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const value of values) {
    const label = value?.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { label, count: 1 });
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function HotelsResultsFilters({
  hotels,
  filters,
  onChange,
  onReset,
  className,
}: HotelsResultsFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setMobileOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const patch = (partial: Partial<HotelFiltersState>) => onChange({ ...filters, ...partial });

  const toggleInList = <T extends string | number>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const starOptions = [5, 4, 3, 2, 1]
    .map((stars) => ({ stars, label: `${stars} Star`, count: hotels.filter((h) => h.stars === stars).length }))
    .filter((option) => option.count > 0);

  const amenityOptions = topFacetCounts(hotels.flatMap((h) => h.amenities));
  const tagOptions = topFacetCounts(hotels.flatMap((h) => h.tags), 8);

  return (
    <aside className={cn("w-full rounded-md border border-[#e0e0e0] bg-white shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-[#e8e8e8] px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 lg:pointer-events-none"
          aria-expanded={mobileOpen}
        >
          <h2 className="text-[13px] font-bold text-[#212121]">Filters</h2>
          <span className="text-[#9E9E9E] transition lg:hidden" aria-hidden>
            {mobileOpen ? "⌃" : "⌄"}
          </span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] font-semibold text-[#2196F3] hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className={cn("px-4 pb-4", !mobileOpen && "hidden lg:block")}>
        <FilterSection title="Show Properties With">
          <FilterCheckbox
            id="f-zero"
            label="Book with ₹0 Payment"
            badge="New"
            checked={filters.bookWithZero}
            onChange={(v) => patch({ bookWithZero: v })}
          />
          <FilterCheckbox
            id="f-cancel"
            label="Free Cancellation"
            checked={filters.freeCancellation}
            onChange={(v) => patch({ freeCancellation: v })}
          />
          <FilterCheckbox
            id="f-breakfast"
            label="Free Breakfast"
            checked={filters.freeBreakfast}
            onChange={(v) => patch({ freeBreakfast: v })}
          />
          <FilterCheckbox
            id="f-parking"
            label="Free Parking"
            checked={filters.freeParking}
            onChange={(v) => patch({ freeParking: v })}
          />
        </FilterSection>

        <FilterSection title="Price (PER NIGHT)">
          {HOTEL_PRICE_BANDS.map((band) => (
            <FilterCheckbox
              key={band.id}
              id={`price-${band.id}`}
              label={band.label}
              checked={filters.priceBands.includes(band.id)}
              onChange={() => patch({ priceBands: toggleInList(filters.priceBands, band.id) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Star Rating">
          {starOptions.map(({ stars, label, count }) => {
            return (
              <FilterCheckbox
                key={stars}
                id={`star-${stars}`}
                label={`${label} [${count}]`}
                checked={filters.stars.includes(stars)}
                onChange={() => patch({ stars: toggleInList(filters.stars, stars) })}
              />
            );
          })}
        </FilterSection>

        <FilterSection title="Amenities" defaultOpen={false}>
          {amenityOptions.map((amenity) => (
            <FilterCheckbox
              key={amenity.label}
              id={`amenity-${amenity.label}`}
              label={`${amenity.label} [${amenity.count}]`}
              checked={filters.amenities.includes(amenity.label)}
              onChange={() => patch({ amenities: toggleInList(filters.amenities, amenity.label) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Popular Tags" defaultOpen={false}>
          {tagOptions.map((type) => (
            <FilterCheckbox
              key={type.label}
              id={`type-${type.label}`}
              label={`${type.label} [${type.count}]`}
              checked={filters.propertyTypes.includes(type.label)}
              onChange={() =>
                patch({ propertyTypes: toggleInList(filters.propertyTypes, type.label) })
              }
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}
