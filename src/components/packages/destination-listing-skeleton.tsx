import { ChevronRight } from "lucide-react";
import { EaseNavbarSkeleton } from "@/components/hotels/hotels-page-skeleton";
import { FooterSkeleton } from "@/components/home/home-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";
import { cn } from "@/lib/utils";

function PackageListRowSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-md border border-[#e0e0e0] bg-white shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)]"
      aria-hidden
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,220px)] xl:grid-cols-[minmax(0,240px)_1fr_minmax(0,228px)]">
        <Skeleton className="aspect-[5/4] min-h-[168px] w-full rounded-none sm:min-h-[176px] lg:min-h-[188px]" />
        <div className="flex flex-col border-t border-[#e0e0e0] p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
          <Skeleton className="mt-2 h-5 w-[92%] max-w-md" />
          <Skeleton className="mt-2 h-4 w-48" />
          <div className="mt-2 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-sm" />
            ))}
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="mt-2 h-3 w-32" />
          <Skeleton className="mt-2 h-3 w-full max-w-lg" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-[#e0e0e0] bg-slate-50 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-8 w-32" />
          <Skeleton className="mt-4 h-9 w-full rounded-md" />
          <Skeleton className="mt-2 h-9 w-full rounded-md" />
          <Skeleton className="mt-3 h-4 w-28 self-center" />
        </div>
      </div>
    </article>
  );
}

function PackageLeadFormSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-col rounded-md border border-[#e0e0e0] bg-white p-3 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] sm:p-3.5"
      aria-hidden
    >
      <Skeleton className="mx-auto h-3.5 w-36" />
      <Skeleton className="mx-auto mt-1 h-2.5 w-48" />
      <div className="mt-2.5 space-y-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-12 shrink-0 rounded-md" />
          <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
        </div>
      </div>
      <Skeleton className="mt-auto h-9 w-full rounded-md sm:mt-2.5" />
    </div>
  );
}

function FilterSidebarSkeleton() {
  return (
    <aside
      className="w-full rounded-md border border-[#e0e0e0] bg-white p-4 shadow-sm"
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-12" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-b border-[#e8e8e8] py-4 last:border-0">
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-9 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

/** Body only — pair with `InnerPagesHeader` or use `DestinationPageLoadingShell`. */
export function DestinationListingSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-[#f4f6f8]", className)}>
      <div
        className={cn(
          "mx-auto min-h-0 w-full max-w-[1320px] px-3 sm:px-4 lg:px-6",
          PAGE_MARGIN_X_CLASS,
        )}
      >
        <section className="border-b border-[#e0e0e0] bg-white">
          <div className="grid w-full items-stretch gap-4 py-4 sm:gap-5 sm:py-5 lg:grid-cols-[1fr_minmax(0,260px)] lg:gap-5 xl:grid-cols-[1fr_minmax(0,272px)]">
            <div className="flex min-h-0 flex-col pr-0 lg:h-full lg:pr-1">
              <nav className="flex flex-wrap items-center gap-1" aria-hidden>
                <Skeleton className="h-3 w-8" />
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <Skeleton className="h-3 w-14" />
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <Skeleton className="h-3 w-40" />
              </nav>
              <Skeleton className="mt-1.5 h-7 w-full max-w-md sm:h-8" />
              <Skeleton className="mt-2 h-2.5 w-full max-w-2xl" />
              <Skeleton className="mt-1.5 h-2.5 w-full max-w-xl" />
              <Skeleton className="mt-1.5 h-2.5 w-20" />
              <div className="mt-auto shrink-0 pt-3 lg:pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
                  ))}
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            <PackageLeadFormSkeleton />
          </div>
        </section>

        <section
          id="all-packages"
          className="w-full pb-8 pt-5 sm:pb-10 sm:pt-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64 sm:h-8" />
              <Skeleton className="h-3 w-72 max-w-full" />
              <Skeleton className="h-7 w-80 max-w-full rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:pt-1">
              <Skeleton className="h-10 w-40 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,290px)_1fr] lg:gap-8">
            <div className="self-start lg:sticky lg:top-[4.75rem] lg:max-h-[calc(100vh-5.25rem)] lg:overflow-y-auto lg:pr-1">
              <FilterSidebarSkeleton />
            </div>
            <div className="flex min-w-0 flex-col gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <PackageListRowSkeleton key={i} />
              ))}
              <div className="mt-4 flex flex-col items-center gap-3 border-t border-[#e8e8e8] pt-6 sm:flex-row sm:justify-between">
                <Skeleton className="h-4 w-56" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-md" />
                  <Skeleton className="h-9 w-8 rounded-md" />
                  <Skeleton className="h-9 w-8 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Full route loading: header + listing skeleton + footer skeleton. */
export function DestinationPageLoadingShell({
  searchHint = "Destination",
}: {
  searchHint?: string;
}) {
  return (
    <div aria-busy="true" aria-label="Loading destination">
      <EaseNavbarSkeleton />
      <DestinationListingSkeleton />
      <FooterSkeleton />
    </div>
  );
}
