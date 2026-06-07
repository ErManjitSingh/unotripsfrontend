import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Home,
  PenLine,
  Sparkles,
  User,
} from "lucide-react";
import type { BlogPost } from "@/lib/blog-api";
import { prepareBlogHtml } from "@/lib/blog-content";
import { BlogPostSidebar } from "@/components/blog/blog-post-sidebar";
import { BlogPostShare } from "@/components/blog/blog-post-share";
import { BlogPostReadingProgress } from "@/components/blog/blog-post-reading-progress";
import { BlogPreviewCard } from "@/components/home/blog-preview-card";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";
import { cn } from "@/lib/utils";

type BlogPostDetailProps = {
  post: BlogPost;
  related: BlogPost[];
};

function MetaChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-md sm:text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function BlogPostDetail({ post, related }: BlogPostDetailProps) {
  const { html: contentHtml, headings } = post.content
    ? prepareBlogHtml(post.content)
    : { html: "", headings: [] };

  const showLead = Boolean(post.excerpt && contentHtml);

  return (
    <article className="relative min-h-screen overflow-x-hidden bg-[#faf8f6]">
      <BlogPostReadingProgress />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Hero */}
      <header className="relative">
        <div
          className={cn(
            "relative mx-auto w-full max-w-[1320px] px-3 pt-4 sm:px-4 sm:pt-6 lg:px-6",
          )}
        >
          <Link
            href="/blog"
            className="group mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-primary/30 hover:text-primary sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
            All articles
          </Link>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.22)] sm:rounded-[2rem]">
            <div className="relative aspect-[4/3] sm:aspect-[21/9] lg:aspect-[2.4/1]">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent mix-blend-overlay"
                aria-hidden
              />

              <div className="absolute inset-x-0 top-0 p-4 sm:p-6 lg:p-8">
                <nav
                  className="flex flex-wrap items-center gap-1.5 text-[11px] text-white/75 sm:text-xs"
                  aria-label="Breadcrumb"
                >
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 rounded-md px-1 transition hover:bg-white/10 hover:text-white"
                  >
                    <Home className="h-3 w-3" aria-hidden />
                    Home
                  </Link>
                  <ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                  <Link
                    href="/blog"
                    className="rounded-md px-1 transition hover:bg-white/10 hover:text-white"
                  >
                    Blog
                  </Link>
                  {post.category ? (
                    <>
                      <ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                      <Link
                        href={`/blog?category=${post.category.slug}`}
                        className="rounded-md px-1 transition hover:bg-white/10 hover:text-white"
                      >
                        {post.category.name}
                      </Link>
                    </>
                  ) : null}
                </nav>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-primary/30">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Travel guide
                  </span>
                  {post.category ? (
                    <Link
                      href={`/blog?category=${post.category.slug}`}
                      className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur transition hover:bg-white/20"
                    >
                      {post.category.name}
                    </Link>
                  ) : null}
                </div>

                <h1 className="mt-4 max-w-4xl font-display text-2xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
                  {post.title}
                </h1>

                <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                  <MetaChip>
                    <User className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                    UNO Editorial
                  </MetaChip>
                  {post.publishedAt ? (
                    <MetaChip>
                      <CalendarDays className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                      {post.publishedAt}
                    </MetaChip>
                  ) : null}
                  <MetaChip>
                    <Clock className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                    {post.readMinutes} min read
                  </MetaChip>
                  {headings.length > 0 ? (
                    <MetaChip className="hidden sm:inline-flex">
                      <BookOpen className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                      {headings.length} sections
                    </MetaChip>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        className={cn(
          "relative mx-auto w-full max-w-[1320px] px-3 pb-12 pt-8 sm:px-4 sm:pb-16 sm:pt-10 lg:px-6",
        )}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            {showLead ? (
              <div className="blog-lead-card">
                <p className="blog-lead">{post.excerpt}</p>
              </div>
            ) : post.excerpt && !contentHtml ? (
              <p className="blog-lead">{post.excerpt}</p>
            ) : null}

            <div className="lg:hidden">
              <BlogPostShare title={post.title} slug={post.slug} variant="pill" />
            </div>

            <div className="blog-article-panel">
              {contentHtml ? (
                <div
                  className="blog-content blog-content--article"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : post.excerpt ? (
                <div className="blog-content blog-content--article">
                  <p>{post.excerpt}</p>
                </div>
              ) : null}
            </div>

            {/* Author */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)] sm:flex sm:gap-5 sm:p-7">
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl"
                aria-hidden
              />
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 text-2xl font-bold text-white shadow-lg shadow-primary/25">
                U
              </div>
              <div className="relative mt-4 sm:mt-0">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  <PenLine className="h-3.5 w-3.5" aria-hidden />
                  Written by
                </p>
                <p className="mt-2 font-display text-xl font-bold text-ink">
                  UNO Trips Editorial Team
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                  Practical destination guides, seasonal tips, and itinerary ideas from
                  experts who plan holidays across India and abroad.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-primary/25 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Enjoyed this read?
              </p>
              <p className="mt-2 font-display text-lg font-bold text-ink sm:text-xl">
                Share it with fellow travellers
              </p>
              <BlogPostShare
                title={post.title}
                slug={post.slug}
                className="mt-4"
                variant="pill"
              />
            </div>
          </div>

          <BlogPostSidebar post={post} headings={headings} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <section className="relative border-t border-slate-200/80 bg-white py-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            aria-hidden
          />
          <div className={cn("mx-auto w-full max-w-[1320px]", PAGE_MARGIN_X_CLASS)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Keep exploring
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  More stories you&apos;ll love
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/25 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                View all articles
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <BlogPreviewCard
                  key={item.id}
                  post={item}
                  priority={index === 0}
                  compact
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Bottom CTA strip */}
      <section className="border-t border-slate-200/80 bg-gradient-to-br from-ink via-slate-900 to-[#431407] py-10 text-white sm:py-12">
        <div className={cn("mx-auto max-w-3xl text-center", PAGE_MARGIN_X_CLASS)}>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
            Plan with UNO
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            Ready to book your next escape?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/75 sm:text-base">
            Browse curated holiday packages and hand-picked hotel stays — all in one place.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110"
            >
              Explore packages
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/hotels"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
            >
              Search hotels
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
