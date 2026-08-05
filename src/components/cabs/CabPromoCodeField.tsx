"use client";

import { useState, type KeyboardEvent } from "react";
import { Check, Tag, X } from "lucide-react";
import { CAB_WELCOME_PROMO_CODE } from "@/lib/cab-promo";
import { useCabPromoOptional } from "@/contexts/cab-promo-context";

type CabPromoCodeFieldProps = {
  className?: string;
  compact?: boolean;
};

export function CabPromoCodeField({ className = "", compact = false }: CabPromoCodeFieldProps) {
  const promo = useCabPromoOptional();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!promo) return null;

  const apply = () => {
    setBusy(true);
    const result = promo.applyCode(input);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      apply();
    }
  };

  if (promo.isApplied) {
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-emerald-900">
              {promo.code} applied · {promo.discountPercent}% off
            </p>
            {!compact && (
              <p className="text-[11px] font-medium text-emerald-800/80">Discount shown in your fare total.</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            promo.clearCode();
            setInput("");
            setError("");
          }}
          className="shrink-0 rounded-lg p-1.5 text-emerald-800/70 transition hover:bg-emerald-100 hover:text-emerald-900"
          aria-label="Remove promo code"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Use a div (not <form>) so this can sit inside checkout forms without nesting.
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#514954]">
        <Tag className="h-3.5 w-3.5 text-[#ef6614]" />
        Have a promo code?
      </label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            if (error) setError("");
          }}
          onKeyDown={onKeyDown}
          placeholder={CAB_WELCOME_PROMO_CODE}
          className="min-w-0 flex-1 rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm font-semibold uppercase tracking-wide outline-none focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          disabled={busy}
          onClick={apply}
          className="shrink-0 rounded-xl bg-[#292229] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#403842] disabled:opacity-60"
        >
          Apply
        </button>
      </div>
      {error ? (
        <p className="text-[11px] font-semibold text-red-600">{error}</p>
      ) : (
        <p className="text-[11px] font-medium text-[#8b828a]">
          First ride? Use <strong className="text-[#292229]">{CAB_WELCOME_PROMO_CODE}</strong> for 10% off.
        </p>
      )}
    </div>
  );
}
