import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginPageClient } from "@/components/auth/login-page-client";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

export const metadata: Metadata = {
  title: `Login | ${TRAVEL_HOME_BRAND.name}`,
  description: "Login to UNO Trips — continue as guest with OTP or use your email.",
};

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Login to book hotels and manage your trips"
    >
      <Suspense fallback={<p className="text-sm text-[#757575]">Loading…</p>}>
        <LoginPageClient />
      </Suspense>
    </AuthPageShell>
  );
}
