import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹1,650 + ₹206 GST = ₹1,856. Taxes are rounded the same way as the prices. */
export function formatGstEquation(base: number, taxes: number): string | null {
  const room = Math.round(base);
  const gst = Math.round(taxes);
  if (!Number.isFinite(room) || room <= 0 || !Number.isFinite(gst) || gst <= 0) return null;
  return `₹${formatInrAmount(room)} + ₹${formatInrAmount(gst)} GST = ₹${formatInrAmount(room + gst)}`;
}

/**
 * Western-style thousands separators only (ASCII comma).
 * Avoids `toLocaleString("en-IN")` ICU differences between Node SSR and the browser.
 */
export function formatInrAmount(amount: number): string {
  const n = Math.round(Number(amount));
  if (!Number.isFinite(n)) return "0";
  const neg = n < 0;
  const digits = String(Math.abs(n));
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return neg ? `-${withCommas}` : withCommas;
}
