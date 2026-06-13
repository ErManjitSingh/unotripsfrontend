/**
 * src/app/cabs/page.tsx
 */
import type { Metadata } from "next";
import { Navbar }            from "@/components/layout/Navbar";
import { Footer }            from "@/components/layout/Footer";
import { CabsSearchSection } from "@/components/cabs/CabsSearchSection";
import { CabOffersSection }  from "@/components/cabs/CabOffersSection";

export const metadata: Metadata = {
  title: "Outstation Cab Booking | UNO Trips",
  description:
    "Book reliable outstation cabs across India — one-way, round trip, and full-day rentals at transparent fares. Verified drivers, AC vehicles.",
};

export default function CabsPage() {
  return (
    <>
      <Navbar variant="ease" easeActiveNavId="cabs" />
      <main>

        {/* 1. Search banner */}
        <CabsSearchSection />

        {/* 2. Offers section — tabbed grid exactly like the screenshot */}
        <CabOffersSection />

        {/* 3. Why choose us — quick trust signals */}
        <section className="border-t border-[#EEEEEE] bg-[#FAFAFA] py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <h2 className="mb-6 text-center text-xl font-bold text-[#212121] sm:text-2xl">
              Why Book Cabs with UNO Trips?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  emoji: "✅",
                  title: "Verified Drivers",
                  desc: "Every driver is background-verified and trained for outstation routes.",
                },
                {
                  emoji: "💰",
                  title: "No Hidden Charges",
                  desc: "Fare breakdown shown upfront — tolls, GST, driver allowance included.",
                },
                {
                  emoji: "🚗",
                  title: "Wide Fleet",
                  desc: "Sedans, SUVs, Tempo Travellers — AC vehicles for every group size.",
                },
                {
                  emoji: "📞",
                  title: "24×7 Support",
                  desc: "Our team is available round the clock for any trip assistance.",
                },
              ].map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center rounded-xl border border-[#EEEEEE] bg-white p-5 text-center shadow-sm"
                >
                  <div className="mb-3 text-3xl">{emoji}</div>
                  <h3 className="mb-1 text-[14px] font-bold text-[#212121]">{title}</h3>
                  <p className="text-[12px] leading-relaxed text-[#757575]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Popular routes */}
        <section className="bg-white py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <h2 className="mb-5 text-xl font-bold text-[#212121] sm:text-2xl">
              Popular Outstation Routes
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { from: "Jaipur",    to: "Delhi",     km: "280 km" },
                { from: "Jaipur",    to: "Agra",      km: "240 km" },
                { from: "Mumbai",    to: "Pune",      km: "150 km" },
                { from: "Delhi",     to: "Agra",      km: "210 km" },
                { from: "Delhi",     to: "Shimla",    km: "345 km" },
                { from: "Jaipur",    to: "Udaipur",   km: "395 km" },
                { from: "Mumbai",    to: "Goa",       km: "590 km" },
                { from: "Bangalore", to: "Mysore",    km: "145 km" },
              ].map(({ from, to, km }) => (
                <a
                  key={`${from}-${to}`}
                  href={`/cabs/results?pickup_city=${encodeURIComponent(from)}&drop_city=${encodeURIComponent(to)}&trip_type=one_way&travel_date=${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}&passengers=1&drop_state=`}
                  className="group flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 transition-colors hover:border-[#EF6614] hover:bg-[#FFF3E0]"
                >
                  <div>
                    <p className="text-[13px] font-bold text-[#212121]">
                      {from} → {to}
                    </p>
                    <p className="text-[11px] text-[#9E9E9E]">{km}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#EF6614] opacity-0 transition-opacity group-hover:opacity-100">
                    Book →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}