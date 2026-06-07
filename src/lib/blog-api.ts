const DEFAULT_API_ROOT = "https://website.travelwithuno.com";
const API_FETCH_TIMEOUT_MS = 15_000;
const BLOG_PLACEHOLDER_IMAGE = "/images/vietnam-banner-desk.webp";

export type BlogCategory = {
  name: string;
  slug: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  publishedAt: string;
  readMinutes: number;
  content?: string;
  category?: BlogCategory;
  seoTitle?: string;
  seoDescription?: string;
};

type ApiBlogCategory = {
  id?: number;
  name?: string | null;
  slug?: string | null;
};

type ApiBlogPostRow = {
  id?: number | string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  seo_meta_title?: string | null;
  seo_meta_description?: string | null;
  category?: ApiBlogCategory | null;
};

type V1BlogListResponse = {
  posts?: {
    data?: ApiBlogPostRow[];
  };
};

type V1BlogPostResponse = {
  post?: ApiBlogPostRow;
  related?: Array<{
    id?: number | string;
    title?: string | null;
    slug?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    excerpt?: string | null;
  }>;
};

function apiRoot(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_ROOT
  );
}

async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function buildMediaUrl(pathLike: string, root: string): string {
  const p = pathLike.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, "");
  const normalized = clean.startsWith("storage/") ? clean : `storage/${clean}`;
  return `${root.replace(/\/$/, "")}/${normalized}`;
}

function formatPublishedDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function estimateReadMinutes(...texts: Array<string | null | undefined>): number {
  const words = texts
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mapApiPost(row: ApiBlogPostRow, root: string): BlogPost | null {
  const slug = (row.slug ?? "").trim();
  const title = (row.title ?? "").trim();
  if (!slug || !title) return null;

  const featured = (row.featured_image ?? "").trim();
  const coverImage = featured
    ? buildMediaUrl(featured, root)
    : BLOG_PLACEHOLDER_IMAGE;

  const categorySlug = (row.category?.slug ?? "").trim();
  const categoryName = (row.category?.name ?? "").trim();

  return {
    id: String(row.id ?? slug),
    title,
    slug,
    excerpt: (row.excerpt ?? "").trim(),
    coverImage,
    publishedAt: formatPublishedDate(row.published_at),
    readMinutes: estimateReadMinutes(row.content, row.excerpt),
    content: row.content ?? undefined,
    category:
      categorySlug && categoryName
        ? { name: categoryName, slug: categorySlug }
        : undefined,
    seoTitle: (row.seo_meta_title ?? "").trim() || undefined,
    seoDescription: (row.seo_meta_description ?? "").trim() || undefined,
  };
}

async function fetchBlogList(
  root: string,
  options?: { perPage?: number; category?: string },
): Promise<BlogPost[]> {
  const params = new URLSearchParams();
  const perPage = Math.min(options?.perPage ?? 12, 50);
  params.set("per_page", String(perPage));
  if (options?.category?.trim()) {
    params.set("category", options.category.trim());
  }

  let res: Response | null = null;
  try {
    res = await fetch(`${root}/api/v1/blog/posts?${params}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
  } catch {
    return [];
  }

  const raw = await safeJson<V1BlogListResponse>(res);
  const rows = raw?.posts?.data ?? [];
  return rows
    .map((row) => mapApiPost(row, root))
    .filter((p): p is BlogPost => p !== null);
}

async function fetchBlogBySlug(
  root: string,
  slug: string,
): Promise<{ post: BlogPost | null; related: BlogPost[] }> {
  let res: Response | null = null;
  try {
    res = await fetch(
      `${root}/api/v1/blog/posts/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
      },
    );
  } catch {
    return { post: null, related: [] };
  }

  const raw = await safeJson<V1BlogPostResponse>(res);
  const post = raw?.post ? mapApiPost(raw.post, root) : null;
  const related = (raw?.related ?? [])
    .map((row) =>
      mapApiPost(
        {
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          featured_image: row.featured_image,
          published_at: row.published_at,
        },
        root,
      ),
    )
    .filter((p): p is BlogPost => p !== null);

  return { post, related };
}

/** Published posts from `GET /api/v1/blog/posts`. */
export async function getBlogs(
  limit = 12,
  category?: string,
): Promise<BlogPost[]> {
  const root = apiRoot();
  const posts = await fetchBlogList(root, { perPage: limit, category });
  return posts.slice(0, limit);
}

/** Single post from `GET /api/v1/blog/posts/{slug}`. */
export async function getBlogPost(
  slug: string,
): Promise<{ post: BlogPost | null; related: BlogPost[] }> {
  return fetchBlogBySlug(apiRoot(), slug);
}
