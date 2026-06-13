/**
 * src/app/api/flights/[...path]/route.ts
 * Proxies /api/flights/* → backend /v1/flights/*
 */
import { NextRequest, NextResponse } from "next/server";
import { fetchBackendWithRetry, getBackendOrigin, stripHopByHopHeaders } from "@/lib/backend-fetch";

function buildTargetUrl(req: NextRequest, path: string[]): URL {
  const target = new URL(`${getBackendOrigin()}/${["v1","flights",...path].join("/")}`);
  req.nextUrl.searchParams.forEach((v, k) => target.searchParams.append(k, v));
  return target;
}
function forwardHeaders(req: NextRequest): Headers {
  const h = new Headers();
  req.headers.forEach((v, k) => {
    if (!["host","connection","content-length","expect","accept-encoding"].includes(k.toLowerCase())) h.set(k, v);
  });
  if (!h.has("accept")) h.set("Accept", "application/json");
  return h;
}
async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target   = buildTargetUrl(req, path);
  const method   = req.method.toUpperCase();
  const headers  = forwardHeaders(req);
  const body     = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();
  try {
    const up = await fetchBackendWithRetry(target.toString(),
      { method, headers, body: body?.byteLength ? body : undefined },
      { timeoutMs: 120_000, maxAttempts: 5, wakeOnFailure: true });
    return new NextResponse(await up.arrayBuffer(), {
      status: up.status, statusText: up.statusText, headers: stripHopByHopHeaders(up.headers),
    });
  } catch {
    return NextResponse.json({ message: "Flights API unavailable.", status: 503 }, { status: 503 });
  }
}
export const GET = handle; export const POST = handle; export const PUT = handle;
export const DELETE = handle; export const PATCH = handle; export const OPTIONS = handle;