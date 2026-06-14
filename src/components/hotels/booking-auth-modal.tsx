"use client";

/**
 * BookingAuthModal
 * ─────────────────
 * Shows the existing Login UI (Guest OTP + Email tabs) inside a modal overlay.
 * After login succeeds (auth.isAuthenticated becomes true), closes the modal
 * and calls onSuccess() so the booking flow continues — no page redirect.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { GuestLoginForm } from "@/components/auth/guest-login-form";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { SignupForm }     from "@/components/auth/signup-form";
import { useAuthOptional } from "@/contexts/auth-context";
import { TRAVEL_HOME_BRAND, TRAVEL_HOME_LOGO_SRC } from "@/lib/travel-home-brand";
import { cn } from "@/lib/utils";

type AuthTab = "guest" | "email" | "signup";

type BookingAuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function BookingAuthModal({ open, onClose, onSuccess }: BookingAuthModalProps) {
  const auth = useAuthOptional();
  const [tab, setTab] = useState<AuthTab>("signup");

  // When auth becomes true (login succeeded) → close modal + continue booking
  useEffect(() => {
    if (auth?.isAuthenticated && !auth.isLoading && open) {
      onSuccess();
      onClose();
    }
  }, [auth?.isAuthenticated, auth?.isLoading, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[580px] rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9E9E9E] hover:bg-[#f5f5f5] hover:text-[#212121]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-[#eee] px-6 pb-4 pt-6 text-center">
          <div className="relative mx-auto mb-3 h-9 w-[110px]">
            <Image
              src={TRAVEL_HOME_LOGO_SRC}
              alt={TRAVEL_HOME_BRAND.name}
              fill
              className="object-contain"
              sizes="110px"
            />
          </div>
          <h2 className="text-[17px] font-bold text-[#212121]">Login to continue booking</h2>
          <p className="mt-1 text-[12px] text-[#757575]">
            Sign in to confirm your reservation
          </p>
        </div>

        {/* Auth tabs + forms */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {/* Tab switcher — 3 tabs: Guest OTP / Email Login / Sign Up */}
          <div className="mb-4 flex rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] p-1">
            {([
              { id: "guest"  as const, label: "Guest (OTP)" },
              { id: "email"  as const, label: "Login"       },
              { id: "signup" as const, label: "Sign Up"     },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 rounded-md py-2 text-[13px] font-semibold transition",
                  tab === t.id
                    ? "bg-white text-[#212121] shadow-sm"
                    : "text-[#757575] hover:text-[#212121]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Forms — intercepted via useEffect on isAuthenticated */}
          {tab === "guest" && (
            <GuestLoginForm redirectTo={typeof window !== "undefined" ? window.location.pathname + window.location.search : "/"} />
          )}
          {tab === "email" && (
            <EmailLoginForm redirectTo={typeof window !== "undefined" ? window.location.pathname + window.location.search : "/"} />
          )}
          {tab === "signup" && (
            <SignupForm redirectTo={typeof window !== "undefined" ? window.location.pathname + window.location.search : "/"} />
          )}

          <p className="mt-4 text-center text-[11px] text-[#9E9E9E]">
            Your booking details are saved. Login or sign up to confirm.
          </p>
        </div>
      </div>
    </div>
  );
}