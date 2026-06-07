import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";
import { cn } from "@/lib/utils";

function SectionShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6", className)}>
      {children}
    </div>
  );
}

/** Matches `Navbar` ease (~72px) + `HeroSection` (300px) + floating chrome. */
export function NavbarHeroSkeleton() {
  return (
    <div className="relative mb-24 w-full overflow-visible bg-[#0c0a09] sm:mb-28 md:mb-32">
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-800" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/35 to-black/70"
          aria-hidden
        />

        <header className="relative z-10 mx-auto flex h-[68px] min-h-[68px] w-full max-w-[1320px] items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-white/15" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-36 rounded-md bg-white/20 sm:w-40" />
              <Skeleton className="h-2 w-28 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="hidden items-center gap-1 lg:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 shrink-0 rounded-lg bg-white/10" />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="hidden h-7 w-24 rounded-full bg-white/15 sm:block" />
            <Skeleton className="h-8 w-8 rounded-full bg-white/15" />
            <Skeleton className="hidden h-8 w-24 rounded-full bg-white/20 sm:block" />
          </div>
        </header>

        <div className="relative z-10 flex h-[calc(300px-68px)] min-h-[120px] flex-col items-center justify-center px-4 pb-10 text-center sm:px-6">
          <Skeleton className="h-8 w-[min(90%,18rem)] max-w-lg rounded-lg bg-white/20 sm:h-9" />
          <Skeleton className="mt-2 h-4 w-[min(85%,16rem)] rounded-md bg-white/25 sm:h-5" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex translate-y-[42%] flex-col items-center gap-4 px-3">
          <Skeleton className="h-[58px] w-full max-w-[min(760px,100%)] rounded-full bg-white/90 shadow-xl sm:h-[62px]" />
          <Skeleton className="h-14 w-full max-w-[min(920px,100%)] rounded-full bg-white/90 shadow-lg" />
        </div>
      </div>
    </div>
  );
}

export function SummerEscapesSkeleton({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "border-b border-slate-200/80 bg-slate-100 py-6 sm:py-8 lg:py-10",
        className,
      )}
    >
      <SectionShell>
        <Skeleton className="mx-auto h-6 w-48 rounded-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}

export function TrendingToursSectionSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("py-10 sm:py-12", className)}>
      <SectionShell>
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="mt-6 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 min-w-[260px] shrink-0 rounded-2xl" />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}

export function TestimonialsSectionSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("py-5 sm:py-6", className)}>
      <SectionShell>
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
      </SectionShell>
    </section>
  );
}

export function BlogPreviewSectionSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("py-8 sm:py-10 lg:py-12", className)}>
      <SectionShell>
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full rounded" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-[1.35rem] border border-slate-100 p-1">
              <Skeleton className="aspect-[16/10] w-full rounded-[1.15rem]" />
              <div className="space-y-2 px-4 pb-4">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="mt-2 h-9 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <main>
      <NavbarHeroSkeleton />
      <div className={PAGE_MARGIN_X_CLASS}>
        <SummerEscapesSkeleton />
        <TrendingToursSectionSkeleton />
        <section className="py-10">
          <SectionShell>
            <Skeleton className="h-8 w-64 rounded-lg" />
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </SectionShell>
        </section>
        <section className="py-10">
          <SectionShell>
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          </SectionShell>
        </section>
        <TestimonialsSectionSkeleton />
        <section className="py-10">
          <SectionShell>
            <Skeleton className="h-8 w-56 rounded-lg" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </SectionShell>
        </section>
        <BlogPreviewSectionSkeleton />
        <section className="py-10">
          <SectionShell>
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="mt-4 h-32 w-full rounded-xl" />
          </SectionShell>
        </section>
      </div>
    </main>
  );
}

export function FooterSkeleton({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-slate-800 bg-slate-950 py-12", className)}>
      <SectionShell>
        <div className="grid gap-8 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-3 w-full bg-white/5" />
              <Skeleton className="h-3 w-4/5 bg-white/5" />
            </div>
          ))}
        </div>
        <Skeleton className="mx-auto mt-10 h-3 w-48 bg-white/10" />
      </SectionShell>
    </footer>
  );
}
