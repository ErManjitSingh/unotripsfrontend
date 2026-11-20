"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";
import { siteWhatsAppChatUrl } from "@/lib/site-contact";

const HIDDEN_PREFIXES = ["/partner", "/admin", "/cabs/partner"];

/**
 * Sitewide WhatsApp chat button. Hidden on partner/admin portals that share
 * the root layout.
 */
export function WhatsAppFab() {
  const pathname = usePathname() || "/";
  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <a
      href={siteWhatsAppChatUrl(`Hi ${SITE.name}, I'd like help planning a trip.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp ${SITE.phone}`}
      className="fixed bottom-5 right-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_-8px_rgba(37,211,102,0.65)] transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-7 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2.2} aria-hidden />
    </a>
  );
}
