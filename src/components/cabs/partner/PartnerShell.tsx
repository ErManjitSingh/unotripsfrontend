"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Banknote,
  Bell,
  CalendarDays,
  CarFront,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  Star,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CabPartnerApplication } from "@/lib/cab-partner-api";

export type PartnerNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

const PRIMARY_NAV: Omit<PartnerNavItem, "badge">[] = [
  { href: "/cabs/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cabs/partner/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/cabs/partner/quotes", label: "Quotes", icon: MessageSquareText },
  { href: "/cabs/partner/vehicles", label: "My Vehicles", icon: CarFront },
  { href: "/cabs/partner/drivers", label: "Drivers", icon: UserRound },
  { href: "/cabs/partner/earnings", label: "Earnings", icon: Wallet },
  { href: "/cabs/partner/payouts", label: "Payouts", icon: Banknote },
  { href: "/cabs/partner/reviews", label: "Reviews", icon: Star },
  { href: "/cabs/partner/support", label: "Support", icon: CircleHelp },
  { href: "/cabs/partner/settings", label: "Settings", icon: Settings },
];

type PartnerShellProps = {
  application: CabPartnerApplication;
  pendingQuotes: number;
  children: ReactNode;
  onLogout: () => void;
};

export function PartnerShell({ application, pendingQuotes, children, onLogout }: PartnerShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const name = application.business_name || application.owner_name;
  const typeLabel = application.registration_type === "agency" ? "Taxi Agency" : "Individual Operator";
  const onQuotes = pathname.startsWith("/cabs/partner/quotes");
  const headerTitle = onQuotes ? "Customer quote requests" : `Welcome back, ${name}! `;
  const headerSubtitle = onQuotes
    ? "Send a clear total fare before the request expires."
    : "Here’s what’s happening with your business today.";

  const nav = PRIMARY_NAV.map((item) =>
    item.href === "/cabs/partner/quotes" ? { ...item, badge: pendingQuotes || undefined } : item,
  );

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#f4f5f7] text-[#24212a]">
      <div className="grid h-full w-full lg:grid-cols-[248px_1fr]">
        <aside className="hidden min-h-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="px-5 pb-2 pt-5">
            <Link href="/cabs" className="block leading-none" aria-label="UnoCabs">
              <span className="text-2xl font-black tracking-tight text-[#ef6614]">
                Uno<span className="text-[#192131]">Cabs</span>
              </span>
              <small className="mt-1 block text-[10px] font-semibold tracking-wide text-slate-500">
                Partner Portal
              </small>
            </Link>
          </div>

          <nav className="mt-4 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Partner navigation">
            {nav.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "border-l-[3px] border-[#ef6614] bg-orange-50 text-[#ef6614]"
                      : "border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {typeof badge === "number" && badge > 0 && (
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-extrabold text-[#ef6614]">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 px-4 pb-5 pt-3">
            <div className="rounded-xl bg-[#f5f5f5] p-3.5">
              <strong className="block text-sm font-extrabold text-[#24212a]">Grow your business</strong>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Keep your profile updated and get more booking requests.
              </p>
              <Link
                href="/cabs/list-your-cab"
                className="mt-3 inline-flex rounded-md border border-[#ef6614] px-3 py-2 text-xs font-bold text-[#ef6614] transition hover:bg-orange-50"
              >
                Update Profile
              </Link>
            </div>

            <div className="flex items-center gap-2.5 border-t border-slate-100 pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-black text-[#ef6614]">
                {name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-xs font-extrabold">{name}</strong>
                <small className="block text-[10px] text-slate-500">{typeLabel}</small>
                <small className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Verified Partner
                </small>
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-[#ef6614]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Partner navigation">
            <button
              type="button"
              className="absolute inset-0 bg-[#192131]/35 backdrop-blur-[2px]"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative flex h-[100dvh] w-[min(86vw,340px)] min-h-0 flex-col bg-white shadow-2xl">
              <div className="flex items-start justify-between px-5 pb-3 pt-6">
                <Link href="/cabs" className="block leading-none" aria-label="UnoCabs" onClick={() => setMobileNavOpen(false)}>
                  <span className="text-2xl font-black tracking-tight text-[#ef6614]">Uno<span className="text-[#192131]">Cabs</span></span>
                  <small className="mt-1 block text-[10px] font-semibold tracking-wide text-slate-500">Partner Portal</small>
                </Link>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-600" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mx-4 flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-black text-[#ef6614]">{name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0"><strong className="block truncate text-sm font-extrabold">{name}</strong><small className="block text-[11px] text-slate-500">{typeLabel} · <span className="font-bold text-emerald-600">Verified</span></small></span>
              </div>

              <nav className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-3" aria-label="Partner navigation">
                {nav.map(({ href, label, icon: Icon, badge }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link key={href} href={href} onClick={() => setMobileNavOpen(false)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${active ? "bg-orange-50 text-[#ef6614]" : "text-slate-600 hover:bg-slate-50"}`}>
                      <Icon className="h-5 w-5 shrink-0" /><span className="flex-1">{label}</span>
                      {typeof badge === "number" && badge > 0 && <span className="rounded-full bg-[#ef6614] px-2 py-0.5 text-[10px] font-extrabold text-white">{badge}</span>}
                    </Link>
                  );
                })}
              </nav>

              <div className="shrink-0 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Link href="/cabs/list-your-cab" onClick={() => setMobileNavOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl border border-orange-200 text-sm font-extrabold text-[#ef6614]">Update profile</Link>
                <button type="button" onClick={onLogout} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 text-sm font-bold text-slate-500"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:h-[72px] sm:px-8">
            <button type="button" onClick={() => setMobileNavOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black sm:text-lg">
                {headerTitle}
                {!onQuotes && <span aria-hidden="true">👋</span>}
              </h1>
              <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">{headerSubtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/cabs/partner/quotes"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-orange-200 hover:text-[#ef6614]"
                aria-label={`${pendingQuotes} quote notifications`}
              >
                <Bell className="h-5 w-5" />
                {pendingQuotes > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
                    {pendingQuotes > 9 ? "9+" : pendingQuotes}
                  </span>
                )}
              </Link>
              <a
                href="mailto:partners@unocabs.com"
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:text-[#ef6614] sm:inline-flex"
              >
                <CircleHelp className="h-3.5 w-3.5" />
                Help
              </a>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-24 sm:p-6 lg:p-8">{children}</div>

          <footer className="hidden border-t border-slate-200 bg-white px-5 py-3 text-center text-[11px] text-slate-500 sm:px-8 lg:block">
            Need help? Contact our partner support team at{" "}
            <a href="mailto:partners@unocabs.com" className="font-semibold text-[#ef6614]">
              partners@unocabs.com
            </a>{" "}
            or{" "}
            <a href="tel:+919876543210" className="font-semibold text-slate-700">
              +91 98765 43210
            </a>
          </footer>

          <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-10px_28px_-22px_rgba(23,32,49,0.38)] backdrop-blur lg:hidden" aria-label="Quick navigation">
            {nav.slice(0, 4).map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${active ? "text-[#ef6614]" : "text-slate-500"}`}>
                  <span className={`grid h-7 w-9 place-items-center rounded-lg ${active ? "bg-orange-50" : ""}`}><Icon className="h-4.5 w-4.5" /></span>
                  <span>{label === "My Vehicles" ? "Fleet" : label}</span>
                  {typeof badge === "number" && badge > 0 && <span className="absolute right-[22%] top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] text-white">{badge}</span>}
                </Link>
              );
            })}
            <button type="button" onClick={() => setMobileNavOpen(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-slate-500" aria-label="More partner options">
              <span className="grid h-7 w-9 place-items-center rounded-lg"><Menu className="h-4.5 w-4.5" /></span><span>More</span>
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
}

export function PartnerComingSoon({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ef6614]">Coming soon</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
      <Link
        href="/cabs/partner/dashboard"
        className="mt-6 inline-flex rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white"
      >
        Back to Dashboard
      </Link>
    </section>
  );
}
