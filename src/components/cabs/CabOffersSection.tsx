"use client";

/**
 * components/cabs/CabOffersSection.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Offers" section — exact replica of the EaseMyTrip-style offers block.
 *
 * Layout:
 *   • Header row: "Offers" title + tab pills + "VIEW ALL →" + prev/next arrows
 *   • 2-row × 3-col grid of offer cards (horizontal scroll pages on arrow click)
 *   • Each card: left image thumbnail + right text (T&C'S APPLY / title / red
 *     underline / subtitle / BOOK NOW)
 *
 * Tabs: Cabs | All Offers | Hotels | Flights | Holidays | Bus | Trains
 * Static data — swap for API call when ready.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OfferTab = "cabs" | "all" | "hotels" | "flights" | "holidays" | "bus" | "trains";

type Offer = {
  id: string;
  tab: OfferTab[];        // which tabs show this card
  image: string;
  title: string;
  subtitle: string;
  href: string;
};

// ─── Static offer data ────────────────────────────────────────────────────────

const OFFERS: Offer[] = [
  // ── Cabs offers ──────────────────────────────────────────────────────────
  {
    id: "cab-1",
    tab: ["cabs", "all"],
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=240&q=80",
    title: "For All Travel Moods: Up to 40% OFF*",
    subtitle: "on Flights, Stays, Packages, Buses, Trains, Cabs & More!",
    href: "/cabs",
  },
  {
    id: "cab-2",
    tab: ["cabs", "all"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=240&q=80",
    title: "Explore Top Routes for Outstation Cabs",
    subtitle: "Starting @ ₹10/km* & book reliable journeys with us!",
    href: "/cabs",
  },
  {
    id: "cab-3",
    tab: ["cabs", "all"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&q=80",
    title: "Up to 25% OFF on Airport Cab Bookings",
    subtitle: "Grab deals on premium airport transfers across India.",
    href: "/cabs",
  },
  {
    id: "cab-4",
    tab: ["cabs", "all"],
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=240&q=80",
    title: "For Your Char Dham Journey: Up to 40% OFF*",
    subtitle: "on stays, packages, buses, cabs, trains & flights.",
    href: "/cabs",
  },
  {
    id: "cab-5",
    tab: ["cabs", "all"],
    image: "https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=240&q=80",
    title: "Your Outstation Cabs Made More Comfortable",
    subtitle: "with New Features!",
    href: "/cabs",
  },
  {
    id: "cab-6",
    tab: ["cabs", "all"],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=240&q=80",
    title: "Available Across 500+ Cities",
    subtitle: "get upto 20% off on outstation cab bookings.",
    href: "/cabs",
  },
  // ── Hotels offers ─────────────────────────────────────────────────────────
  {
    id: "hotel-1",
    tab: ["hotels", "all"],
    image: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=240&q=80",
    title: "Luxury Hotels at Budget Prices",
    subtitle: "Up to 50% off on select 5-star properties.",
    href: "/hotels",
  },
  {
    id: "hotel-2",
    tab: ["hotels", "all"],
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=240&q=80",
    title: "Weekend Getaways — Book by Sunday",
    subtitle: "Best hotel deals for this weekend across India.",
    href: "/hotels",
  },
  {
    id: "hotel-3",
    tab: ["hotels", "all"],
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=240&q=80",
    title: "Rajasthan Palace Hotels",
    subtitle: "Heritage stays from ₹2,499/night.",
    href: "/hotels",
  },
  {
    id: "hotel-4",
    tab: ["hotels", "all"],
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=240&q=80",
    title: "Himachal Hill Station Deals",
    subtitle: "Book early & save up to 35% on mountain stays.",
    href: "/hotels",
  },
  // ── Holidays offers ───────────────────────────────────────────────────────
  {
    id: "holiday-1",
    tab: ["holidays", "all"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=240&q=80",
    title: "Himachal Tour Packages from ₹9,999*",
    subtitle: "3N/4D packages incl. hotel, cab & sightseeing.",
    href: "/packages",
  },
  {
    id: "holiday-2",
    tab: ["holidays", "all"],
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=240&q=80",
    title: "Kashmir — Heaven on Earth",
    subtitle: "7N/8D packages with houseboat stay & Gulmarg.",
    href: "/packages",
  },
  {
    id: "holiday-3",
    tab: ["holidays", "all"],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=240&q=80",
    title: "Rajasthan Royale Tour",
    subtitle: "Jaipur · Jodhpur · Udaipur — 6N/7D from ₹18,999.",
    href: "/packages",
  },
  {
    id: "holiday-4",
    tab: ["holidays", "all"],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=240&q=80",
    title: "North East India Packages",
    subtitle: "Meghalaya · Assam · Arunachal from ₹14,999.",
    href: "/packages",
  },
  // ── Flights ───────────────────────────────────────────────────────────────
  {
    id: "flight-1",
    tab: ["flights", "all"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=240&q=80",
    title: "Domestic Flights from ₹999*",
    subtitle: "Book early & fly cheap on top Indian routes.",
    href: "#",
  },
  {
    id: "flight-2",
    tab: ["flights", "all"],
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=240&q=80",
    title: "International Flights — Up to 30% OFF",
    subtitle: "Dubai · Bangkok · Singapore · London deals.",
    href: "#",
  },
  // ── Bus ───────────────────────────────────────────────────────────────────
  {
    id: "bus-1",
    tab: ["bus", "all"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=240&q=80",
    title: "Volvo Bus Bookings — Up to 20% OFF",
    subtitle: "Comfortable sleeper & semi-sleeper buses.",
    href: "#",
  },
  {
    id: "bus-2",
    tab: ["bus", "all"],
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=240&q=80",
    title: "Hill Station Bus Deals",
    subtitle: "Manali · Shimla · Mussoorie overnight buses.",
    href: "#",
  },
  // ── Trains ────────────────────────────────────────────────────────────────
  {
    id: "train-1",
    tab: ["trains", "all"],
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=240&q=80",
    title: "Tatkal Ticket Booking",
    subtitle: "Book last-minute train tickets with ease.",
    href: "#",
  },
  {
    id: "train-2",
    tab: ["trains", "all"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&q=80",
    title: "Rajdhani & Shatabdi Deals",
    subtitle: "Premium trains at the best prices.",
    href: "#",
  },
];

const TABS: { id: OfferTab; label: string }[] = [
  { id: "cabs",     label: "Cabs"      },
  { id: "all",      label: "All Offers"},
  { id: "hotels",   label: "Hotels"    },
  { id: "flights",  label: "Flights"   },
  { id: "holidays", label: "Holidays"  },
  { id: "bus",      label: "Bus"       },
  { id: "trains",   label: "Trains"    },
];

// ─── Offer Card ───────────────────────────────────────────────────────────────

function OfferCard({ offer }: { offer: Offer }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <a
      href={offer.href}
      className="group flex h-[120px] w-full overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm transition-shadow hover:shadow-md sm:h-[130px]"
    >
      {/* Left: image thumbnail */}
      <div className="relative h-full w-[120px] shrink-0 overflow-hidden bg-[#F5F5F5] sm:w-[140px]">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-[#EEEEEE]" />
        )}
        <Image
          src={offer.image}
          alt=""
          fill
          sizes="140px"
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Right: text */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-[#9E9E9E]">
            T&amp;C'S APPLY
          </p>
          <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-[#212121] sm:text-[14px]">
            {offer.title}
          </h3>
          {/* Red underline accent */}
          <div className="mt-1.5 h-[2px] w-8 bg-red-600" />
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-[#616161] sm:text-[12px]">
            {offer.subtitle}
          </p>
        </div>
        <p className="mt-2 text-[11px] font-bold tracking-wider text-[#2196F3] group-hover:text-[#1565C0]">
          BOOK NOW
        </p>
      </div>
    </a>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const CARDS_PER_PAGE = 6; // 2 rows × 3 cols

type CabOffersSectionProps = {
  className?: string;
};

export function CabOffersSection({ className }: CabOffersSectionProps) {
  const [activeTab, setActiveTab] = useState<OfferTab>("cabs");
  const [page, setPage] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const filtered = OFFERS.filter((o) => o.tab.includes(activeTab));
  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const pageOffers = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const handleTabChange = (tab: OfferTab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section className={cn("bg-white py-6 sm:py-8", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

        {/* ── Header row ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">

          {/* "Offers" title */}
          <h2 className="shrink-0 text-2xl font-bold text-[#212121] sm:text-[26px]">
            Offers
          </h2>

          {/* Tab pills — horizontal scroll on mobile */}
          <div
            ref={tabsRef}
            className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors sm:text-[14px]",
                  activeTab === id
                    ? "border-[#2196F3] text-[#2196F3]"
                    : "border-transparent text-[#616161] hover:text-[#212121]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* VIEW ALL + arrows */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a
              href="/cabs"
              className="flex items-center gap-1 text-[13px] font-bold text-[#212121] hover:text-[#EF6614]"
            >
              VIEW ALL
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </a>
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] transition-colors hover:border-[#212121] hover:text-[#212121] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous offers"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] transition-colors hover:border-[#212121] hover:text-[#212121] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next offers"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Offer cards grid (2 rows × 3 cols) ────────────────────────── */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {pageOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}

          {/* Fill empty slots so grid doesn't collapse on last page */}
          {Array.from({ length: CARDS_PER_PAGE - pageOffers.length }).map((_, i) => (
            <div key={`empty-${i}`} className="hidden lg:block" />
          ))}
        </div>

        {/* ── Page dots ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  page === i ? "w-5 bg-[#EF6614]" : "w-1.5 bg-[#BDBDBD]",
                )}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}