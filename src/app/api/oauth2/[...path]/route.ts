import { NextRequest, NextResponse } from "next/server";

function getBackendOrigin(): string {
  return process.env.BACKEND_URL ?? "http://localhost:8000";
}

async function handle(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathStr = path.join("/");

  const targetUrl = new URL(getBackendOrigin() + "/v1/oauth2/" + pathStr);
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const skip = ["host", "connection", "content-length", "expect", "accept-encoding"];
    if (!skip.includes(key.toLowerCase())) headers.set(key, value);
  });
  if (!headers.has("accept")) headers.set("accept", "application/json");

  const method = req.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method,
      headers,
      body: body?.byteLength ? body : undefined,
    });
    const responseBody = await upstream.arrayBuffer();
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const skip = ["connection", "keep-alive", "transfer-encoding", "te", "trailer", "upgrade"];
      if (!skip.includes(key.toLowerCase())) responseHeaders.set(key, value);
    });
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: "oauth_service_unavailable" }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;
