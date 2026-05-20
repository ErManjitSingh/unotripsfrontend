/**
 * @deprecated Static slug list — no longer used for `generateStaticParams`.
 * Blog posts are rendered dynamically at `/blog/[slug]`.
 */
import slugs from "./blog-slugs.json";

export function getBlogStaticSlugs(): string[] {
  return slugs;
}
