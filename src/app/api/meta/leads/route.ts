import { NextResponse } from "next/server";

type LeadBody = {
  name?: string;
  phone?: string;
  email?: string;
  destination?: string;
  city?: string;
  package?: string;
  message?: string;
  landingPage?: string;
  captureType?: string;
};

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const destination = String(body.destination ?? "Himachal").trim() || "Himachal";
  const city = String(body.city ?? "").trim();
  const packageTitle = String(body.package ?? "").trim();
  const message = String(body.message ?? "").trim();
  const landingPage =
    String(body.landingPage ?? "").trim() || "Himachal Special Landing Page";
  const captureType = String(body.captureType ?? "form").trim() || "form";

  if (!phone) {
    return NextResponse.json(
      { success: false, message: "Phone is required" },
      { status: 422 },
    );
  }

  const apiUrl =
    process.env.UNO_CRM_LEAD_API_URL ||
    "https://app.unotrips.com/api/public/leads";
  const apiKey =
    process.env.UNO_CRM_LEAD_API_KEY || "unotrips-meta-lead-2026-secure";

  const payload = {
    name: name || "Himachal Lead",
    phone,
    email: email || undefined,
    destination,
    city: city || undefined,
    source: "DPW",
    sourceLabel: "DPW",
    landingPage,
    message: message || undefined,
    package: packageTitle || undefined,
    captureType,
    channel: "website",
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };

    if (!res.ok || data.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Could not save enquiry",
        },
        { status: res.ok ? 502 : res.status },
      );
    }

    return NextResponse.json({ success: true, message: "Lead saved" });
  } catch (err) {
    console.error("[meta/leads]", err);
    return NextResponse.json(
      { success: false, message: "CRM unreachable. Please call us." },
      { status: 502 },
    );
  }
}
