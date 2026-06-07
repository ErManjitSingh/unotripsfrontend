import { TrendingTourCard } from "@/components/home/trending-tour-card";
import { TrendingToursCarousel } from "@/components/swiper/swiper-client";
import type { TourPackage } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TrendingToursProps = {
  tours: TourPackage[];
  className?: string;
};

export function TrendingTours({ tours, className }: TrendingToursProps) {
  return (
    <section
      id="packages"
      className={cn("bg-white py-16 sm:py-20 lg:py-24", className)}
    >
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              Packages guests love
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Curated routes with clear pricing — use arrows to browse more packages.
            </p>
          </div>
        </div>

        <div className="relative mt-10 w-full">
          <TrendingToursCarousel className="!pb-4 !pt-1 trending-packages-swiper">
            {tours.map((tour) => (
              <TrendingTourCard key={tour.id} tour={tour} />
            ))}
          </TrendingToursCarousel>
        </div>
      </div>
    </section>
  );
}
