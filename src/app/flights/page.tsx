/**
 * src/app/flights/page.tsx
 */
import type { Metadata } from "next";
import { Navbar }              from "@/components/layout/Navbar";
import { Footer }              from "@/components/layout/Footer";
import { FlightSearchSection } from "@/components/flights/FlightSearchSection";
import { FlightOffersSection } from "@/components/flights/FlightOffersSection";

export const metadata: Metadata = {
  title: "Book Flights Online — Domestic & International | UNO Trips",
  description: "Compare & book cheap flights across all airlines. No booking fees. Best fares on domestic and international routes.",
};

const POPULAR_ROUTES = [
  { from: "DEL", fromCity: "Delhi",     to: "BOM", toCity: "Mumbai",    price: "₹2,499" },
  { from: "BOM", fromCity: "Mumbai",    to: "BLR", toCity: "Bengaluru", price: "₹1,999" },
  { from: "DEL", fromCity: "Delhi",     to: "BLR", toCity: "Bengaluru", price: "₹2,799" },
  { from: "DEL", fromCity: "Delhi",     to: "GOI", toCity: "Goa",       price: "₹2,999" },
  { from: "BOM", fromCity: "Mumbai",    to: "GOI", toCity: "Goa",       price: "₹1,499" },
  { from: "DEL", fromCity: "Delhi",     to: "HYD", toCity: "Hyderabad", price: "₹2,299" },
  { from: "BLR", fromCity: "Bengaluru", to: "DEL", toCity: "Delhi",     price: "₹2,599" },
  { from: "DEL", fromCity: "Delhi",     to: "JAI", toCity: "Jaipur",    price: "₹999"   },
  { from: "BOM", fromCity: "Mumbai",    to: "MAA", toCity: "Chennai",   price: "₹2,199" },
  { from: "DEL", fromCity: "Delhi",     to: "DXB", toCity: "Dubai",     price: "₹12,999"},
  { from: "BOM", fromCity: "Mumbai",    to: "DXB", toCity: "Dubai",     price: "₹9,999" },
  { from: "DEL", fromCity: "Delhi",     to: "SIN", toCity: "Singapore", price: "₹14,999"},
];

const WHY_BOOK = [
  { emoji: "✈️", title: "All Airlines",       desc: "IndiGo, Air India, Vistara, SpiceJet, Go First & international carriers." },
  { emoji: "💰", title: "Lowest Fares",        desc: "Real-time price comparison across all airlines. No hidden fees." },
  { emoji: "🔄", title: "Free Cancellation",   desc: "Flexible tickets with free cancellation on select fares." },
  { emoji: "🎫", title: "Instant E-Ticket",    desc: "Booking confirmed in seconds. E-ticket sent to your email & SMS." },
];

export default function FlightsPage() {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="flights" />
      <main>
        {/* 1 ── Search banner */}
        <FlightSearchSection />

        {/* 2 ── Offers */}
        <FlightOffersSection />

        {/* 3 ── Why book */}
        <section className="border-t border-[#EEEEEE] bg-[#FAFAFA] py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <h2 className="mb-6 text-center text-xl font-bold text-[#212121] sm:text-2xl">
              Why Book Flights with UNO Trips?
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
            <h2 className="mb-5 text-xl font-bold text-[#212121] sm:text-2xl">Popular Flight Routes</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {POPULAR_ROUTES.map(({ from, fromCity, to, toCity, price }) => (
                <a key={`${from}-${to}`}
                  href={`/flights/results?from_code=${from}&to_code=${to}&trip_type=one_way&departure=${tomorrow}&adults=1&children=0&infants=0&cabin=economy`}
                  className="group flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 transition-colors hover:border-[#EF6614] hover:bg-[#FFF3E0]">
                  <div>
                    <p className="text-[13px] font-bold text-[#212121]">{fromCity} → {toCity}</p>
                    <p className="text-[11px] text-[#9E9E9E]">from {price}</p>
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