import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupPageClient } from "@/components/auth/signup-page-client";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

export const metadata: Metadata = {
  title: `Sign up | ${TRAVEL_HOME_BRAND.name}`,
  description: "Create your UNO Trips guest account to book hotels.",
};

export default function SignupPage() {
  return (
    <AuthPageShell
      mode="signup"
      title="Create account"
      subtitle="One account for hotels, holidays, and cab quotes"
    >
      <Suspense fallback={<p className="text-sm text-[#757575]">Loading…</p>}>
        <SignupPageClient />
      </Suspense>
    </AuthPageShell>
  );
}
