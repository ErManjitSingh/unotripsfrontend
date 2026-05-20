import Link from "next/link";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";
import type { BlogHeading } from "@/lib/blog-content";
import type { BlogPost } from "@/lib/blog-api";
import { BlogPostShare } from "@/components/blog/blog-post-share";
import { BlogPostTocNav } from "@/components/blog/blog-post-toc-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogPostSidebarProps = {
  post: BlogPost;
  headings: BlogHeading[];
  className?: string;
};

export function BlogPostSidebar({ post, headings, className }: BlogPostSidebarProps) {
  return (
    <aside
      className={cn(
        "space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4",
        className,
      )}
    >
      {headings.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50/80 to-white px-4 py-3.5">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              On this page
            </p>
          </div>
          <div className="px-2 pb-3 pt-1">
            <BlogPostTocNav headings={headings} />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.1)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Share guide
        </p>
        <BlogPostShare title={post.title} slug={post.slug} className="mt-3" variant="pill" />
      </div>

      {post.category ? (
        <Link
          href={`/blog?category=${post.category.slug}`}
          className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-orange-50 to-white p-4 transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Compass className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              More in
            </p>
            <p className="truncate font-semibold text-ink">{post.category.name}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </Link>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl bg-brand-banner p-5 text-white shadow-lift">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <MapPin className="relative h-8 w-8 text-amber-300" strokeWidth={1.5} />
        <h3 className="relative mt-4 font-display text-lg font-bold leading-snug">
          Turn this guide into a real trip
        </h3>
        <p className="relative mt-2 text-sm leading-relaxed text-white/85">
          Curated packages, verified hotels, and support from first quote to checkout.
        </p>
        <div className="relative mt-5 flex flex-col gap-2">
          <Button
            asChild
            className="w-full rounded-full bg-white font-semibold text-primary shadow-md hover:bg-white/95"
          >
            <Link href="/packages">
              Explore packages
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-full border-white/40 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/hotels">Search hotels</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
