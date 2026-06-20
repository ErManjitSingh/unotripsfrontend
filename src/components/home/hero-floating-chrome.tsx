"use client";

import { SearchBar } from "@/components/home/SearchBar";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

export type HeroFloatingChromeProps = {
  catalog: HeroSearchCatalog;
  className?: string;
};

export function HeroFloatingChrome({ catalog }: HeroFloatingChromeProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex justify-center px-3 sm:px-4">
      <div className="pointer-events-auto w-[70%] max-w-[780px]">
        <SearchBar catalog={catalog} />
      </div>
    </div>
  );
}
