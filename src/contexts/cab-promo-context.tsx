"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CAB_WELCOME_PROMO_CODE,
  CAB_WELCOME_DISCOUNT_PERCENT,
  computeCabWelcomeDiscount,
  isValidCabWelcomeCode,
  readStoredCabPromoCode,
  writeStoredCabPromoCode,
} from "@/lib/cab-promo";

type ApplyResult = { ok: true } | { ok: false; error: string };

type CabPromoContextValue = {
  code: string | null;
  isApplied: boolean;
  discountPercent: number;
  applyCode: (raw: string) => ApplyResult;
  clearCode: () => void;
  computeDiscount: (totalAmount: number) => { discount: number; finalAmount: number };
};

const CabPromoContext = createContext<CabPromoContextValue | null>(null);

export function CabPromoProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCode(readStoredCabPromoCode());
    setHydrated(true);
  }, []);

  const applyCode = useCallback((raw: string): ApplyResult => {
    if (!raw.trim()) {
      return { ok: false, error: "Enter a promo code." };
    }
    if (!isValidCabWelcomeCode(raw)) {
      return { ok: false, error: "Invalid code. Try UNOCABS10." };
    }
    setCode(CAB_WELCOME_PROMO_CODE);
    writeStoredCabPromoCode(CAB_WELCOME_PROMO_CODE);
    return { ok: true };
  }, []);

  const clearCode = useCallback(() => {
    setCode(null);
    writeStoredCabPromoCode(null);
  }, []);

  const computeDiscount = useCallback((totalAmount: number) => {
    if (!code) return { discount: 0, finalAmount: totalAmount };
    return computeCabWelcomeDiscount(totalAmount);
  }, [code]);

  const value = useMemo(
    () => ({
      code: hydrated ? code : null,
      isApplied: hydrated && Boolean(code),
      discountPercent: CAB_WELCOME_DISCOUNT_PERCENT,
      applyCode,
      clearCode,
      computeDiscount,
    }),
    [hydrated, code, applyCode, clearCode, computeDiscount],
  );

  return <CabPromoContext.Provider value={value}>{children}</CabPromoContext.Provider>;
}

export function useCabPromo() {
  const ctx = useContext(CabPromoContext);
  if (!ctx) {
    throw new Error("useCabPromo must be used within CabPromoProvider");
  }
  return ctx;
}

export function useCabPromoOptional() {
  return useContext(CabPromoContext);
}
