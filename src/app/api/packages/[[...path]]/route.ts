/**
 * src/app/api/packages/[[...path]]/route.ts
 *
 * Packages API proxy — browser calls /api/packages/* → backend /v1/packages/*
 *
 * WHY [[...path]] (optional catch-all) instead of [...path]:
 * ──────────────────────────────────────────────────────────
 * [...path]  requires at least 1 path segment — misses /api/packages?page=1 (listing)
 * [[...path]] catches ALL of:
 *   /api/packages               → path = []   → backend /v1/packages  (listing)
 *   /api/packages?page=1&sort=x → path = []   → backend /v1/packages?page=1&sort=x
 *   /api/packages/some-slug     → path = ["some-slug"] → backend /v1/packages/some-slug
 *   /api/packages/slug/book     → path = ["slug","book"] → backend /v1/packages/slug/book
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchBackendWithRetry,
  getBackendOrigin,
  stripHopByHopHeaders,
} from "@/lib/backend-fetch";

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[api/packages]", ...args);
  }
}

function buildTargetUrl(req: NextRequest, pathSegments: string[]): URL {
  // pathSegments = [] for listing, ["slug"] for detail, ["slug","book"] for booking
  const subPath = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";
  const target  = new URL(`${getBackendOrigin()}/v1/packages${subPath}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  return target;
}

function forwardHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  const SKIP = new Set(["host", "connection", "content-length", "expect", "accept-encoding"]);
  req.headers.forEach((value, key) => {
    if (!SKIP.has(key.toLowerCase())) headers.set(key, value);
  });
  if (!headers.has("accept")) headers.set("Accept", "application/json");
  return headers;
}

async function handle(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const target        = buildTargetUrl(req, path);
  const method        = req.method.toUpperCase();
  const headers       = forwardHeaders(req);
  const body          = method === "GET" || method === "HEAD"
    ? undefined
    : await req.arrayBuffer();

  devLog(method, target.pathname + target.search);

  // POST/PATCH need longer timeout due to Razorpay API calls in booking service
  const timeoutMs = method === "POST" || method === "PATCH" ? 30_000 : 15_000;

  try {
    const upstream = await fetchBackendWithRetry(
      target.toString(),
      {
        method,
        headers,
        body: body?.byteLength ? body : undefined,
      },
      {
        timeoutMs,
        maxAttempts:   method === "GET" ? 3 : 1,
        wakeOnFailure: false,
      },
    );

    const responseHeaders = stripHopByHopHeaders(upstream.headers);
    const responseBody    = await upstream.arrayBuffer();

    return new NextResponse(responseBody, {
      status:     upstream.status,
      statusText: upstream.statusText,
      headers:    responseHeaders,
    });
  } catch (err) {
    devLog("packages proxy error", err);
    const isPost = method === "POST";
    return NextResponse.json(
      {
        message:    isPost
          ? "Booking service unavailable. Please try again."
          : "Packages API unavailable. Please try again.",
        status:     503,
        data:       null,
        request_id: "proxy-error",
      },
      { status: 503 },
    );
  }
}

export const GET     = handle;
export const POST    = handle;
export const PUT     = handle;
export const PATCH   = handle;
export const DELETE  = handle;
export const OPTIONS = handle;