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
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getCabOfferEligibility,
  type CabOfferEligibility,
} from "@/lib/cab-quote-api";
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
  welcomeEligible: boolean | null;
  alreadyUsed: boolean;
  eligibilityLoading: boolean;
  applyCode: (raw: string) => Promise<ApplyResult>;
  clearCode: () => void;
  computeDiscount: (totalAmount: number) => { discount: number; finalAmount: number };
  refreshEligibility: () => Promise<void>;
};

const CabPromoContext = createContext<CabPromoContextValue | null>(null);

export function CabPromoProvider({ children }: { children: ReactNode }) {
  const auth = useAuthOptional();
  const [code, setCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [eligibility, setEligibility] = useState<CabOfferEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  useEffect(() => {
    setCode(readStoredCabPromoCode());
    setHydrated(true);
  }, []);

  const refreshEligibility = useCallback(async () => {
    const token = auth?.getAccessToken?.();
    if (!token) {
      setEligibility(null);
      return;
    }
    setEligibilityLoading(true);
    try {
      const result = await getCabOfferEligibility(token);
      setEligibility(result);
      if (!result.welcome_eligible) {
        setCode(null);
        writeStoredCabPromoCode(null);
      }
    } catch {
      // Keep local code; checkout will enforce once-per-user.
    } finally {
      setEligibilityLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (!auth || auth.isLoading) return;
    void refreshEligibility();
  }, [auth, auth?.isAuthenticated, auth?.isLoading, refreshEligibility]);

  const applyCode = useCallback(
    async (raw: string): Promise<ApplyResult> => {
      if (!raw.trim()) {
        return { ok: false, error: "Enter a promo code." };
      }
      if (!isValidCabWelcomeCode(raw)) {
        return { ok: false, error: "Invalid code. Try UNOCABS10." };
      }

      const token = auth?.getAccessToken?.();
      if (token) {
        try {
          const result = await getCabOfferEligibility(token);
          setEligibility(result);
          if (!result.welcome_eligible) {
            setCode(null);
            writeStoredCabPromoCode(null);
            return {
              ok: false,
              error: result.message || "UNOCABS10 is already used on this account.",
            };
          }
        } catch {
          /* fall through — server will reject at checkout if needed */
        }
      }

      setCode(CAB_WELCOME_PROMO_CODE);
      writeStoredCabPromoCode(CAB_WELCOME_PROMO_CODE);
      return { ok: true };
    },
    [auth],
  );

  const clearCode = useCallback(() => {
    setCode(null);
    writeStoredCabPromoCode(null);
  }, []);

  const computeDiscount = useCallback(
    (totalAmount: number) => {
      const eligible = eligibility ? eligibility.welcome_eligible : true;
      if (!code || !eligible) return { discount: 0, finalAmount: totalAmount };
      return computeCabWelcomeDiscount(totalAmount);
    },
    [code, eligibility],
  );

  const value = useMemo(
    () => ({
      code: hydrated ? code : null,
      isApplied: hydrated && Boolean(code) && (eligibility ? eligibility.welcome_eligible : true),
      discountPercent: CAB_WELCOME_DISCOUNT_PERCENT,
      welcomeEligible: eligibility ? eligibility.welcome_eligible : null,
      alreadyUsed: Boolean(eligibility?.already_used),
      eligibilityLoading,
      applyCode,
      clearCode,
      computeDiscount,
      refreshEligibility,
    }),
    [
      hydrated,
      code,
      eligibility,
      eligibilityLoading,
      applyCode,
      clearCode,
      computeDiscount,
      refreshEligibility,
    ],
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
