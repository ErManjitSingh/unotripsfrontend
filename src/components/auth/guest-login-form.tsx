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
      <p className="rounded-md bg-[#E3F2FD] px-3 py-2 text-[12px] leading-relaxed text-[#1565C0]">
        Continue as a <strong>Guest</strong> with your mobile number. OTP will be sent to verify you.
      </p>

      <div>
        <label htmlFor="guest-phone" className="mb-1.5 block text-sm font-medium text-[#424242]">
          Mobile number
        </label>
        <div className="flex gap-2">
          <span className="flex h-11 items-center rounded-xl border border-slate-200/80 bg-slate-50 px-3 text-sm text-[#616161]">
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
            className="rounded-lg border-[#e0e0e0]"
            disabled={otpSent && loading}
          />
        </div>
      </div>

      {otpSent ? (
        <div>
          <label htmlFor="guest-otp" className="mb-1.5 block text-sm font-medium text-[#424242]">
            OTP
          </label>
          <Input
            id="guest-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="rounded-lg border-[#e0e0e0] tracking-[0.3em]"
          />
          <button
            type="button"
            className="mt-2 text-[12px] font-semibold text-[#2196F3] hover:underline"
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

      {info ? <p className="text-[12px] text-[#2E7D32]">{info}</p> : null}
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-11 w-full rounded-md bg-[#EF6614] text-sm font-bold uppercase tracking-wide text-white hover:bg-[#E65100]",
        )}
      >
        {loading ? "Please wait…" : otpSent ? "Verify & continue" : "Send OTP"}
      </Button>
    </form>
  );
}