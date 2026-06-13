/**
 * src/app/api/revalidate/route.ts
 *
 * Next.js ISR (Incremental Static Regeneration) revalidation endpoint.
 * Called by the Python backend after any content change.
 *
 * Supported types:
 *   blog   → revalidates /blog and /blog/{slug}
 *   hotel  → revalidates /hotel/{slug} (existing behaviour)
 *
 * Security:
 *   Requests must include `x-revalidate-token` header matching
 *   REVALIDATE_SECRET env var. Wrong or missing token → 401.
 *   No token in URL — not exposed to browser.
 *
 * Request body:
 *   { "type": "blog",  "slug": "my-post-slug" }
 *   { "type": "hotel", "city": "shimla", "slug": "hotel-slug" }
 *
 * Called by:
 *   Python backend → app/services/blog/blog_cache.py → _bust_nextjs_isr()
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? "";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const token = req.headers.get("x-revalidate-token");
  if (!REVALIDATE_SECRET || token !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = body.type ?? "";
  const slug = body.slug ?? "";

  // ── Revalidate by type ────────────────────────────────────────────────────
  try {
    if (type === "blog") {
      // Always revalidate the listing page
      revalidatePath("/blog");
      // Revalidate the specific post page if a slug was provided
      if (slug) {
        revalidatePath(`/blog/${slug}`);
      }
      return NextResponse.json({
        revalidated: true,
        type:        "blog",
        paths:       slug ? ["/blog", `/blog/${slug}`] : ["/blog"],
      });
    }

    if (type === "hotel") {
      // Existing hotel revalidation — city + slug required
      const city = body.city ?? "";
      if (!city || !slug) {
        return NextResponse.json(
          { error: "city and slug required for type=hotel" },
          { status: 400 },
        );
      }
      revalidatePath(`/hotel/${slug}`);
      return NextResponse.json({
        revalidated: true,
        type:        "hotel",
        paths:       [`/hotel/${slug}`],
      });
    }

    return NextResponse.json(
      { error: `Unknown revalidation type: ${type}` },
      { status: 400 },
    );
  } catch (err) {
    console.error("[revalidate] revalidatePath failed", err);
    return NextResponse.json(
      { error: "Revalidation failed", detail: String(err) },
      { status: 500 },
    );
  }
}