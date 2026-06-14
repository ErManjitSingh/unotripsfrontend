// src/data/activities.ts
// Shared data file — safe to import from both server (generateStaticParams) and client components

export type Activity = {
  slug:              string;
  name:              string;
  short_description: string | null;
  featured_image:    string;
  gallery:           string[];
  category:          string | null;
  destination_name:  string | null;
  location:          string;
  tags:              string[];
  duration:          string | null;
  difficulty_level:  string | null;
  age_limit:         string | null;
  best_time:         string | null;
  starting_price:    number | null;
  price_type:        string;
  is_featured:       boolean;
  included:          string[];
  excluded:          string[];
  description:       string;
};

export const HARDCODED_ACTIVITIES: Activity[] = [
  {
    slug:              "bungee-jumping-rishikesh",
    name:              "Bungee Jumping in Rishikesh",
    short_description: "Jump off India's highest fixed platform bungee at 83m. Breathtaking views of the Himalayan foothills.",
    featured_image:    "https://images.unsplash.com/photo-1612540139150-4b5e750fc6ef?w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1612540139150-4b5e750fc6ef?w=800&q=85",
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=85",
      "https://images.unsplash.com/photo-1559628233-100c798642b0?w=800&q=85",
    ],
    category:          "adventure",
    destination_name:  "Rishikesh",
    location:          "Mohan Chatti, Rishikesh, Uttarakhand",
    tags:              ["Bungee", "Extreme", "Adrenaline", "Jumpin Heights"],
    duration:          "3–4 hours",
    difficulty_level:  "hard",
    age_limit:         "18–55 yrs",
    best_time:         "Oct – Jun",
    starting_price:    3550,
    price_type:        "per_person",
    is_featured:       true,
    description:       "Experience India's most iconic bungee jump at Jumpin Heights, Rishikesh — the country's highest fixed platform bungee at 83 metres. Perched above the rushing Ganges with stunning views of the Himalayan foothills, this is the ultimate adrenaline rush. A certified team with international safety standards ensures every jump is thrilling yet safe. Includes harness fitting, safety briefing, one jump, and a certificate.",
    included:          ["Safety briefing & training", "All safety equipment", "Bungee jump (1 attempt)", "Jump certificate", "Video of your jump"],
    excluded:          ["Transport to/from Rishikesh", "Meals", "Additional jump attempts (₹2,000 extra)"],
  },
  {
    slug:              "paragliding-solang-valley-manali",
    name:              "Paragliding in Solang Valley, Manali",
    short_description: "Soar over snow-capped Himalayan peaks with a certified pilot. Tandem paragliding with a 15–20 min scenic flight.",
    featured_image:    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=85",
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=85",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=85",
    ],
    category:          "paragliding",
    destination_name:  "Manali",
    location:          "Solang Valley, Manali, Himachal Pradesh",
    tags:              ["Paragliding", "Himalaya", "Scenic", "Tandem"],
    duration:          "2–3 hours",
    difficulty_level:  "easy",
    age_limit:         "10–60 yrs",
    best_time:         "May – Jun, Oct – Feb",
    starting_price:    2500,
    price_type:        "per_person",
    is_featured:       true,
    description:       "Float above the Solang Valley with a certified paragliding pilot as your guide. Take off from the valley slopes and glide over snow-covered peaks, pine forests, and the Beas river below. No experience needed — this is a tandem flight where your pilot handles everything. The 15–20 minute flight is one of the most scenic in India.",
    included:          ["Tandem flight with certified pilot", "All safety gear & harness", "Pre-flight briefing", "GoPro video & photos", "Insurance"],
    excluded:          ["Transport to Solang Valley", "Meals", "Personal expenses"],
  },
  {
    slug:              "white-water-rafting-rishikesh",
    name:              "White Water Rafting — Rishikesh",
    short_description: "Tackle Grades II–IV rapids of the holy Ganges on the 16 km Marine Drive to Nimbechwali stretch.",
    featured_image:    "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=85",
      "https://images.unsplash.com/photo-1559628233-100c798642b0?w=800&q=85",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
    ],
    category:          "water_sports",
    destination_name:  "Rishikesh",
    location:          "Marine Drive, Rishikesh, Uttarakhand",
    tags:              ["Rafting", "River", "Ganges", "Rapids"],
    duration:          "3–4 hours",
    difficulty_level:  "moderate",
    age_limit:         "14+ yrs",
    best_time:         "Sep – Jun",
    starting_price:    800,
    price_type:        "per_person",
    is_featured:       false,
    description:       "Navigate the roaring rapids of the holy Ganges on this classic 16 km rafting stretch from Marine Drive to Nimbechwali. Encounter Grade II to IV rapids with names like 'Golf Course', 'Club House', and the infamous 'The Wall'. Stop at beaches along the way for cliff jumping and a swim. Perfect for first-timers and experienced rafters alike.",
    included:          ["Rafting on 16 km stretch", "All safety equipment (helmet, life jacket, paddle)", "Certified guide", "Cliff jumping & beach stop", "Light refreshments"],
    excluded:          ["Transport", "Personal insurance", "Meals", "Locker charges"],
  },
  {
    slug:              "snow-leopard-trek-spiti",
    name:              "Snow Leopard Trek — Spiti Valley",
    short_description: "A rare wildlife expedition in the cold deserts of Spiti. Track snow leopards & Himalayan wolves with expert naturalists.",
    featured_image:    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85",
    ],
    category:          "wildlife",
    destination_name:  "Spiti Valley",
    location:          "Kibber Village, Spiti, Himachal Pradesh",
    tags:              ["Wildlife", "Snow Leopard", "Trek", "Spiti"],
    duration:          "7 days",
    difficulty_level:  "hard",
    age_limit:         "16–55 yrs",
    best_time:         "Jan – Mar",
    starting_price:    28000,
    price_type:        "per_person",
    is_featured:       true,
    description:       "One of India's most exclusive wildlife expeditions — a 7-day trek through the frozen landscape of Spiti Valley in search of the elusive snow leopard. Based out of Kibber village at 4,270m, you'll spend days scanning the ridgelines with expert naturalists and locals who know every trail. Spot snow leopards, Himalayan blue sheep (bharal), foxes, and golden eagles in their natural habitat.",
    included:          ["6 nights accommodation (homestay/guesthouse)", "All meals (breakfast, lunch, dinner)", "Expert naturalist guide", "Spotting scopes & binoculars", "Permits & forest fees", "Emergency equipment"],
    excluded:          ["Flights/transport to Kaza", "Personal travel insurance", "Tips & gratuities", "Alcoholic beverages"],
  },
  {
    slug:              "scuba-diving-havelock-island",
    name:              "Scuba Diving — Havelock Island, Andaman",
    short_description: "Explore coral reefs at Elephant Beach. Perfect for beginners — no prior experience needed, certified instructors.",
    featured_image:    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=85",
      "https://images.unsplash.com/photo-1559628233-100c798642b0?w=800&q=85",
    ],
    category:          "water_sports",
    destination_name:  "Andaman",
    location:          "Elephant Beach, Havelock Island, Andaman & Nicobar",
    tags:              ["Scuba", "Coral Reef", "Andaman", "Underwater"],
    duration:          "4–5 hours",
    difficulty_level:  "easy",
    age_limit:         "10–50 yrs",
    best_time:         "Oct – May",
    starting_price:    3500,
    price_type:        "per_person",
    is_featured:       false,
    description:       "Discover the stunning coral reefs of Havelock Island on this beginner-friendly scuba diving experience at Elephant Beach. Havelock is consistently rated one of Asia's best diving spots — crystal-clear turquoise water with 20–30m visibility, vibrant coral gardens, sea turtles, clownfish, and moray eels. PADI-certified instructors guide you every step of the way.",
    included:          ["30–40 min underwater dive", "All scuba equipment", "PADI certified instructor", "Underwater photos & video", "Safety briefing", "Boat transfer to Elephant Beach"],
    excluded:          ["Transport to Havelock Island", "Meals", "Personal insurance", "Advanced dives"],
  },
];