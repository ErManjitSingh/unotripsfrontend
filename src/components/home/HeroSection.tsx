import { HeroSplitBackground } from "@/components/home/hero-split-background";
import { HolidayPackagesSearchBar, TrustBadgesBar } from "@/components/home/holiday-packages-search-bar";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";
import { cn } from "@/lib/utils";

export type HeroSectionProps = {
  searchCatalog: HeroSearchCatalog;
  className?: string;
};

export function HeroSection({ searchCatalog, className }: HeroSectionProps) {
  return (
    <section
      className={cn("relative z-20 w-full -mt-[68px] sm:-mt-[72px]", className)}
    >
      <div className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
        {/* Full-bleed slideshow */}
        <div className="absolute inset-0 overflow-hidden">
          <HeroSplitBackground />
        </div>

        {/* Content — headline + search card + trust bar all inside the banner */}
        <div
          className="relative z-40 flex w-full flex-col items-center px-3 pb-6 sm:pb-4 sm:px-6 lg:px-8 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]"
        >
          {/* Headline */}
          <div className="flex flex-col items-center pt-[88px] text-center sm:pt-[110px]">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-8 bg-amber-400/70 sm:w-12" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-xs">
                Incredible India
              </p>
              <span className="h-px w-8 bg-amber-400/70 sm:w-12" />
            </div>
            <h1 className="max-w-2xl text-2xl font-black leading-tight text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.95)] sm:text-4xl md:text-5xl">
              Your Next{" "}
              <span className="text-amber-400">Adventure</span>
              {" "}Awaits
            </h1>
            <p className="mt-2 text-[13px] font-medium text-white/80 drop-shadow-md sm:mt-3 sm:text-base">
              Discover amazing places at best prices
            </p>
            <div className="mt-3 h-4 sm:h-8" aria-hidden />
          </div>

          {/* Search card */}
          <div className="mt-4 sm:mt-6 w-full max-w-5xl">
            <HolidayPackagesSearchBar catalog={searchCatalog} />
          </div>

          {/* Trust badges — white card, fully inside the banner */}
          <div className="mt-3 w-full max-w-5xl">
            <TrustBadgesBar />
          </div>
        </div>
      </div>
    </section>
  );
}
