import { FooterSkeleton } from "@/components/home/home-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EaseNavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EEEEEE] bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center gap-2 px-3 sm:h-[72px] sm:px-4 lg:px-6">
        <Skeleton className="h-9 w-[108px] shrink-0 rounded-md sm:h-10 sm:w-[124px]" />
        <div className="mx-auto hidden flex-1 items-center justify-center gap-1 lg:flex">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-14 shrink-0 rounded-md" />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="hidden h-7 w-28 rounded-full lg:block" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="hidden h-9 w-28 rounded-full sm:block" />
        </div>
      </div>
    </header>
  );
}

export function HotelsHeroSkeleton({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-slate-800 px-3 pb-9 pt-5 sm:px-4 sm:pb-10 sm:pt-6",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="absolute inset-0 rounded-none bg-slate-700/80" />
      <div className="relative z-10 mx-auto w-full max-w-[1180px]">
        <Skeleton className="ml-auto h-6 w-[min(100%,20rem)] rounded-md bg-white/20 sm:h-7" />
        <Skeleton className="mt-4 h-[76px] w-full rounded-xl bg-white/90 sm:mt-5 sm:h-20 sm:rounded-2xl" />
        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-36 rounded-full bg-white/80" />
            <Skeleton className="h-9 w-44 rounded-full bg-white/80" />
          </div>
          <Skeleton className="h-9 w-44 rounded-full bg-white/20" />
        </div>
      </div>
    </section>
  );
}

export function HotelsMoroccoBannerSkeleton({ className }: { className?: string }) {
  return (
    <aside className={cn("bg-white px-3 py-5 sm:px-4 sm:py-6 lg:px-6", className)} aria-hidden>
      <div className="mx-auto max-w-[1180px]">
        <Skeleton className="h-[96px] w-full rounded-2xl sm:h-[108px]" />
      </div>
    </aside>
  );
}

export function HotelsExclusiveOffersSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("bg-white px-3 pb-12 sm:px-4 sm:pb-16 lg:px-6", className)} aria-hidden>
      <div className="mx-auto max-w-[1180px]">
        <Skeleton className="h-8 w-44 rounded-md" />
        <div className="mt-4 flex gap-3 overflow-hidden sm:mt-5 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[168px] w-[min(280px,78vw)] shrink-0 rounded-xl sm:h-[180px] sm:w-[300px] sm:rounded-2xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HotelsPopularDestinationsSkeleton({ className }: { className?: string }) {
  return (
    <section
      className={cn("bg-[#f5f5f5] px-3 py-10 sm:px-4 sm:py-12 lg:px-6", className)}
      aria-hidden
    >
      <div className="mx-auto max-w-[1180px]">
        <Skeleton className="h-8 w-52 rounded-md" />
        <Skeleton className="mt-2 h-4 w-full max-w-md rounded-md" />
        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-3 md:grid-rows-2 md:h-[400px]">
          <Skeleton className="min-h-[280px] rounded-xl md:row-span-2 md:min-h-0" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:contents">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="min-h-[168px] rounded-xl sm:min-h-[180px] md:min-h-0" />
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-center sm:mt-8">
          <Skeleton className="h-11 w-[180px] rounded-lg" />
        </div>
      </div>
    </section>
  );
}

export function HotelsCityResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading hotel results">
      <main className="min-h-screen bg-[#f5f5f5]">
        <EaseNavbarSkeleton />
        <section className="relative overflow-hidden bg-[#1a1a1a] px-3 py-6 sm:px-4 lg:px-6" aria-hidden>
          <div className="mx-auto max-w-[1180px]">
            <Skeleton className="mx-auto h-7 w-48 rounded-md bg-white/20" />
            <Skeleton className="mt-4 h-20 w-full rounded-xl bg-white/90" />
          </div>
        </section>
        <div className="mx-auto max-w-[1180px] px-3 py-4 sm:px-4 lg:px-6">
          <Skeleton className="h-12 w-full rounded-md" />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row">
            <Skeleton className="h-[480px] w-full rounded-md lg:w-[280px]" />
            <div className="flex flex-1 flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </main>
      <FooterSkeleton />
    </div>
  );
}

export function HotelsPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading hotels">
      <main className="min-h-screen bg-white">
        <EaseNavbarSkeleton />
        <HotelsHeroSkeleton />
        <HotelsMoroccoBannerSkeleton />
        <HotelsExclusiveOffersSkeleton />
        <HotelsPopularDestinationsSkeleton />
      </main>
      <FooterSkeleton />
    </div>
  );
}
