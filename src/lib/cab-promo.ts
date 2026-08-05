/** UNO Cabs welcome offer — first ride 10% off. */

export const CAB_WELCOME_PROMO_CODE = "UNOCABS10";
export const CAB_WELCOME_DISCOUNT_PERCENT = 10;
export const CAB_PROMO_STORAGE_KEY = "uno_cabs_promo_code";

export function normalizePromoCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidCabWelcomeCode(value: string) {
  return normalizePromoCode(value) === CAB_WELCOME_PROMO_CODE;
}

export function readStoredCabPromoCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CAB_PROMO_STORAGE_KEY);
    if (!stored || !isValidCabWelcomeCode(stored)) return null;
    return CAB_WELCOME_PROMO_CODE;
  } catch {
    return null;
  }
}

export function writeStoredCabPromoCode(code: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!code) {
      window.localStorage.removeItem(CAB_PROMO_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CAB_PROMO_STORAGE_KEY, normalizePromoCode(code));
  } catch {
    /* ignore quota / private mode */
  }
}

export function computeCabWelcomeDiscount(totalAmount: number) {
  const discount = Math.round(totalAmount * (CAB_WELCOME_DISCOUNT_PERCENT / 100));
  return {
    discount,
    finalAmount: Math.max(0, totalAmount - discount),
  };
}
