"use client";

/**
 * components/flights/FlightOffersSection.tsx
 * Same layout as CabOffersSection / BusOffersSection.
 */

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type OfferTab = "flights" | "all" | "hotels" | "cabs" | "holidays" | "bus" | "trains";

type Offer = { id: string; tab: OfferTab[]; image: string; title: string; subtitle: string; href: string; };

const OFFERS: Offer[] = [
  { id: "fl-1",  tab: ["flights","all"],   image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=240&q=80", title: "Domestic Flights from ₹999*",            subtitle: "Book early & fly cheap on Mumbai, Delhi, Bengaluru routes.",   href: "/flights" },
  { id: "fl-2",  tab: ["flights","all"],   image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=240&q=80", title: "International Flights — Up to 30% OFF",   subtitle: "Dubai · Bangkok · Singapore · London. Best fares guaranteed.", href: "/flights" },
  { id: "fl-3",  tab: ["flights","all"],   image: "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=240&q=80", title: "For All Travel Moods: Up to 40% OFF*",    subtitle: "Flights, Hotels, Cabs, Buses, Trains & More!",                 href: "/flights" },
  { id: "fl-4",  tab: ["flights","all"],   image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=240&q=80", title: "Goa Flights — Weekend Getaway Deals",    subtitle: "Fly from Delhi, Mumbai, Bangalore from ₹2,499.",              href: "/flights" },
  { id: "fl-5",  tab: ["flights","all"],   image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=240&q=80", title: "Business Class Upgrades",                  subtitle: "Premium seats at 25% off on select routes.",                  href: "/flights" },
  { id: "fl-6",  tab: ["flights","all"],   image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=240&q=80", title: "Char Dham Special Air Packages",         subtitle: "Fly to Dehradun & connect to pilgrimage routes.",             href: "/flights" },
  { id: "cab-1", tab: ["cabs","all"],      image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=240&q=80", title: "Outstation Cabs from ₹10/km*",           subtitle: "Reliable rides on top routes across India.",                  href: "/cabs"    },
  { id: "bus-1", tab: ["bus","all"],       image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=240&q=80", title: "Volvo AC Sleeper Buses — Up to 20% OFF",   subtitle: "Premium overnight buses on top routes.",                      href: "/bus"     },
  { id: "hot-1", tab: ["hotels","all"],    image: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=240&q=80", title: "Luxury Hotels at Budget Prices",         subtitle: "Up to 50% off on select 5-star properties.",                  href: "/hotels"  },
  { id: "hol-1", tab: ["holidays","all"],  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=240&q=80", title: "Himachal Tour from ₹9,999*",             subtitle: "3N/4D incl. hotel, cab & sightseeing.",                       href: "/packages"},
  { id: "tr-1",  tab: ["trains","all"],    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=240&q=80", title: "Tatkal Ticket Booking",                  subtitle: "Last-minute train tickets made easy.",                        href: "#"        },
];

const TABS: { id: OfferTab; label: string }[] = [
  { id: "flights",  label: "Flights"   },
  { id: "all",      label: "All Offers"},
  { id: "hotels",   label: "Hotels"    },
  { id: "cabs",     label: "Cabs"      },
  { id: "holidays", label: "Holidays"  },
  { id: "bus",      label: "Bus"       },
  { id: "trains",   label: "Trains"    },
];

const PER_PAGE = 6;

function OfferCard({ offer }: { offer: Offer }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <a href={offer.href} className="group flex h-[120px] w-full overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm transition-shadow hover:shadow-md sm:h-[130px]">
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

export function FlightOffersSection({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<OfferTab>("flights");
  const [page, setPage]           = useState(0);
  const filtered   = OFFERS.filter((o) => o.tab.includes(activeTab));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageOffers = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const handleTab  = (t: OfferTab) => { setActiveTab(t); setPage(0); };

  return (
    <section className={cn("bg-white py-6 sm:py-8", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h2 className="shrink-0 text-2xl font-bold text-[#212121] sm:text-[26px]">Offers</h2>
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => handleTab(id)}
                className={cn("shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors sm:text-[14px]",
                  activeTab === id ? "border-[#EF6614] text-[#EF6614]" : "border-transparent text-[#616161] hover:text-[#212121]")}>
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a href="/flights" className="flex items-center gap-1 text-[13px] font-bold text-[#212121] hover:text-[#EF6614]">
              VIEW ALL <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </a>
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#212121] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#212121] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {pageOffers.map((o) => <OfferCard key={o.id} offer={o} />)}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} type="button" onClick={() => setPage(i)}
                className={cn("h-1.5 rounded-full transition-all", page === i ? "w-5 bg-[#EF6614]" : "w-1.5 bg-[#BDBDBD]")} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}