import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TRAVEL_HOME_BRAND, TRAVEL_HOME_LOGO_SRC } from "@/lib/travel-home-brand";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const AUTH_BG_IMAGE =
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80";

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <>
      <main className="min-h-screen text-[#212121] antialiased">
        <Navbar variant="ease" easeActiveNavId="hotels" />

        <div className="relative flex min-h-[calc(100vh-64px)]">
          {/* ── Left panel — hero image (desktop only) ──────────────────── */}
          <div className="hidden lg:block lg:w-[48%] xl:w-[52%]">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
              <Image
                src={AUTH_BG_IMAGE}
                alt="Scenic travel destination"
                fill
                className="object-cover"
                sizes="52vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

              <div className="absolute inset-0 flex flex-col justify-end p-10 xl:p-14">
                {/* Logo — with backdrop so it's visible on any image */}
                <Link
                  href="/"
                  className="absolute left-10 top-10 xl:left-14 xl:top-14"
                >
                  <div className="relative h-10 w-[124px] rounded-lg bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
                    <Image
                      src={TRAVEL_HOME_LOGO_SRC}
                      alt={TRAVEL_HOME_BRAND.name}
                      fill
                      className="object-contain p-1"
                      sizes="124px"
                    />
                  </div>
                </Link>

                <blockquote className="max-w-md">
                  <p className="text-[28px] font-bold leading-tight tracking-tight text-white xl:text-[32px]">
                    Your next adventure
                    <br />
                    starts here.
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                    Discover handpicked hotels, curated packages, and
                    unforgettable experiences across India.
                  </p>
                </blockquote>

                <div className="mt-8 flex items-center gap-6 border-t border-white/15 pt-6">
                  <div>
                    <p className="text-2xl font-bold text-white">500+</p>
                    <p className="text-[11px] tracking-wide text-white/60">
                      Hotels
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/15" />
                  <div>
                    <p className="text-2xl font-bold text-white">50+</p>
                    <p className="text-[11px] tracking-wide text-white/60">
                      Destinations
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/15" />
                  <div>
                    <p className="text-2xl font-bold text-white">10K+</p>
                    <p className="text-[11px] tracking-wide text-white/60">
                      Happy Guests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel — form ──────────────────────────────────────── */}
          <div className="relative flex w-full flex-1 flex-col items-center lg:w-[52%] xl:w-[48%]">
            {/* Mobile background image */}
            <div className="absolute inset-0 lg:hidden">
              <Image
                src={AUTH_BG_IMAGE}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
            </div>

            {/* Desktop subtle background */}
            <div className="absolute inset-0 hidden bg-[#f7f7f8] lg:block" />

            {/* Form container — compact padding to avoid scroll on signup */}
            <div className="relative z-10 w-full max-w-[440px] px-5 py-6 sm:py-8 lg:py-10">
              {/* Logo — mobile only */}
              <div className="mb-4 text-center lg:mb-5">
                <Link
                  href="/"
                  className="relative mx-auto mb-4 inline-block h-10 w-[124px] lg:hidden"
                >
                  <Image
                    src={TRAVEL_HOME_LOGO_SRC}
                    alt={TRAVEL_HOME_BRAND.name}
                    fill
                    className="object-contain"
                    sizes="124px"
                    priority
                  />
                </Link>
                <h1 className="text-[24px] font-bold text-[#212121] sm:text-[26px]">
                  {title}
                </h1>
                <p className="mt-1.5 text-[13px] text-[#616161]">{subtitle}</p>
              </div>

              <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-5">
                {children}
              </div>

              <p className="mt-4 text-center text-[11px] text-[#9e9e9e]">
                By continuing you agree to our{" "}
                <Link href="/terms" className="underline hover:text-[#616161]">
                  Terms
                </Link>{" "}
                &{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-[#616161]"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}