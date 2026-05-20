import type { TourPackage } from "@/lib/constants";

/**
 * Map `/destinations/[slug]` to substrings we match against package
 * `location`, `title`, and `description` (from live API).
 */
const SLUG_KEYWORDS: Record<string, readonly string[]> = {
  kashmir: [
    "jammu and kashmir",
    "jammu",
    "kashmir",
    "srinagar",
    "gulmarg",
    "pahalgam",
    "sonmarg",
    "yusmarg",
    "dal lake",
    "betaab",
  ],
  himachal: [
    "himachal",
    "shimla",
    "manali",
    "kullu",
    "dharamshala",
    "dharamsala",
    "spiti",
    "kasol",
    "kinnaur",
    "dalhousie",
    "chamba",
    "khajjiar",
  ],
  kerala: [
    "kerala",
    "kochi",
    "cochin",
    "munnar",
    "alleppey",
    "alappuzha",
    "thekkady",
    "wayanad",
    "backwater",
    "athirapally",
    "varkala",
  ],
  "south-india": [
    "coorg",
    "kodagu",
    "ooty",
    "udagamandalam",
    "nilgiri",
    "nilgiris",
    "mysore",
    "mysuru",
    "karnataka",
    "tamil nadu",
    "kodaikanal",
  ],
  "north-east": [
    "assam",
    "meghalaya",
    "sikkim",
    "arunachal",
    "nagaland",
    "manipur",
    "mizoram",
    "tripura",
    "guwahati",
    "shillong",
    "gangtok",
    "kaziranga",
    "cherrapunji",
    "cherapunji",
    "north east",
    "northeast",
  ],
  maldives: ["maldives", "malé", "north malé", "atoll"],
  goa: ["goa"],
  thailand: ["thailand", "bangkok", "phuket", "pattaya", "krabi", "chiang mai"],
  "leh-ladakh": ["ladakh", "leh", "nubra", "pangong", "hunder", "kargil"],
  rajasthan: ["rajasthan", "jaipur", "udaipur", "jodhpur", "jaisalmer", "pushkar"],
  dubai: ["dubai", "uae", "emirates"],
  bali: ["bali", "indonesia"],
  japan: ["japan", "tokyo", "kyoto", "osaka"],
  switzerland: ["switzerland", "zurich", "lucerne", "interlaken"],
  italy: ["italy", "rome", "venice", "florence", "milan"],
  vietnam: ["vietnam", "hanoi", "ho chi minh", "halong", "da nang"],
  europe: ["europe", "paris", "london", "amsterdam", "berlin", "prague"],
  gujarat: ["gujarat", "ahmedabad", "vadodara", "kutch", "rann", "somnath", "dwarka"],
  uttarakhand: ["uttarakhand", "rishikesh", "haridwar", "nainital", "mussoorie", "jim corbett", "corbett"],
  andaman: ["andaman", "port blair", "havelock"],
};

function haystack(t: TourPackage): string {
  return [t.location, t.title, t.description].filter(Boolean).join(" ").toLowerCase();
}

export function filterTourPackagesByDestinationSlug(
  tours: TourPackage[],
  slug: string,
): TourPackage[] {
  const normalized = slug.trim().toLowerCase();
  const keywords = SLUG_KEYWORDS[normalized];
  if (keywords?.length) {
    return tours.filter((t) => {
      const h = haystack(t);
      return keywords.some((kw) => h.includes(kw.toLowerCase()));
    });
  }

  const fallback = normalized.replace(/-/g, " ");
  return tours.filter((t) => {
    const h = haystack(t);
    return h.includes(normalized) || h.includes(fallback);
  });
}
