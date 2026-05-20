"use client";

import { SearchBar } from "@/components/home/SearchBar";
import { CategoryPills } from "@/components/home/CategoryPills";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";
import { cn } from "@/lib/utils";

export type HeroFloatingChromeProps = {
  catalog: HeroSearchCatalog;
  className?: string;
};

/** Search 70% width; category pills 60% of search (42% viewport). */
export function HeroFloatingChrome({ catalog, className }: HeroFloatingChromeProps) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-[3.25rem] z-30 flex justify-center px-3 sm:bottom-[3.5rem] sm:px-4",
          className,
        )}
      >
        <div className="pointer-events-auto w-[70%] max-w-[780px]">
          <SearchBar catalog={catalog} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 sm:px-4">
        <div className="pointer-events-auto w-[42%] max-w-[468px] translate-y-1/2">
          <CategoryPills />
        </div>
      </div>
    </>
  );
}
