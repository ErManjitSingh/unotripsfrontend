import type { Metadata } from "next";
import Image from "next/image";
import { CabsBookingExperience } from "@/components/cabs/CabsBookingExperience";

// Set false before release to keep the cab landing page in its coming-soon state.
const CAB_DEVELOPMENT_ENABLED = true;

export const metadata: Metadata = {
  title: "UNO Cabs | UNO Trips",
  description: "Book local city rides, hourly rentals and airport transfers with UNO Cabs.",
};

function ComingSoon() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf7] p-5 text-center">
      <section className="max-w-xl rounded-3xl border border-orange-100 bg-white p-8 shadow-[0_20px_55px_-30px_rgba(193,88,16,0.35)] sm:p-12">
        <Image src="/images/cabs/uno-cabs-dzire-hero.png" alt="UNO Cabs sedan" width={1693} height={929} priority className="mx-auto h-auto w-full max-w-sm" />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ef6614]">UNO Cabs</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2b2521]">Cabs are coming soon</h1>
        <p className="mt-3 text-[#716871]">We&apos;re getting your next ride ready. Please check back soon.</p>
      </section>
    </main>
  );
}

export default function CabsPage() {
  return CAB_DEVELOPMENT_ENABLED ? <CabsBookingExperience /> : <ComingSoon />;
}
