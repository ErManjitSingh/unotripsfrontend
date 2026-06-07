export type DemoOfferItem = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge?: string;
};

/** Temporary demo cards until live offers API is fully populated. */
export const DEMO_EXCLUSIVE_OFFERS: DemoOfferItem[] = [
  {
    key: "demo-jaipur",
    title: "Jaipur Heritage Stays",
    subtitle: "Up to 30% off on palace & haveli hotels",
    href: "/hotels#popular-destinations",
    image: "https://images.unsplash.com/photo-1599661046280-e842a372a4f7?auto=format&fit=crop&w=800&q=80",
    badge: "Hot deal",
  },
  {
    key: "demo-goa",
    title: "Goa Beach Getaway",
    subtitle: "Flat Rs.2,000 off on 3-night bookings",
    href: "/hotels#popular-hotels",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    badge: "Limited time",
  },
  {
    key: "demo-udaipur",
    title: "Udaipur Lake View Hotels",
    subtitle: "Early bird — save 25% this week only",
    href: "/hotels#hotel-search",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    badge: "Exclusive",
  },
  {
    key: "demo-kerala",
    title: "Kerala Backwater Packages",
    subtitle: "Houseboat + hotel combos from Rs.8,999",
    href: "/packages",
    image: "https://images.unsplash.com/photo-1602216052126-53a08a2c9031?auto=format&fit=crop&w=800&q=80",
    badge: "Package deal",
  },
  {
    key: "demo-manali",
    title: "Manali Winter Special",
    subtitle: "35% off on premium mountain resorts",
    href: "/hotels#popular-hotels",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    badge: "Season offer",
  },
];