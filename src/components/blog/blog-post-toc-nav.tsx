"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import type { BlogHeading } from "@/lib/blog-content";
import { cn } from "@/lib/utils";

type BlogPostTocNavProps = {
  headings: BlogHeading[];
  className?: string;
};

export function BlogPostTocNav({ headings, className }: BlogPostTocNavProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className={cn("mt-4", className)} aria-label="Table of contents">
      <ol className="space-y-0.5">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id} className={cn(h.level === 3 && "ml-3")}>
              <a
                href={`#${h.id}`}
                onClick={() => setActiveId(h.id)}
                className={cn(
                  "group flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm leading-snug transition",
                  isActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition",
                    isActive
                      ? "scale-125 bg-primary"
                      : "bg-slate-300 group-hover:bg-primary/60",
                  )}
                  aria-hidden
                />
                <span className="line-clamp-2">{h.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex items-center gap-1.5 px-2.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <ListTree className="h-3 w-3" aria-hidden />
        {headings.length} sections
      </p>
    </nav>
  );
}