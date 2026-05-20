import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
