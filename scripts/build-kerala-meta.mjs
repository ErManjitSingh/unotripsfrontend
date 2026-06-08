import { cpSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "meta", "himachal_special");
const dest = join(root, "meta", "kerala");
const LANDING_URL = "https://unotrips.com/meta/kerala/";

const HERO_IMG =
  "https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg";
const IMG = {
  main: HERO_IMG,
  munnar:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHRx6Ltw14TcKatDT_1w5ityVE6mN80cbBug&s",
  backwaters:
    "https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg",
  alleppey:
    "https://keralatourism.travel/images/v2/packages/destinations-alleppey-tourism.jpg",
  houseboat:
    "https://cf-images.assettype.com/thequint/2017-06/514821aa-c3cc-4ebb-82f4-c832cc095c7a/4b667f98-1b66-4a4f-874a-207a38d5a64f.jpg?auto=format,compress&fmt=webp&format=webp&w=1200&h=900&dpr=1.0",
  misty:
    "https://static.toiimg.com/thumb/msid-94248825,width-748,height-499,resizemode=4,imgsize-90508/.jpg",
  wayanad:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHRx6Ltw14TcKatDT_1w5ityVE6mN80cbBug&s",
  thekkady:
    "https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg",
  kovalam:
    "https://keralatourism.travel/images/v2/packages/destinations-alleppey-tourism.jpg",
};

function routeHtml(stops) {
  return stops
    .map((s, i) =>
      i === 0
        ? `<span>${s}</span>`
        : ` <i class="fas fa-arrow-right mx-1"></i> <span>${s}</span>`,
    )
    .join("");
}

function li(icon, cls, text) {
  return `<li><i class="fas fa-${icon} ${cls}"></i><span>${text}</span></li>`;
}

function card(pkg) {
  const trending = pkg.trending
    ? `<div class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800"><i class="fas fa-arrow-trend-up"></i><span>TRENDING NOW</span></div>`
    : "";
  const captain = pkg.captain
    ? `<div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Captain</span></div>`
    : "";
  const itin = pkg.itinerary.map((d) => li("calendar-day", "text-blue-500", d)).join("\n                  ");
  const attr = pkg.attractions.map((a) => li("star", "text-yellow-500", a)).join("\n                  ");

  return `      <div id="${pkg.id}" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100${pkg.trending ? " relative" : ""}">
        ${trending}
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="${pkg.image}" alt="${pkg.alt}" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">${pkg.nights}</span></div>
            <div class="mb-3 text-sm text-gray-600">${routeHtml(pkg.route)}</div>
            <h3 class="package-title font-bold text-gray-800 mb-4">${pkg.title}</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                ${captain}
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list">${itin}</ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list">${attr}</ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/918353096965" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+918353096965" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="${pkg.title}"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>`;
}

const mainPackages = [
  {
    id: "8-day-kerala-group-tour-best-of-kerala",
    nights: "7 NIGHTS 8 DAYS",
    route: ["Cochin", "Munnar", "Thekkady", "Alleppey", "Kovalam"],
    title: "Kerala Group Tour Package - 8 Days Best of Kerala",
    image: IMG.main,
    alt: "Kerala Best of Kerala Group Tour",
    captain: true,
    itinerary: [
      "Day 1: Arrival in Cochin & Fort Kochi walk",
      "Day 2: Travel to Munnar & tea estate visit",
      "Day 3: Munnar sightseeing - Eravikulam & Mattupetty",
      "Day 4: Thekkady - Periyar Wildlife Sanctuary",
      "Day 5: Alleppey houseboat cruise",
      "Day 6: Kovalam beach leisure",
      "Day 7: Trivandrum Padmanabhaswamy Temple",
      "Day 8: Departure",
    ],
    attractions: [
      "Fort Kochi & Chinese Fishing Nets",
      "Munnar tea gardens & Echo Point",
      "Periyar Lake boat safari",
      "Alleppey backwaters houseboat",
      "Kovalam Lighthouse Beach",
      "Padmanabhaswamy Temple",
    ],
  },
  {
    id: "9-day-kerala-adventure-special-wayanad-munnar",
    nights: "8 NIGHTS 9 DAYS",
    route: ["Cochin", "Wayanad", "Munnar", "Thekkady", "Alleppey"],
    title: "Kerala Group Tour - 9 Days Adventure Special Edition",
    image: IMG.backwaters,
    alt: "Kerala Adventure Special",
    trending: true,
    captain: true,
    itinerary: [
      "Day 1: Arrival in Cochin",
      "Day 2: Wayanad - Edakkal Caves & Soochipara Falls",
      "Day 3: Wayanad wildlife & spice plantation",
      "Day 4: Munnar hill station arrival",
      "Day 5: Munnar adventure & tea trails",
      "Day 6: Thekkady spice gardens",
      "Day 7: Alleppey houseboat overnight",
      "Day 8: Kumarakom village experience",
      "Day 9: Departure",
    ],
    attractions: [
      "Edakkal Caves",
      "Soochipara & Meenmutty Falls",
      "Munnar Top Station",
      "Periyar Tiger Reserve",
      "Alleppey backwater canals",
      "Kumarakom bird sanctuary",
    ],
  },
  {
    id: "munnar-alleppey-tour-package-5n-6d",
    nights: "5 NIGHTS 6 DAYS",
    route: ["Cochin", "Munnar", "Alleppey"],
    title: "Munnar Alleppey Tour Package - 5N/6D",
    image: IMG.munnar,
    alt: "Munnar Alleppey Tour",
    itinerary: [
      "Day 1: Arrival in Cochin",
      "Day 2: Cochin to Munnar",
      "Day 3: Munnar local sightseeing",
      "Day 4: Munnar to Alleppey houseboat",
      "Day 5: Alleppey to Cochin",
      "Day 6: Departure",
    ],
    attractions: [
      "Mattupetty Dam",
      "Eravikulam National Park",
      "Tea Museum Munnar",
      "Alleppey houseboat cruise",
      "Marari beach (optional)",
    ],
  },
  {
    id: "munnar-alleppey-kovalam-tour-6n-7d",
    nights: "6 NIGHTS 7 DAYS",
    route: ["Cochin", "Munnar", "Alleppey", "Kovalam"],
    title: "Munnar Alleppey Kovalam Tour - 6N/7D",
    image: IMG.houseboat,
    alt: "Munnar Alleppey Kovalam Tour",
    itinerary: [
      "Day 1: Arrival in Cochin",
      "Day 2: Cochin to Munnar",
      "Day 3: Munnar sightseeing",
      "Day 4: Munnar to Alleppey houseboat",
      "Day 5: Alleppey to Kovalam",
      "Day 6: Kovalam beach day",
      "Day 7: Departure",
    ],
    attractions: [
      "Munnar tea valleys",
      "Alleppey backwaters",
      "Kovalam Lighthouse Beach",
      "Hawa Beach & shacks",
      "Vizhinjam fishing harbour",
    ],
  },
  {
    id: "alleppey-houseboat-tour-package-4n-5d",
    nights: "4 NIGHTS 5 DAYS",
    route: ["Cochin", "Alleppey", "Kumarakom"],
    title: "Alleppey Houseboat Tour Package - 4N/5D",
    image: IMG.alleppey,
    alt: "Alleppey Houseboat Tour",
    itinerary: [
      "Day 1: Arrival in Cochin",
      "Day 2: Cochin to Alleppey houseboat check-in",
      "Day 3: Kumarakom backwater village",
      "Day 4: Alleppey beach & coir museum",
      "Day 5: Departure",
    ],
    attractions: [
      "Overnight houseboat cruise",
      "Punnamada Lake",
      "Kumarakom bird sanctuary",
      "Alleppey beach",
      "Traditional Kerala cuisine on boat",
    ],
  },
  {
    id: "munnar-thekkady-tour-package-4n-5d",
    nights: "4 NIGHTS 5 DAYS",
    route: ["Cochin", "Munnar", "Thekkady"],
    title: "Munnar Thekkady Tour Package - 4N/5D",
    image: IMG.thekkady,
    alt: "Munnar Thekkady Tour",
    itinerary: [
      "Day 1: Arrival in Cochin",
      "Day 2: Cochin to Munnar",
      "Day 3: Munnar to Thekkady",
      "Day 4: Thekkady spice plantation & safari",
      "Day 5: Departure",
    ],
    attractions: [
      "Munnar Echo Point",
      "Tea factory visit",
      "Periyar Wildlife Sanctuary",
      "Spice garden tour",
      "Kathakali show (optional)",
    ],
  },
  {
    id: "munnar-alleppey-tour-4n-5d",
    nights: "4 NIGHTS 5 DAYS",
    route: ["Cochin", "Munnar", "Alleppey"],
    title: "Munnar Alleppey Tour - 4N/5D",
    image: IMG.misty,
    alt: "Short Munnar Alleppey Tour",
    itinerary: [
      "Day 1: Arrival in Cochin",
      "Day 2: Munnar sightseeing",
      "Day 3: Munnar to Alleppey",
      "Day 4: Houseboat & departure",
      "Day 5: Departure",
    ],
    attractions: [
      "Photo Point Munnar",
      "Rose Garden",
      "Alleppey canals",
      "Houseboat lunch cruise",
    ],
  },
  {
    id: "complete-kerala-tour-8n-9d",
    nights: "8 NIGHTS 9 DAYS",
    route: ["Cochin", "Munnar", "Thekkady", "Alleppey", "Kovalam"],
    title: "Complete Kerala Tour - 8N/9D Cochin, Munnar & Backwaters",
    image: IMG.backwaters,
    alt: "Complete Kerala Tour",
    itinerary: [
      "Day 1: Cochin arrival",
      "Day 2: Fort Kochi & Mattancherry",
      "Day 3: Munnar transfer & sightseeing",
      "Day 4: Munnar leisure & tea trails",
      "Day 5: Thekkady Periyar",
      "Day 6: Alleppey houseboat",
      "Day 7: Kovalam beaches",
      "Day 8: Trivandrum city tour",
      "Day 9: Departure",
    ],
    attractions: [
      "Jew Town & Dutch Palace",
      "Munnar hill views",
      "Periyar Lake",
      "Alleppey backwaters",
      "Kovalam sunset",
    ],
  },
  {
    id: "romantic-kerala-honeymoon-5n-6d",
    nights: "5 NIGHTS 6 DAYS",
    route: ["Cochin", "Munnar", "Alleppey"],
    title: "Romantic Kerala Honeymoon - 5N/6D Munnar & Houseboat",
    image: IMG.misty,
    alt: "Kerala Honeymoon Package",
    itinerary: [
      "Day 1: Cochin arrival with flower welcome",
      "Day 2: Cochin to Munnar - romantic resort stay",
      "Day 3: Munnar couples photoshoot points",
      "Day 4: Private houseboat Alleppey",
      "Day 5: Kumarakom couple spa (optional)",
      "Day 6: Departure",
    ],
    attractions: [
      "Private candlelight dinner",
      "Munnar misty viewpoints",
      "Couple houseboat deck",
      "Sunset at Marari beach",
      "Ayurveda spa session",
    ],
  },
];

const nichePackages = [
  {
    id: "wayanad-athirapally-tour-package-3n-4d",
    nights: "3 NIGHTS 4 DAYS",
    route: ["Cochin", "Athirapally", "Wayanad"],
    title: "Wayanad & Athirapally Tour Package - 3N/4D",
    image: IMG.wayanad,
    alt: "Wayanad Athirapally Tour",
    itinerary: [
      "Day 1: Cochin to Athirapally Falls",
      "Day 2: Athirapally to Wayanad",
      "Day 3: Wayanad caves & waterfalls",
      "Day 4: Departure",
    ],
    attractions: [
      "Athirapally Falls",
      "Vazhachal Falls",
      "Edakkal Caves",
      "Banasura Sagar Dam",
      "Chembra Peak viewpoint",
    ],
  },
  {
    id: "kovalam-beach-tour-package-3n-4d",
    nights: "3 NIGHTS 4 DAYS",
    route: ["Trivandrum", "Kovalam", "Varkala"],
    title: "Kovalam Beach Tour Package - 3N/4D Kovalam & Varkala",
    image: IMG.houseboat,
    alt: "Kovalam Beach Tour",
    itinerary: [
      "Day 1: Arrival in Trivandrum & Kovalam",
      "Day 2: Kovalam beach & water sports",
      "Day 3: Day trip to Varkala cliff beach",
      "Day 4: Departure",
    ],
    attractions: [
      "Lighthouse Beach Kovalam",
      "Hawa Beach",
      "Varkala cliff & Papanasam beach",
      "Padmanabhaswamy Temple",
      "Sunset catamaran ride",
    ],
  },
];

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true, filter: (p) => !p.endsWith("img.zip") });

let index = readFileSync(join(dest, "index.php"), "utf8");

const introHtml = `
      <!-- Kerala intro: after first 5 packages -->
      <div id="about-kerala-tours" class="my-8 py-8 px-4 md:px-6 bg-gray-50 rounded-2xl border border-gray-100">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Book Kerala Tour Packages with Uno Trips</h2>
          <p class="text-gray-600 text-sm md:text-base leading-relaxed">
            Plan your Kerala trip with expert-curated packages covering Munnar tea hills, Alleppey backwater houseboat stays,
            Thekkady wildlife, and Kovalam beaches. Get a free customised quote with clear inclusions and dedicated travel assistance.
            Perfect for family holidays, honeymoon couples, and group tours across God's Own Country.
          </p>
          <p class="text-gray-500 text-sm mt-3">Customised to your dates &amp; budget • Transparent pricing • No spam • Best price guarantee</p>
        </div>
      </div>`;

const mainCardsHtml = mainPackages
  .map((pkg, i) => {
    const html = card(pkg);
    return i === 4 ? html + introHtml : html;
  })
  .join("\n\n");

const packagesHtml = `  <!-- Kerala Packages Section -->
  <section id="packages" class="packages-section py-10 px-4 md:px-6">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">Kerala Tour Packages</h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Handpicked itineraries for every traveller</p>

${mainCardsHtml}
    </div>
  </section>

  <!-- Wayanad, Kovalam & Beach – Niche Packages -->
  <section id="kerala-beach-hill-packages" class="packages-section py-10 px-4 md:px-6 bg-gray-50">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">Wayanad, Kovalam & Beach Tours</h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Dedicated packages for hills, waterfalls and Kerala beaches</p>

${nichePackages.map(card).join("\n\n")}
    </div>
  </section>`;

index = index.replace(
  /<!-- Himachal Packages Section -->[\s\S]*?<!-- Mid-page CTA: Talk to Travel Expert -->/,
  packagesHtml + "\n\n  <!-- Mid-page CTA: Talk to Travel Expert -->",
);

const KERALA_BEST_TIME =
  "The best time to visit Kerala is from October to March for pleasant weather. Monsoon (June-September) is lush and ideal for Ayurveda. Houseboat season peaks Oct-Feb.";

const replacements = [
  // Specific strings first (before broad "Himachal Pradesh" → "Kerala")
  ["Himachal Pradesh - Shimla Manali Dharamshala", "Kerala - Munnar Alleppey Backwaters"],
  ["Himachal Pradesh, India", "Kerala, India"],
  [
    "The best time to visit Himachal is from March to June and September to November for pleasant weather. December to February is ideal for snow and winter activities in Manali and Shimla.",
    KERALA_BEST_TIME,
  ],
  [
    "The best time to visit Kerala is from March to June and September to November for pleasant weather. December to February is ideal for snow and winter activities in Manali and Shimla.",
    KERALA_BEST_TIME,
  ],
  [
    "The best time to visit Kerala is from March to June and September to November for pleasant weather. December to February is ideal for snow and winter activities in Manali and Shimla. Monsoon brings heavy rains in hills but Ayurveda retreats are popular year-round.",
    `${KERALA_BEST_TIME} Monsoon brings heavy rains in hills but Ayurveda retreats are popular year-round.`,
  ],
  ["Kerala - Shimla Manali Dharamshala", "Kerala - Munnar Alleppey Backwaters"],
  ["Himachal Tour Query", "Kerala Tour Query"],
  ["Himachal Tour Packages | Shimla Manali Dharamshala Tour - Uno Trips", "Kerala Tour Packages | Munnar Alleppey Backwaters Tour - Uno Trips"],
  ["Book best Himachal tour packages - Shimla, Manali, Dharamshala, Kullu. Himachal honeymoon & group tours. Get free quote. Best price guaranteed.", "Book best Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon & houseboat tours. Get free quote. Best price guaranteed."],
  ["himachal tour packages, himachal trip, himachal travel package, shimla manali tour, himachal holiday packages, himachal honeymoon package, himachal group tour, himachal tour price, book himachal tour, himachal vacation package, himachal trip cost, best himachal packages", "kerala tour packages, kerala trip, kerala travel package, munnar alleppey tour, kerala holiday packages, kerala honeymoon package, kerala houseboat package, kerala backwaters tour, book kerala tour, kerala vacation package, best kerala packages"],
  ["Himachal Tour Packages | Shimla Manali Dharamshala - Uno Trips", "Kerala Tour Packages | Munnar Alleppey Backwaters - Uno Trips"],
  ["Book best Himachal tour packages - Shimla, Manali, Dharamshala. Get free quote. Best price guaranteed.", "Book best Kerala tour packages - Munnar, Alleppey, Kovalam. Get free quote. Best price guaranteed."],
  ['href="img/full_himachal.webp"', `href="${HERO_IMG}"`],
  ["Uno Trips - Himachal Tour Packages", "Uno Trips - Kerala Tour Packages"],
  ["Book Himachal tour packages - Shimla, Manali, Dharamshala, Kullu. Himachal honeymoon packages, group tours, custom itineraries.", "Book Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon packages, houseboat tours, custom itineraries."],
  ["Himachal Tour Packages", "Kerala Tour Packages"],
  ["Himachal Trip", "Kerala Trip"],
  ["Himachal Tour", "Kerala Tour"],
  ["Shimla Manali Tour", "Munnar Alleppey Tour"],
  ["Himachal Honeymoon Package", "Kerala Honeymoon Package"],
  ["Himachal Group Tour", "Kerala Group Tour"],
  ["Himachal tour", "Kerala tour"],
  ["a Himachal tour package", "a Kerala tour package"],
  ["Our Himachal tour packages are fully customizable", "Our Kerala tour packages are fully customizable"],
  ["Our Himachal tour packages", "Our Kerala tour packages"],
  ["the Himachal tour package", "the Kerala tour package"],
  ["Yes, Himachal tour packages", "Yes, Kerala tour packages"],
  ["Are Himachal tour packages", "Are Kerala tour packages"],
  ["a Himachal tour", "a Kerala tour"],
  ["visit Himachal", "visit Kerala"],
  ["Shimla, Manali, Dharamshala, Kullu", "Munnar, Alleppey, Thekkady, Kovalam"],
  ['src="img/full_himachal.webp"', `src="${HERO_IMG}"`],
  ["Best Himachal Tour Packages", "Best Kerala Tour Packages"],
  ["Explore the Mountains", "Explore God's Own Country"],
  ["Shimla • Manali • Dharamshala • Kullu", "Munnar • Alleppey • Thekkady • Kovalam"],
  ["Explore the land of snow-clad peaks and valleys", "Explore backwaters, beaches and misty hill stations"],
  ["Loading your journey to the mountains", "Loading your journey to Kerala"],
  ["amazing Himachal tours. Experience the beauty of snow-clad peaks and valleys", "amazing Kerala tours. Experience backwaters, beaches and lush green hills"],
  [
    "Experience the beauty of snow-clad peaks and valleys with our curated packages.",
    "Experience backwaters, beaches and lush green hills with our curated packages.",
  ],
  ["Book Your Himachal Tour", "Book Your Kerala Tour"],
  ['name="subjecty" value="Himachal Tour Query "', 'name="subjecty" value="Kerala Tour Query "'],
  ['name="destinationy" value="Himachal"', 'name="destinationy" value="Kerala"'],
  ["Monsoon (July-August) can be avoided in lower regions but is fine for Spiti and Lahaul.", "Monsoon brings heavy rains in hills but Ayurveda retreats are popular year-round."],
  ["Himachal Pradesh", "Kerala"],
];

for (const [from, to] of replacements) {
  index = index.split(from).join(to);
}

function applyGoogleAdsOptimizations(html) {
  const ogBlock = `
  <meta name="application-name" content="Uno Trips" />
  <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
  <meta property="og:url" content="${LANDING_URL}" />
  <meta property="og:site_name" content="Uno Trips" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:image" content="${HERO_IMG}" />
  <meta property="og:image:alt" content="Kerala tour packages - Munnar Alleppey backwaters" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Kerala Tour Packages | Munnar Alleppey Backwaters - Uno Trips" />
  <meta name="twitter:description" content="Book Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Free quote." />
  <meta name="twitter:image" content="${HERO_IMG}" />`;

  html = html.replace(
    '<meta property="og:description" content="Book best Kerala tour packages - Munnar, Alleppey, Kovalam. Get free quote. Best price guaranteed." />',
    `<meta property="og:description" content="Book best Kerala tour packages - Munnar, Alleppey, Kovalam. Get free quote. Best price guaranteed." />${ogBlock}`,
  );

  if (!html.includes("googletagmanager.com")) {
    html = html.replace(
      "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
      '<link rel="preconnect" href="https://www.googletagmanager.com" />\n  <link rel="preconnect" href="https://fonts.googleapis.com">',
    );
  }

  html = html.replace(
    `"@type": "TravelAgency",
      "name": "Uno Trips - Kerala Tour Packages",
      "description": "Book Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon packages, houseboat tours, custom itineraries.",
      "telephone": "+91-8353096965",
      "areaServed": "Kerala, India",
      "serviceType": ["Kerala Tour Packages", "Kerala Trip", "Munnar Alleppey Tour", "Kerala Honeymoon Package", "Kerala Group Tour"],
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Kerala",
        "addressCountry": "IN"
      }`,
    `"@type": "TravelAgency",
      "@id": "${LANDING_URL}#travel-agency",
      "name": "Uno Trips - Kerala Tour Packages",
      "url": "${LANDING_URL}",
      "logo": "https://unotrips.com/images/logo.png",
      "image": "${HERO_IMG}",
      "description": "Book Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon packages, houseboat tours, custom itineraries.",
      "telephone": "+91-8353096965",
      "email": "unotripsit@gmail.com",
      "priceRange": "₹₹",
      "areaServed": "Kerala, India",
      "serviceType": ["Kerala Tour Packages", "Kerala Trip", "Munnar Alleppey Tour", "Kerala Honeymoon Package", "Kerala Group Tour", "Kerala Houseboat Package"],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8353096965",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "India",
        "addressRegion": "Kerala",
        "addressCountry": "IN"
      }`,
  );

  const webPageSchema = `
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "${LANDING_URL}",
      "url": "${LANDING_URL}",
      "name": "Kerala Tour Packages | Munnar Alleppey Backwaters Tour - Uno Trips",
      "description": "Book best Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon & houseboat tours. Get free quote.",
      "inLanguage": "en-IN",
      "isPartOf": { "@type": "WebSite", "name": "Uno Trips", "url": "https://unotrips.com" },
      "about": { "@type": "Place", "name": "Kerala", "address": { "@type": "PostalAddress", "addressRegion": "Kerala", "addressCountry": "IN" } },
      "primaryImageOfPage": "${HERO_IMG}",
      "publisher": { "@type": "Organization", "name": "Uno Trips", "url": "https://unotrips.com" }
    }
  </script>`;

  html = html.replace("</script>\n\n  <link rel=\"stylesheet\" href=\"style.critical.min.css\" />", `</script>${webPageSchema}\n\n  <link rel="stylesheet" href="style.critical.min.css" />`);

  html = html.replace(
    `<h1 class="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
          Best Kerala Tour Packages
        </h1>`,
    `<h2 class="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
          Best Kerala Tour Packages
        </h2>`,
  );

  html = html.replace(
    `<li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>`,
    `<li><a href="https://unotrips.com" class="hover:text-white transition-colors" rel="noopener">About Uno Trips</a></li>
            <li><a href="tel:+918353096965" class="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>`,
  );

  html = html.replace(
    `<p class="text-sm text-gray-300">&copy; 2025 Uno Trips. All rights reserved.</p>`,
    `<p class="text-sm text-gray-300">&copy; 2026 Uno Trips. All rights reserved. | <a href="privacy.html" class="hover:text-white underline">Privacy Policy</a></p>`,
  );

  html = html.replace(
    `<input type="hidden" id="package-title" name="package-title" value="">

        <button type="submit" name="submit" class="enquiry-submit-btn" id="btnSubmit">`,
    `<input type="hidden" id="package-title" name="package-title" value="">
        <p class="form-privacy text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
          By submitting, you agree to our <a href="privacy.html" target="_blank" rel="noopener" class="text-blue-600 underline">Privacy Policy</a>.
          We use your details only to contact you about Kerala tour packages. No spam.
        </p>

        <button type="submit" name="submit" class="enquiry-submit-btn" id="btnSubmit">`,
  );

  return html;
}

index = applyGoogleAdsOptimizations(index);

writeFileSync(join(dest, "index.php"), index, "utf8");

const privacyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, follow" />
  <title>Privacy Policy - Uno Trips Kerala Tours</title>
  <link rel="stylesheet" href="style.critical.min.css" />
  <link rel="stylesheet" href="style.deferred.min.css" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17928878008"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-17928878008');</script>
</head>
<body class="bg-white page-body">
  <header class="site-header text-white py-3 px-4 md:px-6 shadow-lg">
    <div class="container mx-auto flex items-center justify-between">
      <a href="index.php"><img src="img/logo.png" alt="Uno Trips" class="h-8 md:h-10 w-auto" width="120" height="40" /></a>
      <a href="tel:+918353096965" class="header-call-btn px-4 py-2 rounded-xl text-white font-semibold text-sm">+91-8353096965</a>
    </div>
  </header>
  <main class="container mx-auto max-w-3xl px-4 py-10 text-gray-700 text-sm leading-relaxed">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
    <p class="mb-4">Uno Trips ("we", "us") operates this Kerala tour packages landing page at ${LANDING_URL}. This policy explains how we collect and use your information when you enquire about Kerala tour packages.</p>
    <h2 class="text-lg font-semibold text-gray-900 mt-6 mb-2">Information we collect</h2>
    <p class="mb-4">When you submit an enquiry form or chat, we may collect your name, phone number, email address, city, and the Kerala package you are interested in.</p>
    <h2 class="text-lg font-semibold text-gray-900 mt-6 mb-2">How we use your information</h2>
    <p class="mb-4">We use your details solely to contact you about Kerala tour packages, provide quotes, and assist with your travel planning. We do not sell your personal data to third parties.</p>
    <h2 class="text-lg font-semibold text-gray-900 mt-6 mb-2">Cookies &amp; advertising</h2>
    <p class="mb-4">This page uses Google Ads conversion tracking (Google tag AW-17928878008) to measure enquiries from our advertising campaigns. Google may use cookies as described in Google's privacy policy.</p>
    <h2 class="text-lg font-semibold text-gray-900 mt-6 mb-2">Contact</h2>
    <p class="mb-4">For privacy-related questions, contact Uno Trips at <a href="tel:+918353096965" class="text-blue-600 underline">+91-8353096965</a> or <a href="mailto:unotripsit@gmail.com" class="text-blue-600 underline">unotripsit@gmail.com</a>.</p>
    <p class="mt-8"><a href="index.php" class="text-blue-600 underline font-semibold">&larr; Back to Kerala Tour Packages</a></p>
  </main>
  <footer class="bg-gray-800 text-white py-6 px-4 text-center text-sm text-gray-300">&copy; 2026 Uno Trips. All rights reserved.</footer>
</body>
</html>`;
writeFileSync(join(dest, "privacy.html"), privacyHtml, "utf8");

let chatbot = readFileSync(join(dest, "chatbot.js"), "utf8");
chatbot = chatbot
  .replace(/Himachal Pradesh Tour Chatbot/g, "Kerala Tour Chatbot")
  .replace(/Himachal Pradesh Tour Services/g, "Kerala Tour Services")
  .replace(/Which Himachal trip are you looking for\?/g, "Which Kerala trip are you looking for?")
  .replace(/\['Manali', 'Shimla', 'Spiti', 'Dharamshala', 'Suggest best package'\]/g, "['Munnar', 'Alleppey', 'Thekkady', 'Kovalam', 'Suggest best package']");
writeFileSync(join(dest, "chatbot.js"), chatbot, "utf8");

let sendChat = readFileSync(join(dest, "send_chat.php"), "utf8");
sendChat = sendChat
  .split("Himachal Tour").join("Kerala Tour")
  .split("Himachal Pradesh Tour").join("Kerala Tour");
writeFileSync(join(dest, "send_chat.php"), sendChat, "utf8");

let thankyou = readFileSync(join(dest, "thankyou.html"), "utf8");
thankyou = thankyou
  .split("Himachal")
  .join("Kerala")
  .replace(
    "Experience the beauty of snow-clad peaks and valleys with our curated packages.",
    "Experience backwaters, beaches and lush green hills with our curated packages.",
  )
  .replace(
    `<li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>`,
    `<li><a href="https://unotrips.com" class="hover:text-white transition-colors" rel="noopener">About Uno Trips</a></li>
            <li><a href="tel:+918353096965" class="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>`,
  )
  .replace(
    "gtag('event', 'conversion', {",
    `gtag('event', 'generate_lead', { 'event_category': 'engagement', 'event_label': 'kerala_tour_enquiry' });
        gtag('event', 'conversion', {`,
  );
writeFileSync(join(dest, "thankyou.html"), thankyou, "utf8");

console.log("Kerala meta landing page built at meta/kerala/");
