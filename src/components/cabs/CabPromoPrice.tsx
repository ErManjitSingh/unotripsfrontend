"use client";

import { useCabPromoOptional } from "@/contexts/cab-promo-context";

function formatInr(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

type CabPromoPriceProps = {
  amount: number;
  currency?: string;
  size?: "sm" | "lg";
  className?: string;
  showBadge?: boolean;
};

export function CabPromoPrice({
  amount,
  currency = "INR",
  size = "lg",
  className = "",
  showBadge = true,
}: CabPromoPriceProps) {
  const promo = useCabPromoOptional();
  const pricing = promo?.computeDiscount(amount) ?? { discount: 0, finalAmount: amount };
  const hasDiscount = pricing.discount > 0;

  if (!hasDiscount) {
    return (
      <span className={className}>
        {formatInr(amount, currency)}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-end gap-0.5 ${className}`}>
      <span className={`${size === "lg" ? "text-sm" : "text-[11px]"} font-semibold text-[#8b828a] line-through`}>
        {formatInr(amount, currency)}
      </span>
      <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
        <span className={`${size === "lg" ? "text-2xl" : "text-base"} font-black text-[#292229]`}>
          {formatInr(pricing.finalAmount, currency)}
        </span>
        {showBadge && (
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            10% off
          </span>
        )}
      </span>
    </span>
  );
}

export function useCabPromoPricing(amount: number) {
  const promo = useCabPromoOptional();
  const pricing = promo?.computeDiscount(amount) ?? { discount: 0, finalAmount: amount };

  const scaleOnline = (onlineAmount: number) => {
    if (!pricing.discount || amount <= 0) return onlineAmount;
    return Math.max(0, Math.round(onlineAmount - (pricing.discount * onlineAmount) / amount));
  };

  return {
    ...pricing,
    isApplied: pricing.discount > 0,
    promoCode: promo?.code ?? null,
    scaleOnline,
  };
}
