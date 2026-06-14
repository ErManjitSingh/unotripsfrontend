/**
 * src/app/api/partner/[...path]/route.ts
 *
 * Partner API proxy — browser calls /api/partner/v1/partner/* → this handler → backend /v1/partner/*
 *
 * Flow:
 *   Browser fetch: /api/partner/v1/partner/bookings?page=1
 *   pathSegments:  ["v1", "partner", "bookings"]
 *   Forwarded to:  http://localhost:8000/v1/partner/bookings?page=1
 *
 * Auth: Authorization header is forwarded as-is from the browser request.
 * The partner API client (src/lib/partner/api.ts) always attaches Bearer token.
 *
 * All HTTP methods supported — partner portal uses GET, POST, PATCH, DELETE.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchBackendWithRetry,
  getBackendOrigin,
  stripHopByHopHeaders,
} from "@/lib/backend-fetch";

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[api/partner]", ...args);
  }
}

function buildTargetUrl(req: NextRequest, pathSegments: string[]): URL {
  // pathSegments from /api/partner/v1/partner/bookings → ["v1", "partner", "bookings"]
  // Join and prepend / → /v1/partner/bookings
  // Forward to backend as-is — no path prefix rewriting needed.
  const path   = pathSegments.join("/");
  const target = new URL(`${getBackendOrigin()}/${path}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  return target;
}

function forwardHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Strip hop-by-hop headers that must not be forwarded
    if (
      lower === "host"           ||
      lower === "connection"     ||
      lower === "content-length" ||
      lower === "expect"         ||
      lower === "accept-encoding"
    ) {
      return;
    }
    headers.set(key, value);
  });
  if (!headers.has("accept")) {
    headers.set("Accept", "application/json");
  }
  return headers;
}

async function handle(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target   = buildTargetUrl(req, path);
  const method   = req.method.toUpperCase();
  const headers  = forwardHeaders(req);
  const body     =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  devLog(method, target.pathname + target.search);

  try {
    const upstream = await fetchBackendWithRetry(
      target.toString(),
      {
        method,
        headers,
        body: body?.byteLength ? body : undefined,
      },
      {
        timeoutMs:     60_000,   // partner ops (photo uploads etc.) need more time
        maxAttempts:   3,
        wakeOnFailure: true,
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
    devLog("partner proxy error", err);
    return NextResponse.json(
      {
        message: "Partner API unavailable. Please try again.",
        status:  503,
        data:    null,
      },
      { status: 503 },
    );
  }
}

export const GET     = handle;
export const POST    = handle;
export const PUT     = handle;
export const DELETE  = handle;
export const PATCH   = handle;
export const OPTIONS = handle;