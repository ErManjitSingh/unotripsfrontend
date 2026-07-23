export const HIMACHAL_GOOGLE_ADS_ID = "AW-17928878008";
export const HIMACHAL_GOOGLE_ADS_CONVERSION =
  "AW-17928878008/xcUNCIPosfIbELjvk-VC";

const EC_STORAGE_KEY = "uno_hs_enhanced_conversion";

export type HimachalConversionUserData = {
  email?: string;
  phone_number?: string;
};

/** Normalize Indian / international phone to E.164 (+91...). */
export function toE164Phone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return undefined;
}

export function buildHimachalUserData(input: {
  email?: string;
  phone?: string;
}): HimachalConversionUserData | undefined {
  const email = (input.email || "").trim().toLowerCase();
  const phone_number = input.phone ? toE164Phone(input.phone) : undefined;
  const user_data: HimachalConversionUserData = {};
  if (email && email.includes("@")) user_data.email = email;
  if (phone_number) user_data.phone_number = phone_number;
  return Object.keys(user_data).length ? user_data : undefined;
}

export function stashHimachalConversionUserData(
  user_data: HimachalConversionUserData | undefined,
): void {
  if (typeof window === "undefined" || !user_data) return;
  try {
    sessionStorage.setItem(EC_STORAGE_KEY, JSON.stringify(user_data));
  } catch {
    /* ignore */
  }
}

export function readStashedHimachalConversionUserData():
  | HimachalConversionUserData
  | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(EC_STORAGE_KEY);
    if (!raw) return undefined;
    sessionStorage.removeItem(EC_STORAGE_KEY);
    return JSON.parse(raw) as HimachalConversionUserData;
  } catch {
    return undefined;
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Fire Google Ads conversion with Enhanced Conversions user_data. */
export function trackHimachalAdsConversion(input?: {
  email?: string;
  phone?: string;
  user_data?: HimachalConversionUserData;
}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const user_data =
    input?.user_data ||
    buildHimachalUserData({ email: input?.email, phone: input?.phone });

  if (user_data) stashHimachalConversionUserData(user_data);

  const payload: Record<string, unknown> = {
    send_to: HIMACHAL_GOOGLE_ADS_CONVERSION,
    allow_enhanced_conversions: true,
    value: 1.0,
    currency: "INR",
  };
  if (user_data) payload.user_data = user_data;

  window.gtag("event", "conversion", payload);
  try {
    sessionStorage.setItem("uno_hs_conversion_fired", "1");
  } catch {
    /* ignore */
  }
}