"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getAuthErrorMessage, useAuthOptional } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type CheckoutGuestAuthPanelProps = {
  mobile: string;
  bookReturnUrl: string;
  onVerified?: () => void;
  className?: string;
};

export function CheckoutGuestAuthPanel({
  mobile,
  bookReturnUrl,
  onVerified,
  className,
}: CheckoutGuestAuthPanelProps) {
  const auth = useAuthOptional();
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const normalizedPhone = mobile.replace(/\D/g, "").slice(-10);

  if (auth?.isAuthenticated) {
    return (
      <div className={cn("rounded-lg border border-[#c8e6c9] bg-[#e8f5e9] px-3 py-2.5 text-[12px] text-[#2E7D32]", className)}>
        Signed in as <strong>{auth.user?.phone || auth.user?.email || "Guest"}</strong>. You can continue to payment.
      </div>
    );
  }

  const handleSendOtp = async () => {
    setError(null);
    setInfo(null);
    if (normalizedPhone.length !== 10) {
      setError("Enter a valid 10-digit mobile number in guest details first.");
      return;
    }
    if (!auth?.sendGuestOtp) return;
    setLoading(true);
    try {
      const msg = await auth.sendGuestOtp(normalizedPhone);
      setOtpSent(true);
      setInfo(msg);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError(null);
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    if (!auth?.verifyGuestOtp) return;
    setLoading(true);
    try {
      await auth.verifyGuestOtp(normalizedPhone, otp);
      setInfo("Mobile verified. You can continue to payment.");
      onVerified?.();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cn("rounded-lg border border-[#BBDEFB] bg-[#E3F2FD] p-4", className)}>
      <h2 className="text-sm font-bold text-[#1565C0]">Continue as Guest</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-[#424242]">
        Verify your mobile with OTP to book without a password. We&apos;ll send OTP to{" "}
        <strong>+91 {normalizedPhone || "your number above"}</strong>.
      </p>
      {!otpSent ? (
        <button
          type="button"
          onClick={() => void handleSendOtp()}
          disabled={loading || normalizedPhone.length !== 10}
          className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#2196F3] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#1976D2] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Send OTP to mobile
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="text-[11px] font-medium text-[#616161]">Enter OTP</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 h-10 w-full max-w-[200px] rounded border border-[#e0e0e0] px-3 text-[13px] tracking-[0.25em] outline-none focus:border-[#2196F3]"
              placeholder="6-digit OTP"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={loading}
              className="rounded-md bg-[#EF6614] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#E65100] disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(""); setInfo(null); }}
              className="rounded-md border border-[#e0e0e0] bg-white px-3 py-2 text-[12px] font-semibold text-[#616161]"
            >
              Change number
            </button>
          </div>
        </div>
      )}
      {info ? <p className="mt-2 text-[12px] text-[#2E7D32]">{info}</p> : null}
      {error ? <p className="mt-2 text-[12px] text-[#C62828]">{error}</p> : null}
      <p className="mt-3 text-[11px] text-[#616161]">
        Have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(bookReturnUrl)}`} className="font-semibold text-[#2196F3] hover:underline">
          Login with email
        </Link>
      </p>
    </section>
  );
}