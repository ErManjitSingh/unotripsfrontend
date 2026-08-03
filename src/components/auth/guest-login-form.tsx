"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth-context";
import { navigateAfterAuth } from "@/lib/auth-navigation";
import { cn } from "@/lib/utils";

type GuestLoginFormProps = {
  redirectTo?: string;
  /** When provided, called instead of navigateAfterAuth — prevents full page reload inside modals. */
  onAuthComplete?: () => void;
};

export function GuestLoginForm({ redirectTo = "/account", onAuthComplete }: GuestLoginFormProps) {
  const { sendGuestOtp, verifyGuestOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (normalizedPhone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const msg = await sendGuestOtp(normalizedPhone);
      setOtpSent(true);
      setInfo(msg);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyGuestOtp(normalizedPhone, otp);
      if (onAuthComplete) {
        onAuthComplete();
      } else {
        navigateAfterAuth(redirectTo);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={otpSent ? handleVerify : handleSendOtp} className="space-y-4">
      <div>
        <label htmlFor="guest-phone" className="mb-1.5 block text-sm font-semibold text-[#403842]">
          Mobile number
        </label>
        <div className="flex gap-2">
          <span className="flex h-11 items-center rounded-xl border border-[#e4dbd5] bg-[#faf7f5] px-3 text-sm font-semibold text-[#616161]">
            +91
          </span>
          <Input
            id="guest-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit number"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="h-11 rounded-xl border-[#e4dbd5] focus-visible:ring-[#ef6614]/25"
            disabled={otpSent && loading}
          />
        </div>
        {!otpSent ? (
          <p className="mt-1.5 text-[12px] text-[#837882]">We&apos;ll text you a one-time code.</p>
        ) : null}
      </div>

      {otpSent ? (
        <div className="animate-[auth-panel-in_0.35s_ease-out]">
          <label htmlFor="guest-otp" className="mb-1.5 block text-sm font-semibold text-[#403842]">
            Enter OTP
          </label>
          <Input
            id="guest-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-11 rounded-xl border-[#e4dbd5] tracking-[0.35em] focus-visible:ring-[#ef6614]/25"
          />
          <button
            type="button"
            className="mt-2 text-[12px] font-bold text-[#ef6614] hover:underline"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setInfo(null);
            }}
          >
            Change mobile number
          </button>
        </div>
      ) : null}

      {info ? <p className="text-[12px] font-medium text-emerald-700">{info}</p> : null}
      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(239,102,20,0.9)] hover:bg-[#E65100] hover:brightness-100",
        )}
      >
        {loading ? "Please wait…" : otpSent ? "Verify & continue" : "Send OTP"}
      </Button>
    </form>
  );
}