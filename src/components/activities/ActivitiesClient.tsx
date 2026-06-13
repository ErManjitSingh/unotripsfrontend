"use client";

/**
 * src/components/activities/ActivitiesClient.tsx
 * FIXES:
 *  - Correct activity-specific images (no more BLM protest / wrong photos)
 *  - Links go to /activities/[slug] NOT /packages/[slug]
 */

import Image from "next/image";
import { useRef, useState } from "react";
import { Clock, MapPin, Search, Tag, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInrAmount } from "@/lib/utils";

type Activity = {
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

// ─── Hardcoded 5 activities with CORRECT images ───────────────────────────────

export const HARDCODED_ACTIVITIES: Activity[] = [
  {
    slug:              "bungee-jumping-rishikesh",
    name:              "Bungee Jumping in Rishikesh",
    short_description: "Jump off India's highest fixed platform bungee at 83m. Breathtaking views of the Himalayan foothills.",
    // Correct: actual bungee jumping photo
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
    // Correct: paragliding in mountains photo
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
    // Correct: rafting photo
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
    // Correct: Spiti Valley / snow leopard landscape
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
    // Correct: scuba diving / underwater photo
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

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "",             label: "All Activities" },
  { value: "adventure",    label: "Adventure"      },
  { value: "trekking",     label: "Trekking"       },
  { value: "water_sports", label: "Water Sports"   },
  { value: "wildlife",     label: "Wildlife"       },
  { value: "cultural",     label: "Cultural"       },
  { value: "camping",      label: "Camping"        },
  { value: "paragliding",  label: "Paragliding"    },
  { value: "snow_sports",  label: "Snow Sports"    },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  hard:     "bg-red-100 text-red-700",
};

const POPULAR_DESTINATIONS = ["Manali","Rishikesh","Goa","Jaipur","Leh","Coorg","Shimla","Mussoorie","Nainital","Spiti Valley"];

const WHY = [
  { emoji: "🏔️", title: "500+ Experiences",   desc: "Adventures, treks, water sports, cultural tours across India." },
  { emoji: "✅",  title: "Verified Operators", desc: "All activity partners are background-checked & safety-certified." },
  { emoji: "💰",  title: "Best Price Promise", desc: "No markup. Pay exactly what the operator charges." },
  { emoji: "📅",  title: "Flexible Booking",   desc: "Book now, choose date later. Free cancellation on most activities." },
];

// ─── Activity Card ─────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: Activity }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const level     = activity.difficulty_level ?? "easy";
  const diffLabel = level.charAt(0).toUpperCase() + level.slice(1);
  const diffColor = DIFFICULTY_COLORS[level] ?? "bg-gray-100 text-gray-700";

  return (
    // FIX: links to /activities/[slug] not /packages/[slug]
    <a href={`/activities/${activity.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full overflow-hidden bg-[#F5F5F5]">
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-[#EEEEEE]" />}
        <Image src={activity.featured_image} alt={activity.name} fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className={cn("object-cover transition-all duration-500 group-hover:scale-105", imgLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setImgLoaded(true)} />
        <div className="absolute left-3 top-3 flex gap-2">
          {activity.is_featured && <span className="rounded-full bg-[#EF6614] px-2.5 py-0.5 text-[10px] font-bold text-white">⭐ Featured</span>}
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", diffColor)}>{diffLabel}</span>
        </div>
        {activity.starting_price && (
          <div className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-3 py-1 text-white backdrop-blur-sm">
            <span className="text-[10px] text-white/80">from </span>
            <span className="text-[14px] font-bold">₹{formatInrAmount(activity.starting_price)}</span>
            <span className="text-[10px] text-white/80">/{activity.price_type === "per_group" ? "group" : "person"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          {activity.category && (
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#EF6614]">
              <Tag className="h-3 w-3" strokeWidth={2}/>{activity.category.replace("_"," ")}
            </span>
          )}
          {activity.destination_name && (
            <span className="flex items-center gap-1 text-[11px] text-[#9E9E9E]">
              <MapPin className="h-3 w-3" strokeWidth={1.5}/>{activity.destination_name}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-[#212121] transition-colors group-hover:text-[#EF6614]">{activity.name}</h3>
        {activity.short_description && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#757575]">{activity.short_description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#757575]">
          {activity.duration  && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" strokeWidth={1.5}/>{activity.duration}</span>}
          {activity.age_limit && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" strokeWidth={1.5}/>{activity.age_limit}</span>}
          {activity.best_time && <span>⏰ {activity.best_time}</span>}
        </div>
        {activity.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activity.tags.slice(0,3).map((tag) => <span key={tag} className="rounded-full border border-[#EEEEEE] px-2 py-0.5 text-[10px] text-[#616161]">{tag}</span>)}
          </div>
        )}
        <div className="mt-auto pt-4">
          <span className="block w-full rounded-xl border border-[#EF6614] py-2 text-center text-[13px] font-bold text-[#EF6614] transition-colors group-hover:bg-[#EF6614] group-hover:text-white">
            View Activity
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function ActivitiesClient() {
  const [destination, setDestination] = useState("");
  const [category,    setCategory]    = useState("");
  const [destOpen,    setDestOpen]    = useState(false);
  const destRef = useRef<HTMLDivElement>(null);

  const filtered = HARDCODED_ACTIVITIES.filter((a) => {
    const matchCat  = !category    || a.category === category;
    const matchDest = !destination || (a.destination_name ?? "").toLowerCase().includes(destination.toLowerCase());
    return matchCat && matchDest;
  });

  const filteredDests = destination.trim()
    ? POPULAR_DESTINATIONS.filter((d) => d.toLowerCase().includes(destination.toLowerCase()))
    : POPULAR_DESTINATIONS;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[220px] overflow-visible px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image src="/images/hotels/hero-banner.webp" alt="" fill priority sizes="100vw" className="object-cover object-center"/>
          <div className="absolute inset-0 bg-black/65" aria-hidden/>
        </div>
        <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <h1 className="text-center text-2xl font-bold text-white sm:text-3xl">Activities & Experiences</h1>
          <p className="mt-1 text-center text-sm text-white/80">Adventure, culture, wildlife & more — book unforgettable experiences across India</p>
          <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
            <div ref={destRef} className="relative flex-1">
              <div className="flex h-[52px] items-center gap-2 rounded-xl bg-white px-4 shadow-sm">
                <MapPin className="h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5}/>
                <input value={destination} onChange={(e)=>{setDestination(e.target.value);setDestOpen(true);}}
                  onFocus={()=>setDestOpen(true)} onBlur={()=>setTimeout(()=>setDestOpen(false),150)}
                  placeholder="Where? (Manali, Rishikesh…)"
                  className="flex-1 border-0 bg-transparent text-[14px] font-medium text-[#212121] outline-none placeholder:text-[#BDBDBD]"/>
              </div>
              {destOpen && filteredDests.length > 0 && (
                <ul className="absolute left-0 top-[calc(100%+4px)] z-[200] w-full overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.2)]">
                  {filteredDests.slice(0,6).map((d)=>(
                    <li key={d}><button type="button" onMouseDown={()=>{setDestination(d);setDestOpen(false);}}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#212121] hover:bg-[#FFF3E0]">
                      <MapPin className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={1.5}/>{d}
                    </button></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative">
              <select value={category} onChange={(e)=>setCategory(e.target.value)}
                className="h-[52px] appearance-none rounded-xl bg-white px-4 pr-10 text-[14px] font-medium text-[#212121] shadow-sm outline-none">
                {CATEGORIES.map(({value,label})=><option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" strokeWidth={2}/>
            </div>
            <button type="button" className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#EF6614] px-7 text-[14px] font-bold text-white hover:bg-[#E65100]">
              <Search className="h-4 w-4" strokeWidth={2.5}/> Search
            </button>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b border-[#EEEEEE] bg-white px-3 py-3 sm:px-4 lg:px-6">
        <div className="mx-auto flex w-full max-w-[1320px] gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(({value,label})=>(
            <button key={value} type="button" onClick={()=>setCategory(value)}
              className={cn("shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
                category===value?"border-[#EF6614] bg-[#EF6614] text-white":"border-[#E0E0E0] bg-white text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614]")}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#F5F5F5] py-8">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <p className="mb-4 text-[13px] text-[#757575]">{filtered.length} {filtered.length===1?"activity":"activities"} found</p>
          {filtered.length===0 ? (
            <div className="rounded-xl border border-[#E0E0E0] bg-white px-5 py-16 text-center">
              <div className="mb-3 text-5xl">🏔️</div>
              <p className="text-[15px] font-semibold text-[#212121]">No activities found</p>
              <button type="button" onClick={()=>{setCategory("");setDestination("");}}
                className="mt-4 rounded-full bg-[#EF6614] px-6 py-2 text-[13px] font-bold text-white hover:bg-[#E65100]">Clear Filters</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((activity)=><ActivityCard key={activity.slug} activity={activity}/>)}
            </div>
          )}
        </div>
      </section>

      {/* Why book */}
      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <h2 className="mb-6 text-center text-xl font-bold text-[#212121] sm:text-2xl">Why Book Activities with UNO Trips?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({emoji,title,desc})=>(
              <div key={title} className="flex flex-col items-center rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-5 text-center">
                <div className="mb-3 text-3xl">{emoji}</div>
                <h3 className="mb-1 text-[14px] font-bold text-[#212121]">{title}</h3>
                <p className="text-[12px] leading-relaxed text-[#757575]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}