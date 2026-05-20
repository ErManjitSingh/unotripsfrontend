"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GuestLoginForm } from "@/components/auth/guest-login-form";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { cn } from "@/lib/utils";

type AuthTab = "guest" | "email";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const [tab, setTab] = useState<AuthTab>("guest");

  return (
    <>
      <div className="mb-5 flex rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] p-1">
        {(
          [
            { id: "guest" as const, label: "Guest (OTP)" },
            { id: "email" as const, label: "Email" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md py-2.5 text-[13px] font-semibold transition",
              tab === t.id
                ? "bg-white text-[#212121] shadow-sm"
                : "text-[#757575] hover:text-[#212121]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "guest" ? (
        <GuestLoginForm redirectTo={redirectTo} />
      ) : (
        <EmailLoginForm redirectTo={redirectTo} />
      )}

      <p className="mt-5 text-center text-[12px] text-[#757575]">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-semibold text-[#2196F3] hover:underline"
        >
          Sign up as Guest
        </Link>
      </p>
    </>
  );
}
