import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { BlogPost } from "@/lib/constants";
import { BlogPreviewCarousel } from "@/components/home/blog-preview-carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BlogPreviewProps = {
  posts: BlogPost[];
  className?: string;
};

export function BlogPreview({ posts, className }: BlogPreviewProps) {
  return (
    <section
      id="blog"
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-white via-orange-50/30 to-white py-10 sm:py-12 lg:py-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Travel journal
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
              Guides for smarter holidays
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Destination tips, seasonal advice, and itinerary ideas — swipe through our latest
              stories. Three featured reads at a glance, with more just a slide away.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="self-start rounded-full border-primary/30 bg-white/80 px-6 shadow-sm backdrop-blur hover:border-primary hover:bg-primary hover:text-white"
          >
            <Link href="/blog">View all articles</Link>
          </Button>
        </div>

        <BlogPreviewCarousel posts={posts} />
      </div>
    </section>
  );
}
