"use client";

import { useEffect, useRef } from "react";
import {
  HIMACHAL_GOOGLE_ADS_CONVERSION,
  readStashedHimachalConversionUserData,
} from "@/lib/meta/himachal-ads-conversion";

/**
 * Backup conversion ping on thank-you.
 * Uses stashed Enhanced Conversions user_data from the enquiry form when present.
 * Skips if already fired in this tab session.
 */
export function HimachalThankYouConversion() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    const already = sessionStorage.getItem("uno_hs_conversion_fired");
    if (already === "1") return;

    fired.current = true;
    sessionStorage.setItem("uno_hs_conversion_fired", "1");

    const user_data = readStashedHimachalConversionUserData();
    const payload: Record<string, unknown> = {
      send_to: HIMACHAL_GOOGLE_ADS_CONVERSION,
      allow_enhanced_conversions: true,
      value: 1.0,
      currency: "INR",
    };
    if (user_data) payload.user_data = user_data;
    window.gtag("event", "conversion", payload);
  }, []);

  return null;
}