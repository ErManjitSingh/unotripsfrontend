"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { useAuth } from "@/contexts/auth-context";

export default function AccountPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-24">
          <Loader2 className="h-9 w-9 animate-spin text-[#2196F3]" aria-hidden />
          <p className="text-sm font-medium text-[#757575]">Preparing your dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <AccountDashboard onLogout={handleLogout} />
        </div>
      </main>
      <Footer />
    </>
  );
}
