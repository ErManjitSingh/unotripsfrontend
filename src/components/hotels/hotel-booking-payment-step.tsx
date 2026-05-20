"use client";

import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import type { HotelBookingSelection } from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

type HotelBookingPaymentStepProps = {
  selection: HotelBookingSelection;
  nights: number;
  rooms: number;
  guests: number;
  grandTotal: number;
  guestName: string;
  email: string;
  mobile: string;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (value: string) => void;
  cardCvv: string;
  onCardCvvChange: (value: string) => void;
  upiId: string;
  onUpiIdChange: (value: string) => void;
  processing: boolean;
  onBack: () => void;
  onPay: () => void;
};

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export function HotelBookingPaymentStep({
  selection,
  nights,
  rooms,
  guests,
  grandTotal,
  guestName,
  email,
  mobile,
  paymentMethod,
  onPaymentMethodChange,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvv,
  onCardCvvChange,
  upiId,
  onUpiIdChange,
  processing,
  onBack,
  onPay,
}: HotelBookingPaymentStepProps) {
  const { hotel, roomType, ratePlan } = selection;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
      <div className="space-y-4">
        <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold">Payment Method</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onPaymentMethodChange(id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left text-[13px] font-semibold transition",
                  paymentMethod === id
                    ? "border-[#EF6614] bg-[#FFF3E0] text-[#E65100]"
                    : "border-[#e0e0e0] bg-white text-[#212121] hover:border-[#2196F3]/40",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {paymentMethod === "card" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[11px] text-[#757575]">Card Number</span>
                <input
                  value={cardNumber}
                  onChange={(e) => onCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-[#757575]">Expiry (MM/YY)</span>
                <input
                  value={cardExpiry}
                  onChange={(e) => onCardExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-[#757575]">CVV</span>
                <input
                  value={cardCvv}
                  onChange={(e) => onCardCvvChange(e.target.value)}
                  placeholder="123"
                  className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                />
              </label>
            </div>
          ) : null}

          {paymentMethod === "upi" ? (
            <label className="mt-4 block">
              <span className="text-[11px] text-[#757575]">UPI ID</span>
              <input
                value={upiId}
                onChange={(e) => onUpiIdChange(e.target.value)}
                placeholder="yourname@upi"
                className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
              />
            </label>
          ) : null}

          {paymentMethod === "netbanking" ? (
            <label className="mt-4 block">
              <span className="text-[11px] text-[#757575]">Select Bank</span>
              <select className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
                <option>Axis Bank</option>
              </select>
            </label>
          ) : null}

          {paymentMethod === "wallet" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {["Paytm", "PhonePe", "Amazon Pay"].map((wallet) => (
                <button
                  key={wallet}
                  type="button"
                  className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-4 py-2 text-[12px] font-semibold text-[#212121] hover:border-[#EF6614]"
                >
                  {wallet}
                </button>
              ))}
            </div>
          ) : null}
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
            className="rounded-md bg-[#EF6614] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#E65100] disabled:cursor-wait disabled:opacity-80"
          >
            {processing ? "Processing…" : `Pay ₹ ${formatInrAmount(grandTotal)}`}
          </button>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide">Booking Summary</h2>
          <p className="mt-2 text-[14px] font-bold text-[#212121]">{hotel.name}</p>
          <p className="mt-1 text-[12px] text-[#616161]">{roomType.name}</p>
          <p className="text-[12px] text-[#616161]">{ratePlan.packageName}</p>
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
          <div className="mt-3 flex justify-between border-t border-[#eee] pt-3">
            <span className="font-bold">Amount Payable</span>
            <span className="text-lg font-bold">₹ {formatInrAmount(grandTotal)}</span>
          </div>
        </section>
      </aside>
    </div>
  );
}
