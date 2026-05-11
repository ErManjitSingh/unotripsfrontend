import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BlogPreviewProps = {
  posts: BlogPost[];
  className?: string;
};

export function BlogPreview({ posts, className }: BlogPreviewProps) {
  return (
    <section id="blog" className={cn("bg-white py-16 sm:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Travel journal
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Guides for smarter holidays
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              SEO-first longform from our destination editors — practical, opinionated,
              and always written for real travelers.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start rounded-full">
            <Link href="/blog">View all articles</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-surface shadow-glass transition hover:-translate-y-1 hover:shadow-lift"
            >
              <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
                  Featured
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {post.publishedAt}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readMinutes} min read
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink group-hover:text-primary">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Read story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
