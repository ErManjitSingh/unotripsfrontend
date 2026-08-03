"use client";

type Consent = { analytics: boolean; marketing: boolean; updatedAt: string };
type EventParams = Record<string, string | number | boolean | null | undefined>;
type Fbq = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};
type Clarity = ((...args: unknown[]) => void) & { queue: unknown[][] };

const CONSENT_KEY = "uno_tracking_consent_v1";
const FIRST_TOUCH_KEY = "uno_first_touch_v1";
const LAST_TOUCH_KEY = "uno_last_touch_v1";
const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"] as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: unknown;
    clarity?: Clarity;
  }
}

export type MarketingAttribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>> & {
  landing_path: string;
  referrer: string;
  captured_at: string;
};

function browser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!browser()) return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function cleanParams(params: EventParams = {}) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]),
  );
}

export function getTrackingConsent(): Consent | null {
  return readJson<Consent>(CONSENT_KEY);
}

export function saveTrackingConsent(next: Pick<Consent, "analytics" | "marketing">) {
  if (!browser()) return;
  const consent = { ...next, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("uno:tracking-consent", { detail: consent }));
}

export function captureAttribution(): { firstTouch: MarketingAttribution; lastTouch: MarketingAttribution } | null {
  if (!browser()) return null;
  const query = new URLSearchParams(window.location.search);
  const captured = Object.fromEntries(
    ATTRIBUTION_KEYS.flatMap((key) => {
      const value = query.get(key);
      return value ? [[key, value.slice(0, 160)]] : [];
    }),
  ) as Partial<MarketingAttribution>;
  const touch: MarketingAttribution = {
    ...captured,
    landing_path: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrer: document.referrer ? new URL(document.referrer).hostname.slice(0, 160) : "direct",
    captured_at: new Date().toISOString(),
  };
  const hasCampaign = ATTRIBUTION_KEYS.some((key) => Boolean(touch[key]));
  const existingFirst = readJson<MarketingAttribution>(FIRST_TOUCH_KEY);
  if (!existingFirst && (hasCampaign || touch.referrer !== "direct")) {
    window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
  }
  if (hasCampaign || touch.referrer !== "direct") {
    window.localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(touch));
  }
  return {
    firstTouch: readJson<MarketingAttribution>(FIRST_TOUCH_KEY) || touch,
    lastTouch: readJson<MarketingAttribution>(LAST_TOUCH_KEY) || touch,
  };
}

export function getAttribution() {
  const firstTouch = readJson<MarketingAttribution>(FIRST_TOUCH_KEY);
  const lastTouch = readJson<MarketingAttribution>(LAST_TOUCH_KEY);
  return {
    first_touch_source: firstTouch?.utm_source,
    first_touch_campaign: firstTouch?.utm_campaign,
    last_touch_source: lastTouch?.utm_source,
    last_touch_medium: lastTouch?.utm_medium,
    last_touch_campaign: lastTouch?.utm_campaign,
    landing_path: lastTouch?.landing_path,
  };
}

function initGoogleTag() {
  if (!browser() || document.getElementById("uno-google-tag")) return;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const tagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || gaId || adsId;
  if (!tagId) return;
  const script = document.createElement("script");
  script.id = "uno-google-tag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("js", new Date());
  window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  if (gaId) window.gtag("config", gaId, { send_page_view: false, anonymize_ip: true });
  if (adsId) window.gtag("config", adsId);
}

function initMetaPixel() {
  if (!browser() || window.fbq) return;
  // Keeps the already-live Pixel working while production env values are being added.
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1749891646008468";
  if (!pixelId) return;
  const fbq = ((...args: unknown[]) => fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args)) as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.id = "uno-meta-pixel";
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  window.fbq("init", pixelId);
}

function initClarity() {
  if (!browser() || window.clarity || document.getElementById("uno-clarity")) return;
  const projectId = process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID;
  if (!projectId) return;
  const clarity = ((...args: unknown[]) => { clarity.queue.push(args); }) as unknown as Clarity;
  clarity.queue = [];
  window.clarity = clarity;
  const script = document.createElement("script");
  script.id = "uno-clarity";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  document.head.appendChild(script);
}

export function initialiseTracking(consent: Consent) {
  if (!browser()) return;
  if (consent.analytics || consent.marketing) initGoogleTag();
  if (consent.analytics) initClarity();
  if (consent.marketing) initMetaPixel();
  window.gtag?.("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

const META_EVENTS: Record<string, string> = {
  cab_trip_form_started: "Lead",
  cab_trip_request_submitted: "Lead",
  cab_quote_selected: "InitiateCheckout",
  cab_checkout_started: "InitiateCheckout",
  cab_booking_completed: "Purchase",
  cab_partner_application_submitted: "Lead",
};

export function trackEvent(name: string, params: EventParams = {}) {
  if (!browser()) return;
  const consent = getTrackingConsent();
  if (!consent || (!consent.analytics && !consent.marketing)) return;
  const safe = cleanParams({ ...params, ...getAttribution() });
  window.dataLayer?.push({ event: name, ...safe });
  if (consent.analytics) window.gtag?.("event", name, safe);
  if (consent.marketing && META_EVENTS[name]) {
    window.fbq?.("track", META_EVENTS[name], name === "cab_booking_completed"
      ? { value: params.value || 0, currency: params.currency || "INR" }
      : safe);
  }
  if (consent.marketing && name === "cab_booking_completed") {
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CAB_BOOKING_CONVERSION_LABEL;
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    if (conversionLabel && adsId) {
      window.gtag?.("event", "conversion", {
        send_to: `${adsId}/${conversionLabel}`,
        value: params.value || 0,
        currency: params.currency || "INR",
        transaction_id: params.transaction_id || "",
      });
    }
  }
}

export function trackOnce(key: string, name: string, params: EventParams = {}) {
  if (!browser()) return;
  const storageKey = `uno_tracked_${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Tracking still works when browser storage is unavailable.
  }
  trackEvent(name, params);
}
