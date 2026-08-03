"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution, getTrackingConsent, initialiseTracking, trackEvent } from "@/lib/marketing-tracking";

export function MarketingTracking() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    const setup = () => {
      const consent = getTrackingConsent();
      if (!consent) return;
      initialiseTracking(consent);
      const pagePath = `${window.location.pathname}${window.location.search}`;
      trackEvent("page_view", { page_path: pagePath });
      if (consent.marketing) window.fbq?.("track", "PageView");
    };
    setup();
    window.addEventListener("uno:tracking-consent", setup);
    return () => window.removeEventListener("uno:tracking-consent", setup);
  }, []);

  useEffect(() => {
    const consent = getTrackingConsent();
    if (!consent) return;
    initialiseTracking(consent);
    trackEvent("page_view", { page_path: `${pathname}${window.location.search}` });
    if (consent.marketing) window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
