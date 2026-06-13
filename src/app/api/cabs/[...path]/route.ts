/**
 * src/app/api/cabs/[...path]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxy all /api/cabs/* requests to the backend /v1/cabs/* endpoint.
 * Exact same pattern as /api/hotels/[...path]/route.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import {
  fetchBackendWithRetry,
  getBackendOrigin,
  stripHopByHopHeaders,
} from "@/lib/backend-fetch";

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[api/cabs]", ...args);
  }
}

function buildTargetUrl(req: NextRequest, pathSegments: string[]): URL {
  // Map /api/cabs/search → backend /v1/cabs/search
  const path = ["v1", "cabs", ...pathSegments].join("/");
  const target = new URL(`${getBackendOrigin()}/${path}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  return target;
}

function forwardRequestHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "content-length" ||
      lower === "expect" ||
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
  const target  = buildTargetUrl(req, path);
  const method  = req.method.toUpperCase();
  const headers = forwardRequestHeaders(req);
  const body    =
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
      { timeoutMs: 120_000, maxAttempts: 5, wakeOnFailure: true },
    );

    const responseHeaders = stripHopByHopHeaders(upstream.headers);
    const responseBody    = await upstream.arrayBuffer();

    return new NextResponse(responseBody, {
      status:     upstream.status,
      statusText: upstream.statusText,
      headers:    responseHeaders,
    });
  } catch (err) {
    devLog("proxy error", err);
    return NextResponse.json(
      {
        message: "Cabs API is unavailable. Please try again in a moment.",
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