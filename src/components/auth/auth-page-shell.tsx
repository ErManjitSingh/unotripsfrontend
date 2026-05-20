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

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <div className="mx-auto max-w-[480px] px-4 py-8 sm:py-12">
          <div className="mb-6 text-center">
            <Link href="/" className="relative mx-auto mb-4 inline-block h-10 w-[124px]">
              <Image
                src={TRAVEL_HOME_LOGO_SRC}
                alt={TRAVEL_HOME_BRAND.name}
                fill
                className="object-contain"
                sizes="124px"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold text-[#212121]">{title}</h1>
            <p className="mt-2 text-sm text-[#616161]">{subtitle}</p>
          </div>
          <div className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
