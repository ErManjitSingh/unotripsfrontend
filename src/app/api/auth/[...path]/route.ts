import { NextRequest, NextResponse } from "next/server";
import {
  fetchBackendWithRetry,
  getBackendOrigin,
  stripHopByHopHeaders,
} from "@/lib/backend-fetch";

function buildTargetUrl(pathSegments: string[], searchParams: URLSearchParams): URL {
  const path = pathSegments.join("/");
  const target = new URL(`${getBackendOrigin()}/v1/auth/${path}`);
  searchParams.forEach((value, key) => {
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

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = buildTargetUrl(path, req.nextUrl.searchParams);
  const method = req.method.toUpperCase();
  const headers = forwardRequestHeaders(req);
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

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
    const responseBody = await upstream.arrayBuffer();

    return new NextResponse(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Auth service is waking up. Please wait 30 seconds and try again.",
        status: 503,
        data: null,
      },
      { status: 503 },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const OPTIONS = handle;
