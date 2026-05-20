import type { DestinationCard } from "@/lib/constants";
import { POPULAR_DESTINATIONS } from "@/lib/constants";

/** Icon keys for destination UI (Lucide). */
export type DestinationSliderIconKey =
  | "mountain"
  | "trees"
  | "landmark"
  | "bike"
  | "tent"
  | "map"
  | "palmtree"
  | "castle"
  | "waves"
  | "ship"
  | "sparkles"
  | "building2"
  | "sun"
  | "flag"
  | "umbrella"
  | "mapPin"
  | "mountainSnow";

export type DestinationSliderItem = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  iconKey: DestinationSliderIconKey;
  image: string;
  packageCount: number;
  region: string;
};

/** India row for nav + home slider (priority: Himachal → … → Kerala, then more India). */
export const SLIDER_INDIA: DestinationSliderItem[] = [
  {
    id: "in-himachal",
    slug: "himachal",
    name: "Himachal",
    subtitle: "Mountain Escapes",
    iconKey: "mountain",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    packageCount: 28,
    region: "India",
  },
  {
    id: "in-kashmir",
    slug: "kashmir",
    name: "Kashmir",
    subtitle: "Paradise Valley",
    iconKey: "trees",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    packageCount: 22,
    region: "India",
  },
  {
    id: "in-gujarat",
    slug: "gujarat",
    name: "Gujarat",
    subtitle: "Heritage & Coast",
    iconKey: "landmark",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    packageCount: 18,
    region: "India",
  },
  {
    id: "in-leh",
    slug: "leh-ladakh",
    name: "Leh Ladakh",
    subtitle: "Adventure Peaks",
    iconKey: "bike",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    packageCount: 24,
    region: "India",
  },
  {
    id: "in-uttarakhand",
    slug: "uttarakhand",
    name: "Uttarakhand",
    subtitle: "Himalayan Trails",
    iconKey: "tent",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80",
    packageCount: 20,
    region: "India",
  },
  {
    id: "in-ne",
    slug: "north-east",
    name: "North East",
    subtitle: "Hidden Highlands",
    iconKey: "map",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    packageCount: 16,
    region: "India",
  },
  {
    id: "in-kerala",
    slug: "kerala",
    name: "Kerala",
    subtitle: "Backwater Bliss",
    iconKey: "palmtree",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
    packageCount: 36,
    region: "India",
  },
  {
    id: "in-south-india",
    slug: "south-india",
    name: "Coorg & Ooty",
    subtitle: "Hills & Plantations",
    iconKey: "trees",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    packageCount: 12,
    region: "India",
  },
  {
    id: "in-rajasthan",
    slug: "rajasthan",
    name: "Rajasthan",
    subtitle: "Royal Palaces",
    iconKey: "castle",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
    packageCount: 42,
    region: "India",
  },
  {
    id: "in-goa",
    slug: "goa",
    name: "Goa",
    subtitle: "Coastal Rhythm",
    iconKey: "waves",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    packageCount: 30,
    region: "India",
  },
  {
    id: "in-andaman",
    slug: "andaman",
    name: "Andaman",
    subtitle: "Island Odyssey",
    iconKey: "ship",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    packageCount: 14,
    region: "India",
  },
];

export const SLIDER_INTERNATIONAL: DestinationSliderItem[] = [
  {
    id: "int-europe",
    slug: "europe",
    name: "Europe",
    subtitle: "Grand Capitals",
    iconKey: "landmark",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    packageCount: 55,
    region: "Europe",
  },
  {
    id: "int-japan",
    slug: "japan",
    name: "Japan",
    subtitle: "Cherry & Culture",
    iconKey: "sparkles",
    image: "https://images.unsplash.com/photo-1493976040374-85c3e764a8d5?w=800&q=80",
    packageCount: 24,
    region: "Asia",
  },
  {
    id: "int-singapore",
    slug: "singapore",
    name: "Singapore",
    subtitle: "Urban Sophistication",
    iconKey: "building2",
    image: "https://images.unsplash.com/photo-1525625293386-3f39f865edd6?w=800&q=80",
    packageCount: 19,
    region: "Asia",
  },
  {
    id: "int-maldives",
    slug: "maldives",
    name: "Maldives",
    subtitle: "Atoll Serenity",
    iconKey: "palmtree",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    packageCount: 19,
    region: "Asia",
  },
  {
    id: "int-dubai",
    slug: "dubai",
    name: "Dubai",
    subtitle: "Luxury Escape",
    iconKey: "sun",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    packageCount: 31,
    region: "Middle East",
  },
  {
    id: "int-bali",
    slug: "bali",
    name: "Bali",
    subtitle: "Tropical Soul",
    iconKey: "waves",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    packageCount: 26,
    region: "Asia",
  },
  {
    id: "int-usa",
    slug: "usa",
    name: "USA",
    subtitle: "Coast to Coast",
    iconKey: "flag",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
    packageCount: 38,
    region: "Americas",
  },
  {
    id: "int-thailand",
    slug: "thailand",
    name: "Thailand",
    subtitle: "Golden Temples",
    iconKey: "umbrella",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    packageCount: 33,
    region: "Asia",
  },
  {
    id: "int-vietnam",
    slug: "vietnam",
    name: "Vietnam",
    subtitle: "Rivers & Lanterns",
    iconKey: "mapPin",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80",
    packageCount: 17,
    region: "Asia",
  },
  {
    id: "int-switzerland",
    slug: "switzerland",
    name: "Switzerland",
    subtitle: "Alpine Grandeur",
    iconKey: "mountainSnow",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
    packageCount: 28,
    region: "Europe",
  },
];

function sliderItemToCard(item: DestinationSliderItem): DestinationCard {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    image: item.image,
    packageCount: item.packageCount,
    region: item.region,
  };
}

/** All slider destinations as detail-page cards (SSG + lookup). */
export const FULL_DESTINATION_CATALOG: DestinationCard[] = [
  ...SLIDER_INDIA.map(sliderItemToCard),
  ...SLIDER_INTERNATIONAL.map(sliderItemToCard),
];

/** Slugs for `/destinations/[slug]` including slider + legacy popular-only pages. */
export function getAllStaticDestinationCards(): DestinationCard[] {
  const bySlug = new Map<string, DestinationCard>();
  for (const d of FULL_DESTINATION_CATALOG) {
    bySlug.set(d.slug, d);
  }
  for (const d of POPULAR_DESTINATIONS) {
    if (!bySlug.has(d.slug)) bySlug.set(d.slug, d);
  }
  return Array.from(bySlug.values());
}

export function findDestinationInExtendedCatalog(
  slug: string,
): DestinationCard | undefined {
  return getAllStaticDestinationCards().find((d) => d.slug === slug);
}
