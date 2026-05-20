"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BlogPreviewCardProps = {
  post: BlogPost;
  priority?: boolean;
  compact?: boolean;
  className?: string;
};

export function BlogPreviewCard({
  post,
  priority = false,
  compact = false,
  className,
}: BlogPreviewCardProps) {
  const href = `/blog/${post.slug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border border-slate-200/80 bg-white shadow-[0_4px_20px_-10px_rgba(15,23,42,0.14)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_12px_32px_-12px_rgba(234,88,12,0.2)]",
        compact
          ? "rounded-xl hover:-translate-y-0.5"
          : "rounded-[1.35rem] duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-16px_rgba(234,88,12,0.28)]",
        className,
      )}
    >
      <Link
        href={href}
        className={cn(
          "relative block shrink-0 overflow-hidden",
          compact ? "aspect-[16/9]" : "aspect-[16/10]",
        )}
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 33vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-end justify-between gap-2",
            compact ? "p-2.5" : "p-4",
          )}
        >
          {post.category ? (
            <span
              className={cn(
                "inline-flex max-w-[70%] truncate rounded-full bg-gradient-to-r from-primary to-orange-500 font-bold uppercase tracking-[0.12em] text-white shadow-md",
                compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px] shadow-lg",
              )}
            >
              {post.category.name}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-md backdrop-blur-sm">
            <Clock className="h-3 w-3 text-primary" aria-hidden />
            {post.readMinutes} min
          </span>
        </div>
      </Link>

      <div className={cn("relative flex flex-1 flex-col", compact ? "p-3.5 sm:p-4" : "p-5 sm:p-6")}>
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10"
          aria-hidden
        />

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
          {post.publishedAt ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <CalendarDays className="h-3 w-3 text-primary" aria-hidden />
              {post.publishedAt}
            </span>
          ) : null}
        </div>

        <h3
          className={cn(
            "font-display font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-primary",
            compact ? "mt-2 text-base sm:text-[17px]" : "mt-3 text-lg sm:text-xl",
          )}
        >
          <Link href={href} className="line-clamp-2">
            {post.title}
          </Link>
        </h3>

        <p
          className={cn(
            "flex-1 leading-relaxed text-slate-600",
            compact ? "mt-1.5 line-clamp-2 text-xs" : "mt-2.5 line-clamp-3 text-sm",
          )}
        >
          {post.excerpt}
        </p>

        <Link
          href={href}
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 font-semibold text-primary transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white",
            compact ? "mt-3 px-3 py-1.5 text-xs" : "mt-5 gap-2 px-4 py-2 text-sm",
          )}
        >
          Read story
          <ArrowUpRight
            className={cn(
              "transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}
