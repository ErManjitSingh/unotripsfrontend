import { NextResponse } from "next/server";
import { sendMetaLeadMail } from "@/lib/meta/send-meta-lead-mail";

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

function digitsPhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "").trim();
}

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
  const phone = digitsPhone(String(body.phone ?? ""));
  const email = String(body.email ?? "").trim();
  const destination =
    String(body.destination ?? "Himachal").trim() || "Himachal";
  const city = String(body.city ?? "").trim();
  const packageTitle = String(body.package ?? "").trim();
  const message = String(body.message ?? "").trim();
  const landingPage =
    String(body.landingPage ?? "").trim() || "Himachal Special Landing Page";
  const captureType = String(body.captureType ?? "form").trim() || "form";

  if (!phone || phone.replace(/\D/g, "").length < 10) {
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

  const crmPayload = {
    name: name || (captureType === "chatbot" ? "Himachal Chatbot Lead" : "Himachal Lead"),
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

  let crmOk = false;
  let crmMessage = "";
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(crmPayload),
      signal: AbortSignal.timeout(12000),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    crmOk = res.ok && data.success !== false;
    crmMessage = data.message || (crmOk ? "Lead saved" : "CRM rejected lead");
    if (!crmOk) {
      console.error("[meta/leads] CRM failed", res.status, data);
    }
  } catch (err) {
    console.error("[meta/leads] CRM unreachable", err);
    crmMessage = "CRM unreachable";
  }

  let mailOk = false;
  try {
    mailOk = await sendMetaLeadMail({
      name: crmPayload.name,
      phone,
      email: email || undefined,
      destination,
      city: city || undefined,
      packageTitle: packageTitle || undefined,
      landingPage,
      captureType,
      message: message || undefined,
    });
  } catch (err) {
    console.error("[meta/leads] mail failed", err);
  }

  // Match PHP behaviour: succeed if CRM OR mail works.
  if (crmOk || mailOk) {
    return NextResponse.json({
      success: true,
      message: "Lead saved",
      crm: crmOk,
      mail: mailOk,
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: crmMessage || "Could not save enquiry. Please call us.",
    },
    { status: 502 },
  );
}