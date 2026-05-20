import { SITE } from "@/lib/constants";

/** `tel:` href using site phone (spaces stripped). */
export function siteTelHref(): string {
  return `tel:${SITE.phone.replace(/\s/g, "")}`;
}

/** WhatsApp deep link (`wa.me` expects country + number, no `+`). */
export function siteWhatsAppChatUrl(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappPhoneDigits}`;
  const m = message?.trim();
  if (!m) return base;
  return `${base}?text=${encodeURIComponent(m)}`;
}

/** Prefilled line for package-related WhatsApp chats. */
export function packageWhatsAppPrefill(tourTitle: string, sku?: string): string {
  const title = tourTitle.trim();
  const code = sku?.trim();
  if (code && title) return `Hi ${SITE.name}, I'd like details on ${code} — ${title}`;
  if (title) return `Hi ${SITE.name}, I'd like details on: ${title}`;
  return `Hi ${SITE.name}, I'd like help choosing a tour.`;
}
