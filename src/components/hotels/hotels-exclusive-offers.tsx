"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const OFFERS = [
  {
    title: "Grab Up to 60% OFF*",
    subtitle: "on Hotel Bookings",
    href: "/hotels",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a850609ee90?auto=format&fit=crop&w=640&q=80",
    gradient: "from-[#1a237e]/85 via-[#283593]/70 to-transparent",
  },
  {
    title: "Incredible Discounts",
    subtitle: "on First Hotel Booking",
    href: "/hotels",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=640&q=80",
    gradient: "from-[#4a148c]/85 via-[#6a1b9a]/70 to-transparent",
  },
  {
    title: "Weekend Getaway",
    subtitle: "Flat ₹1500 OFF*",
    href: "/hotels",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3b4?auto=format&fit=crop&w=640&q=80",
    gradient: "from-[#bf360c]/85 via-[#e65100]/65 to-transparent",
  },
  {
    title: "Luxury Stays",
    subtitle: "Members-only rates",
    href: "/hotels",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=640&q=80",
    gradient: "from-[#004d40]/85 via-[#00695c]/70 to-transparent",
  },
] as const;

type Offer = (typeof OFFERS)[number];

function OfferCard({ offer }: { offer: Offer }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={offer.href}
      className="group relative block h-[168px] w-[min(280px,78vw)] shrink-0 overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg sm:h-[180px] sm:w-[300px] sm:rounded-2xl"
    >
      {!loaded ? <Skeleton className="absolute inset-0 z-[1] rounded-xl sm:rounded-2xl" /> : null}
      <Image
        src={offer.image}
        alt=""
        fill
        className={cn(
          "object-cover transition-transform duration-500 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0",
        )}
        sizes="300px"
        onLoad={() => setLoaded(true)}
      />
      <div className={cn("absolute inset-0 bg-gradient-to-t", offer.gradient)} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 z-[2] p-4 text-white">
        <p className="text-lg font-bold leading-tight sm:text-xl">{offer.title}</p>
        <p className="mt-0.5 text-sm font-medium text-white/90">{offer.subtitle}</p>
      </div>
    </Link>
  );
}

export type HotelsExclusiveOffersProps = {
  className?: string;
};

export function HotelsExclusiveOffers({ className }: HotelsExclusiveOffersProps) {
  const [headingReady, setHeadingReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHeadingReady(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className={cn("bg-white px-3 pb-12 sm:px-4 sm:pb-16 lg:px-6", className)}>
      <div className="mx-auto max-w-[1180px]">
        {!headingReady ? (
          <Skeleton className="h-8 w-44 rounded-md" aria-hidden />
        ) : (
          <h2 className="text-2xl font-bold tracking-tight text-[#212121] sm:text-[1.65rem]">
            Exclusive Offers
          </h2>
        )}

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-5 sm:gap-4 [&::-webkit-scrollbar]:hidden">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}

