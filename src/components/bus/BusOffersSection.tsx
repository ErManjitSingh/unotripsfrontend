"use client";

/**
 * components/bus/BusOffersSection.tsx
 * Offers section — same layout as CabOffersSection.
 * Tabs: Bus | All Offers | Cabs | Hotels | Flights | Holidays | Trains
 */

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type OfferTab = "bus" | "all" | "cabs" | "hotels" | "flights" | "holidays" | "trains";

type Offer = {
  id: string; tab: OfferTab[];
  image: string; title: string; subtitle: string; href: string;
};

const OFFERS: Offer[] = [
  // Bus
  { id: "bus-1", tab: ["bus","all"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=240&q=80",
    title: "Volvo AC Sleeper Buses — Up to 20% OFF",
    subtitle: "Book premium overnight buses on top routes.", href: "/bus" },
  { id: "bus-2", tab: ["bus","all"],
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=240&q=80",
    title: "Hill Station Overnight Buses",
    subtitle: "Manali · Shimla · Mussoorie — grab seats early.", href: "/bus" },
  { id: "bus-3", tab: ["bus","all"],
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=240&q=80",
    title: "For All Travel Moods: Up to 40% OFF*",
    subtitle: "on Flights, Stays, Packages, Buses, Trains, Cabs & More!", href: "/bus" },
  { id: "bus-4", tab: ["bus","all"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&q=80",
    title: "Weekend Getaway Buses",
    subtitle: "Delhi → Jaipur, Mumbai → Goa — best weekend fares.", href: "/bus" },
  { id: "bus-5", tab: ["bus","all"],
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=240&q=80",
    title: "Char Dham Yatra Buses",
    subtitle: "Kedarnath · Badrinath · Gangotri pilgrim routes.", href: "/bus" },
  { id: "bus-6", tab: ["bus","all"],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=240&q=80",
    title: "500+ Cities Connected",
    subtitle: "Find the right bus from any city in India.", href: "/bus" },
  // Cabs
  { id: "cab-1", tab: ["cabs","all"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=240&q=80",
    title: "Outstation Cabs from ₹10/km*",
    subtitle: "Reliable rides on top routes across India.", href: "/cabs" },
  { id: "cab-2", tab: ["cabs","all"],
    image: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=240&q=80",
    title: "Airport Cab Transfers — 25% OFF",
    subtitle: "Premium airport pickups & drops, any city.", href: "/cabs" },
  // Hotels
  { id: "hotel-1", tab: ["hotels","all"],
    image: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=240&q=80",
    title: "Luxury Hotels at Budget Prices",
    subtitle: "Up to 50% off on select 5-star properties.", href: "/hotels" },
  { id: "hotel-2", tab: ["hotels","all"],
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=240&q=80",
    title: "Weekend Getaways — Book by Sunday",
    subtitle: "Best hotel deals for this weekend across India.", href: "/hotels" },
  // Holidays
  { id: "holiday-1", tab: ["holidays","all"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=240&q=80",
    title: "Himachal Tour from ₹9,999*",
    subtitle: "3N/4D incl. hotel, cab & sightseeing.", href: "/packages" },
  { id: "holiday-2", tab: ["holidays","all"],
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=240&q=80",
    title: "Kashmir — Heaven on Earth",
    subtitle: "7N/8D with houseboat & Gulmarg.", href: "/packages" },
  // Flights
  { id: "flight-1", tab: ["flights","all"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=240&q=80",
    title: "Domestic Flights from ₹999*",
    subtitle: "Fly cheap on top Indian routes.", href: "#" },
  // Trains
  { id: "train-1", tab: ["trains","all"],
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=240&q=80",
    title: "Tatkal Ticket Booking",
    subtitle: "Last-minute train tickets made easy.", href: "#" },
];

const TABS: { id: OfferTab; label: string }[] = [
  { id: "bus",      label: "Bus"       },
  { id: "all",      label: "All Offers"},
  { id: "cabs",     label: "Cabs"      },
  { id: "hotels",   label: "Hotels"    },
  { id: "flights",  label: "Flights"   },
  { id: "holidays", label: "Holidays"  },
  { id: "trains",   label: "Trains"    },
];

const PER_PAGE = 6;

function OfferCard({ offer }: { offer: Offer }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <a href={offer.href}
      className="group flex h-[120px] w-full overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm transition-shadow hover:shadow-md sm:h-[130px]">
      <div className="relative h-full w-[120px] shrink-0 overflow-hidden bg-[#F5F5F5] sm:w-[140px]">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-[#EEEEEE]" />}
        <Image src={offer.image} alt="" fill sizes="140px"
          className={cn("object-cover transition-all duration-500 group-hover:scale-105", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-[#9E9E9E]">T&amp;C'S APPLY</p>
          <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-[#212121] sm:text-[14px]">{offer.title}</h3>
          <div className="mt-1.5 h-[2px] w-8 bg-red-600" />
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-[#616161] sm:text-[12px]">{offer.subtitle}</p>
        </div>
        <p className="mt-2 text-[11px] font-bold tracking-wider text-[#2196F3] group-hover:text-[#1565C0]">BOOK NOW</p>
      </div>
    </a>
  );
}

export function BusOffersSection({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<OfferTab>("bus");
  const [page, setPage] = useState(0);

  const filtered   = OFFERS.filter((o) => o.tab.includes(activeTab));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageOffers = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleTab = (tab: OfferTab) => { setActiveTab(tab); setPage(0); };

  return (
    <section className={cn("bg-white py-6 sm:py-8", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h2 className="shrink-0 text-2xl font-bold text-[#212121] sm:text-[26px]">Offers</h2>
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => handleTab(id)}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors sm:text-[14px]",
                  activeTab === id ? "border-[#2196F3] text-[#2196F3]" : "border-transparent text-[#616161] hover:text-[#212121]",
                )}>
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a href="/bus" className="flex items-center gap-1 text-[13px] font-bold text-[#212121] hover:text-[#2196F3]">
              VIEW ALL <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </a>
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#212121] hover:text-[#212121] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#212121] hover:text-[#212121] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {pageOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          {Array.from({ length: PER_PAGE - pageOffers.length }).map((_, i) => (
            <div key={`empty-${i}`} className="hidden lg:block" />
          ))}
        </div>

        {/* Page dots */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} type="button" onClick={() => setPage(i)} aria-label={`Page ${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all", page === i ? "w-5 bg-[#2196F3]" : "w-1.5 bg-[#BDBDBD]")} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}