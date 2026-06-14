"use client";

/**
 * src/components/packages/PackageBookingSuccess.tsx
 *
 * Shown after successful payment verification.
 * Handles two states:
 *   token_paid  → "Token received · balance due" with balance amount + due date
 *   confirmed   → "Booking confirmed" with full confirmation details
 */

import { Check, ShieldCheck, Phone, MessageCircle, Calendar, IndianRupee } from "lucide-react";
import Link from "next/link";
import { siteTelHref, siteWhatsAppChatUrl } from "@/lib/site-contact";
import { cn } from "@/lib/utils";
import type { PackageBookingResult } from "@/hooks/use-package-booking";

type Props = {
  result:    PackageBookingResult;
  tourTitle: string;
  onPayBalance?: () => void;
};

function fmtINR(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

export function PackageBookingSuccess({ result, tourTitle, onPayBalance }: Props) {
  const isTokenPaid = result.status === "token_paid";
  const isFull      = result.status === "confirmed";

  return (
    <div className="rounded-2xl border border-[#e0e0e0] bg-white px-5 py-8 text-center shadow-sm">

      {/* Icon */}
      <div className={cn(
        "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
        isFull ? "bg-emerald-50" : "bg-amber-50",
      )}>
        <Check className={cn("h-8 w-8", isFull ? "text-emerald-600" : "text-amber-600")} aria-hidden />
      </div>

      {/* Heading */}
      <h2 className="mb-1 font-display text-xl font-bold text-[#1a1a1a]">
        {isFull ? "Booking confirmed! 🎉" : "Token payment received!"}
      </h2>

      <p className="mb-4 text-[13px] leading-relaxed text-[#616161]">
        {result.message}
      </p>

      {/* Booking reference */}
      <div className="mb-5 inline-block rounded-lg border border-[#FDBA74] bg-orange-50 px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9e9e9e]">Booking reference</p>
        <p className="mt-0.5 font-mono text-base font-bold text-primary">{result.booking_number}</p>
      </div>

      {/* Payment summary */}
      <div className="mb-5 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4 text-left">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#9e9e9e]">
          Payment summary
        </p>
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between text-[#424242]">
            <span>Package total</span>
            <span className="font-medium">₹{fmtINR(result.total_amount)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>{isFull ? "Paid in full" : "Token paid (40%)"}</span>
            <span className="font-medium">₹{fmtINR(result.token_amount)}</span>
          </div>
          {isTokenPaid && result.balance_amount > 0 && (
            <div className="flex justify-between border-t border-[#f0f0f0] pt-1.5 font-semibold text-[#424242]">
              <span>Balance due before travel</span>
              <span>₹{fmtINR(result.balance_amount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Token-paid: balance CTA */}
      {isTokenPaid && result.balance_amount > 0 && onPayBalance && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" aria-hidden />
            <p className="text-[12px] font-semibold text-amber-800">Balance payment</p>
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-amber-700">
            Pay ₹{fmtINR(result.balance_amount)} before your travel date to fully confirm your tour.
            Our team will send you a reminder.
          </p>
          <button
            type="button"
            onClick={onPayBalance}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            <IndianRupee className="h-4 w-4" aria-hidden />
            Pay balance ₹{fmtINR(result.balance_amount)}
          </button>
        </div>
      )}

      {/* Confirmed: what happens next */}
      {isFull && (
        <div className="mb-4 rounded-xl border border-[#e8e8e8] p-4 text-left">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#9e9e9e]">
            What happens next
          </p>
          <ul className="space-y-1.5 text-[12px] text-[#424242]">
            {[
              "Our travel expert will call you within 2 hours",
              "You'll receive a detailed voucher with hotel names and contacts",
              "Driver details shared 24 hours before departure",
            ].map((step) => (
              <li key={step} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact row */}
      <div className="mb-5 flex items-center justify-center gap-2">
        <a
          href={siteWhatsAppChatUrl(`Hi! My package booking reference is ${result.booking_number}. I need help with ${tourTitle}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-[12px] font-semibold text-white"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          WhatsApp
        </a>
        <a
          href={siteTelHref()}
          className="flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-[12px] font-semibold text-[#424242]"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          Call us
        </a>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9e9e9e]">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Payment secured by Razorpay · {result.booking_number}
      </div>

      {/* Browse more */}
      <div className="mt-5 border-t border-[#f0f0f0] pt-4">
        <Link
          href="/packages"
          className="text-[12px] font-medium text-primary hover:underline"
        >
          Browse more packages →
        </Link>
      </div>
    </div>
  );
}