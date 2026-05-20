/** Serializable search index for the home hero (server → `SearchBar` client). */
export type HeroSearchCatalog = {
  destinations: { slug: string; name: string; region: string }[];
  packages: {
    slug: string;
    title: string;
    location?: string;
    priceINR: number;
    durationDays: number;
    image: string;
  }[];
};
