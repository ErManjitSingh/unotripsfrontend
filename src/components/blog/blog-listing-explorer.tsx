"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Search, X } from "lucide-react";
import type { BlogPost } from "@/lib/blog-api";
import { BlogPreviewCard } from "@/components/home/blog-preview-card";
import { cn } from "@/lib/utils";

type BlogListingExplorerProps = {
  posts: BlogPost[];
  featuredSlug?: string;
  className?: string;
};

function normalizeCategorySlug(slug: string) {
  return slug.trim().toLowerCase();
}

export function BlogListingExplorer({
  posts,
  featuredSlug,
  className,
}: BlogListingExplorerProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";

  const [activeCategory, setActiveCategory] = useState(
    initialCategory === "all" ? "all" : normalizeCategorySlug(initialCategory),
  );
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; count: number }>();
    for (const post of posts) {
      if (!post.category?.slug) continue;
      const slug = normalizeCategorySlug(post.category.slug);
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { name: post.category.name, slug, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [posts]);

  const gridPosts = useMemo(() => {
    const base = featuredSlug
      ? posts.filter((p) => p.slug !== featuredSlug)
      : posts.slice(1);

    return base.filter((post) => {
      const matchesCategory =
        activeCategory === "all" ||
        normalizeCategorySlug(post.category?.slug ?? "") === activeCategory;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category?.name.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [posts, featuredSlug, activeCategory, query]);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", slug);
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  return (
    <section className={cn("relative", className)}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              activeCategory === "all"
                ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-md shadow-primary/25"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary",
            )}
          >
            All stories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                activeCategory === cat.slug
                  ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-md shadow-primary/25"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary",
              )}
            >
              {cat.name}
              <span className="ml-1.5 text-xs opacity-80">({cat.count})</span>
            </button>
          ))}
        </div>

        <label className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-9 text-xs text-ink shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>

      {gridPosts.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm backdrop-blur-sm">
          <BookOpen className="mx-auto h-10 w-10 text-primary/70" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 font-display text-xl font-bold text-ink">No articles found</p>
          <p className="mt-2 text-sm text-slate-600">
            Try another category or clear your search to see more travel stories.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              handleCategoryChange("all");
            }}
            className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Show all articles
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {gridPosts.map((post, index) => (
            <BlogPreviewCard
              key={post.id}
              post={post}
              compact
              priority={index < 3}
              className="h-full"
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-ink">{gridPosts.length}</span>{" "}
        {gridPosts.length === 1 ? "article" : "articles"}
        {activeCategory !== "all" ? (
          <>
            {" "}
            in{" "}
            <span className="font-semibold text-primary">
              {categories.find((c) => c.slug === activeCategory)?.name ?? "category"}
            </span>
          </>
        ) : null}
      </p>
    </section>
  );
}
