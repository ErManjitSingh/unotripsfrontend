import { NextRequest, NextResponse } from "next/server";
import { fetchBackendWithRetry, getBackendOrigin, stripHopByHopHeaders } from "@/lib/backend-fetch";

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`${getBackendOrigin()}/v1/cab-partner/${path.join("/")}`);
  // Preserve query parameters for GET endpoints such as quote payout preview.
  target.search = req.nextUrl.search;
  const headers = new Headers(req.headers);
  ["host", "connection", "content-length", "expect", "accept-encoding"].forEach((key) => headers.delete(key));
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();
  try {
    const upstream = await fetchBackendWithRetry(
      target.toString(),
      { method: req.method, headers, body: body?.byteLength ? body : undefined },
      { timeoutMs: 15_000, maxAttempts: 2, wakeOnFailure: false },
    );
    return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: stripHopByHopHeaders(upstream.headers) });
  } catch {
    return NextResponse.json({ message: "Cab partner service is unavailable. Please try again." }, { status: 503 });
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
