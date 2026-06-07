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
      <main className="min-h-screen bg-[#e8edf4]">
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
      <main className="relative min-h-screen overflow-hidden bg-[#e8edf4] text-[#212121] antialiased">
        <div className="pointer-events-none absolute inset-0 dashboard-mesh" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-[#2196F3]/12 blur-3xl" />
          <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-[#EF6614]/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-[#7B1FA2]/8 blur-3xl" />
        </div>

        <Navbar variant="ease" easeActiveNavId="hotels" />

        <div className="relative mx-auto w-full max-w-[1320px] px-3 py-8 sm:px-4 sm:py-12 lg:px-6 lg:py-14">
          <AccountDashboard onLogout={handleLogout} />
        </div>
      </main>
      <Footer />
    </>
  );
}
