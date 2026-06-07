import { NextRequest, NextResponse } from "next/server";

const BACKEND_ORIGIN =
  process.env.HOTELS_API_URL?.replace(/\/$/, "") ??
  "https://unohotels-backend.onrender.com";

const FETCH_TIMEOUT_MS = 25_000;
const RETRY_STATUSES = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 3;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/** Node fetch (undici) rejects upstream requests that carry Expect — breaks POST e.g. guest OTP. */
const STRIP_REQUEST_HEADERS = new Set([
  ...HOP_BY_HOP,
  "expect",
  "accept-encoding",
]);

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[api/hotels]", ...args);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTargetUrl(req: NextRequest, pathSegments: string[]): URL {
  const path = pathSegments.join("/");
  const target = new URL(`${BACKEND_ORIGIN}/${path}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  return target;
}

function forwardRequestHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (STRIP_REQUEST_HEADERS.has(lower)) return;
    headers.set(key, value);
  });
  if (!headers.has("accept")) {
    headers.set("Accept", "application/json");
  }
  return headers;
}

function forwardResponseHeaders(res: Response): Headers {
  const headers = new Headers();
  res.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    headers.set(key, value);
  });
  return headers;
}

async function proxyOnce(
  target: URL,
  method: string,
  headers: Headers,
  body: ArrayBuffer | undefined,
): Promise<Response> {
  return fetch(target.toString(), {
    method,
    headers,
    body: body?.byteLength ? body : undefined,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
}

async function proxyWithRetry(
  target: URL,
  method: string,
  headers: Headers,
  body: ArrayBuffer | undefined,
): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await proxyOnce(target, method, headers, body);
    last = res;
    if (res.ok || !RETRY_STATUSES.has(res.status) || attempt >= MAX_ATTEMPTS - 1) {
      return res;
    }
    devLog("retry", res.status, target.pathname, attempt + 1);
    await sleep(900 * (attempt + 1));
  }
  return last!;
}

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = buildTargetUrl(req, path);
  const method = req.method.toUpperCase();
  const headers = forwardRequestHeaders(req);

  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  devLog(method, target.pathname + target.search);

  try {
    const upstream = await proxyWithRetry(target, method, headers, body);
    const responseHeaders = forwardResponseHeaders(upstream);
    const responseBody = await upstream.arrayBuffer();

    return new NextResponse(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    devLog("proxy error", err);
    return NextResponse.json(
      {
        message: "Hotels API proxy unreachable. Try again shortly.",
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