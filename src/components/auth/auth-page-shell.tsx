import Link from "next/link";
import Image from "next/image";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  mode?: "login" | "signup";
};

/** Atmospheric travel road — framed so subject sits right of the copy. */
const AUTH_BG_IMAGE =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80";

export function AuthPageShell({
  title,
  subtitle,
  children,
  mode = "login",
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a120f] text-[#1f1820] antialiased">
      <div className="absolute inset-0">
        <Image
          src={AUTH_BG_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_45%]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,#140e0c_0%,rgba(20,14,12,0.88)_28%,rgba(20,14,12,0.42)_52%,rgba(20,14,12,0.18)_72%,rgba(20,14,12,0.35)_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 w-full max-w-xl bg-gradient-to-r from-black/55 via-black/20 to-transparent lg:max-w-2xl"
          aria-hidden
        />
      </div>

      <div className="hidden lg:block">
        <HeroGlassNavbar activeId="" showActiveUnderline={false} forceOverlay />
      </div>
      <AuthMobileHeader />

      <div
        className={
          mode === "signup"
            ? "relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-start px-5 pb-8 pt-24 sm:px-6 lg:grid lg:items-center lg:gap-10 lg:px-4 lg:pb-10 lg:pt-28 lg:grid-cols-[minmax(0,1fr)_560px]"
            : "relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-start px-5 pb-8 pt-24 sm:px-6 lg:grid lg:items-center lg:gap-12 lg:px-4 lg:pb-12 lg:pt-32 lg:grid-cols-[1fr_420px]"
        }
      >
        <div className="hidden max-w-md animate-[auth-copy-in_0.5s_ease-out] lg:block">
          <h1 className="font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:text-[3rem]">
            {mode === "login" ? (
              <>
                Continue your
                <span className="mt-1 block text-[#FF9A4A]">journey.</span>
              </>
            ) : (
              <>
                Start your
                <span className="mt-1 block text-[#FF9A4A]">journey.</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-sm text-[15px] font-medium leading-7 text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            Hotels, holidays, and cab quotes — one account for every trip.
          </p>
        </div>

        <section
          className="w-full animate-[auth-panel-in_0.55s_cubic-bezier(0.22,1,0.36,1)] lg:justify-self-end"
          aria-label={title}
        >
          <div
            className={
              mode === "signup"
                ? "rounded-[1.25rem] border border-white/60 bg-white p-4 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.55)] sm:p-5"
                : "rounded-[1.25rem] border border-white/60 bg-white p-5 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.55)] sm:p-6"
            }
          >
            <div className={mode === "signup" ? "mb-3.5" : "mb-5"}>
              <h2 className="font-display text-[1.35rem] font-bold tracking-tight text-[#1f1820] sm:text-[1.45rem]">
                {title}
              </h2>
              <p className="mt-0.5 text-[12px] leading-5 text-[#6d646c] sm:text-[13px]">{subtitle}</p>
            </div>

            {children}

            <p className="mt-5 text-center text-[11px] leading-4 text-[#8f868d]">
              By continuing you agree to our{" "}
              <Link href="/terms" className="font-semibold text-[#514953] underline decoration-[#d8d0cb] underline-offset-2 hover:text-[#ef6614]">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="font-semibold text-[#514953] underline decoration-[#d8d0cb] underline-offset-2 hover:text-[#ef6614]">
                Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes auth-panel-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-copy-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
