"use client";

import Image from "next/image";
import type { HotelBookingSelection } from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

function getMealPlanLabel(packageName: string): string {
  const n = packageName.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return "Room Only";
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return "Breakfast Included";
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner") && !n.includes("lunch"))) return "Breakfast + Dinner";
  if (n.includes("full board") || n.includes("(ap)") || (n.includes("lunch") && n.includes("dinner"))) return "All Meals Included";
  return packageName.replace(/\s*\([A-Z]+\)\s*/g, "").trim();
}

type HotelBookingPaymentStepProps = {
  selection: HotelBookingSelection;
  nights: number;
  rooms: number;
  guests: number;
  grandTotal: number;
  guestName: string;
  email: string;
  mobile: string;
  processing: boolean;
  paymentError?: string | null;
  isMockOrder?: boolean;
  onBack: () => void;
  onPay: () => void;
};

export function HotelBookingPaymentStep({
  selection,
  nights,
  rooms,
  guests,
  grandTotal,
  guestName,
  email,
  mobile,
  processing,
  paymentError,
  isMockOrder,
  onBack,
  onPay,
}: HotelBookingPaymentStepProps) {
  const { hotel, roomType, ratePlan } = selection;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
      <div className="space-y-4">
        <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold">Pay securely with Razorpay</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#616161]">
            UPI, cards, net banking, and wallets — powered by Razorpay. You&apos;ll complete payment in
            a secure popup after clicking Pay Now.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Image
              src="https://razorpay.com/assets/razorpay-logo.svg"
              alt="Razorpay"
              width={120}
              height={28}
              className="h-7 w-auto opacity-90"
              unoptimized
            />
            <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-[11px] font-semibold text-[#2E7D32]">
              256-bit secure checkout
            </span>
          </div>
        </section>

        <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold">Billing Contact</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-[#757575]">Guest</dt>
              <dd className="font-medium text-[#212121]">{guestName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#757575]">Email</dt>
              <dd className="font-medium text-[#212121]">{email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#757575]">Mobile</dt>
              <dd className="font-medium text-[#212121]">{mobile}</dd>
            </div>
          </dl>
        </section>

        {paymentError ? (
          <p className="rounded-md border border-[#FFCDD2] bg-[#FFEBEE] px-3 py-2 text-[12px] font-medium text-[#C62828]">
            {paymentError}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            disabled={processing}
            className="rounded-md border border-[#e0e0e0] bg-white px-6 py-3 text-sm font-semibold text-[#424242] transition hover:bg-[#fafafa] disabled:opacity-60"
          >
            Back to Guest Details
          </button>
          <button
            type="button"
            onClick={onPay}
            disabled={processing}
            className={cn(
              "rounded-md bg-[#EF6614] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#E65100]",
              processing && "cursor-wait opacity-80",
            )}
          >
            {processing
              ? (isMockOrder ? "Confirming…" : "Opening Razorpay…")
              : isMockOrder
                ? `[TEST] Simulate Pay ₹ ${formatInrAmount(grandTotal)}`
                : `Pay ₹ ${formatInrAmount(grandTotal)}`}
          </button>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide">Booking Summary</h2>
          <p className="mt-2 text-[14px] font-bold text-[#212121]">{hotel.name}</p>
          <p className="mt-1 text-[12px] text-[#616161]">{roomType.name}</p>
          <p className="text-[12px] text-[#616161]">{getMealPlanLabel(ratePlan.packageName)}</p>
          <dl className="mt-3 space-y-1.5 border-t border-[#eee] pt-3 text-[12px]">
            <div className="flex justify-between">
              <dt className="text-[#757575]">Rooms</dt>
              <dd>{rooms}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#757575]">Guests</dt>
              <dd>{guests}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#757575]">Nights</dt>
              <dd>{nights}</dd>
            </div>
          </dl>
          <div className="mt-3 border-t border-[#eee] pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[13px]">Amount Payable</span>
              <span className="text-lg font-bold text-[#EF6614]">₹ {formatInrAmount(grandTotal)}</span>
            </div>
            <p className="mt-1 text-[10px] text-[#2E7D32]">✓ Confirmed · Incl. all taxes &amp; fees</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
