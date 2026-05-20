import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock,
  Compass,
  Sparkles,
} from "lucide-react";
import type { BlogPost } from "@/lib/blog-api";
import { BlogListingExplorer } from "@/components/blog/blog-listing-explorer";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";
import { cn } from "@/lib/utils";

type BlogListingViewProps = {
  posts: BlogPost[];
};

function ExplorerFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[300px] animate-pulse rounded-xl border border-slate-100 bg-white"
        />
      ))}
    </div>
  );
}

export function BlogListingView({ posts }: BlogListingViewProps) {
  const featured = posts[0];
  const categoryCount = new Set(
    posts.map((p) => p.category?.slug).filter(Boolean),
  ).size;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-slate-50/80">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className={cn("relative", PAGE_MARGIN_X_CLASS, "mx-auto max-w-6xl pt-5 sm:pt-6")}>
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3 w-3" aria-hidden />
            UNO Travel Journal
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Stories, guides &amp;{" "}
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              travel inspiration
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Destination guides, seasonal tips, and itinerary ideas from our editors.
          </p>

          <dl className="mt-4 flex flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden />
              <dt className="sr-only">Articles</dt>
              <dd className="text-xs font-semibold text-ink">
                {posts.length} {posts.length === 1 ? "article" : "articles"}
              </dd>
            </div>
            {categoryCount > 0 ? (
              <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <Compass className="h-3.5 w-3.5 text-primary" aria-hidden />
                <dt className="sr-only">Topics</dt>
                <dd className="text-xs font-semibold text-ink">{categoryCount} topics</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {featured ? (
        <div className={cn("relative mt-6 sm:mt-7", PAGE_MARGIN_X_CLASS, "mx-auto max-w-6xl")}>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Featured story
          </p>
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative grid overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_12px_36px_-16px_rgba(15,23,42,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_rgba(234,88,12,0.2)] sm:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
          >
            <div className="relative min-h-[160px] sm:min-h-0 sm:h-full">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                priority
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 280px"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-transparent"
                aria-hidden
              />
              {featured.category ? (
                <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-primary to-orange-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                  {featured.category.name}
                </span>
              ) : null}
            </div>

            <div className="relative flex flex-col justify-center p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-500">
                {featured.publishedAt ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                    <CalendarDays className="h-3 w-3 text-primary" aria-hidden />
                    {featured.publishedAt}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                  <Clock className="h-3 w-3 text-primary" aria-hidden />
                  {featured.readMinutes} min read
                </span>
              </div>

              <h2 className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-primary sm:text-xl">
                {featured.title}
              </h2>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {featured.excerpt}
              </p>

              <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-orange-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/20">
                Read featured story
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </Link>
        </div>
      ) : null}

      <div
        className={cn(
          "relative pb-10 pt-8 sm:pb-12 sm:pt-9",
          PAGE_MARGIN_X_CLASS,
          "mx-auto max-w-6xl",
        )}
      >
        {posts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-primary/60" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 font-display text-2xl font-bold text-ink">Coming soon</p>
            <p className="mt-2 text-slate-600">
              Our editors are crafting travel guides — check back shortly.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <Suspense fallback={<ExplorerFallback />}>
            <BlogListingExplorer posts={posts} featuredSlug={featured?.slug} />
          </Suspense>
        )}

        {posts.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 via-orange-50 to-white p-5 text-center shadow-sm sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Plan your next trip
            </p>
            <h2 className="mt-1.5 font-display text-lg font-bold text-ink sm:text-xl">
              Ready to turn inspiration into an itinerary?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-600 sm:text-sm">
              Browse holiday packages and exclusive hotel deals on UNO Trips.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              <Link
                href="/packages"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 sm:text-sm"
              >
                Explore packages
              </Link>
              <Link
                href="/hotels"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-primary/30 hover:text-primary sm:text-sm"
              >
                Search hotels
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
