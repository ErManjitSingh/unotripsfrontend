/**
 * src/app/bus/page.tsx  — /bus landing page
 */
import type { Metadata } from "next";
import { Navbar }           from "@/components/layout/Navbar";
import { Footer }           from "@/components/layout/Footer";
import { BusSearchSection } from "@/components/bus/BusSearchSection";
import { BusOffersSection } from "@/components/bus/BusOffersSection";

export const metadata: Metadata = {
  title: "Bus Ticket Booking Online | UNO Trips",
  description:
    "Book bus tickets across India — Volvo, AC Sleeper, Non-AC Seater. Best fares on 500+ routes. Instant confirmation.",
};

const POPULAR_ROUTES = [
  { from: "Delhi",     to: "Jaipur",    km: "280 km" },
  { from: "Delhi",     to: "Manali",    km: "536 km" },
  { from: "Delhi",     to: "Shimla",    km: "345 km" },
  { from: "Delhi",     to: "Agra",      km: "210 km" },
  { from: "Mumbai",    to: "Pune",      km: "150 km" },
  { from: "Mumbai",    to: "Goa",       km: "590 km" },
  { from: "Bangalore", to: "Chennai",   km: "346 km" },
  { from: "Bangalore", to: "Mysore",    km: "145 km" },
  { from: "Jaipur",    to: "Delhi",     km: "280 km" },
  { from: "Hyderabad", to: "Bangalore", km: "570 km" },
  { from: "Chennai",   to: "Bangalore", km: "346 km" },
  { from: "Pune",      to: "Mumbai",    km: "150 km" },
];

const WHY_BOOK = [
  { emoji: "🚌", title: "500+ Operators",    desc: "Choose from top bus operators — KSRTC, RedBus, VRL, SRS & more." },
  { emoji: "💺", title: "Seat Selection",    desc: "Pick your preferred seat — window, aisle, upper or lower berth." },
  { emoji: "💰", title: "Best Price Guarantee", desc: "No hidden charges. Fare shown is the fare you pay." },
  { emoji: "📱", title: "Live Tracking",     desc: "Track your bus in real-time. Know exact boarding point & ETA." },
];

export default function BusPage() {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="bus" />
      <main>

        {/* 1 ── Search banner */}
        <BusSearchSection />

        {/* 2 ── Offers */}
        <BusOffersSection />

        {/* 3 ── Why book */}
        <section className="border-t border-[#EEEEEE] bg-[#FAFAFA] py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <h2 className="mb-6 text-center text-xl font-bold text-[#212121] sm:text-2xl">
              Why Book Bus with UNO Trips?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_BOOK.map(({ emoji, title, desc }) => (
                <div key={title} className="flex flex-col items-center rounded-xl border border-[#EEEEEE] bg-white p-5 text-center shadow-sm">
                  <div className="mb-3 text-3xl">{emoji}</div>
                  <h3 className="mb-1 text-[14px] font-bold text-[#212121]">{title}</h3>
                  <p className="text-[12px] leading-relaxed text-[#757575]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 ── Popular routes */}
        <section className="bg-white py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <h2 className="mb-5 text-xl font-bold text-[#212121] sm:text-2xl">
              Popular Bus Routes
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {POPULAR_ROUTES.map(({ from, to, km }) => (
                <a key={`${from}-${to}`}
                  href={`/bus/results?from_city=${encodeURIComponent(from)}&to_city=${encodeURIComponent(to)}&travel_date=${tomorrow}`}
                  className="group flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 transition-colors hover:border-[#2196F3] hover:bg-[#E3F2FD]">
                  <div>
                    <p className="text-[13px] font-bold text-[#212121]">{from} → {to}</p>
                    <p className="text-[11px] text-[#9E9E9E]">{km}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2196F3] opacity-0 transition-opacity group-hover:opacity-100">
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