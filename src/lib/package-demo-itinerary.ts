import type { TourItineraryDay, TourPackage } from "@/lib/constants";

export type ItineraryActivityKind = "transfer" | "sightseeing" | "hotel" | "meal";

export type PackageItineraryActivity = {
  id: string;
  kind: ItineraryActivityKind;
  label?: string;
  title: string;
  subtitle?: string;
  image: string;
  meta?: string[];
  hotelStars?: number;
  hotelScore?: number;
  hotelScoreLabel?: string;
  checkIn?: string;
  checkOut?: string;
  placesCovered?: number;
};

export type PackageItineraryDayPlan = {
  day: number;
  dateLabel: string;
  location: string;
  title: string;
  summary: {
    hotels: number;
    transfers: number;
    activities: number;
    meals: number;
  };
  activities: PackageItineraryActivity[];
};

export type PackageDemoItinerary = {
  days: PackageItineraryDayPlan[];
  totals: {
    days: number;
    transfers: number;
    hotels: number;
    activities: number;
    meals: number;
  };
};

const DEMO_START = new Date(2026, 4, 18);
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const IMAGES = {
  transfer:
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80",
  sightseeing:
    "https://images.unsplash.com/photo-1469854523086-cc02fe7d8800?w=400&q=80",
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
  meal:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  mountain:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
} as const;

function formatDateLabel(dayIndex: number): string {
  const d = new Date(DEMO_START);
  d.setDate(d.getDate() + dayIndex - 1);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

function formatShortDate(dayIndex: number): string {
  const d = new Date(DEMO_START);
  d.setDate(d.getDate() + dayIndex - 1);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function parseCities(location?: string): string[] {
  if (!location?.trim()) return ["Destination"];
  const parts = location
    .split(/[,|·/&]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : ["Destination"];
}

function cityShort(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

function hotelName(city: string, seed: number): string {
  const names = [
    "Goldenfern Resort",
    "Himalayan Heights",
    "Valley View Retreat",
    "Snowline Grand",
    "Pine Crest Hotel",
  ];
  return `${names[seed % names.length]} ${cityShort(city)}`;
}

function countSummary(activities: PackageItineraryActivity[]) {
  return {
    hotels: activities.filter((a) => a.kind === "hotel").length,
    transfers: activities.filter((a) => a.kind === "transfer").length,
    activities: activities.filter((a) => a.kind === "sightseeing").length,
    meals: activities.filter((a) => a.kind === "meal").length,
  };
}

function buildDayActivities(
  tour: TourPackage,
  day: number,
  totalDays: number,
  city: string,
  prevCity: string | null,
  apiDay?: TourItineraryDay,
): PackageItineraryActivity[] {
  const img = tour.image || IMAGES.mountain;
  const activities: PackageItineraryActivity[] = [];
  const short = cityShort(city);

  if (day === 1) {
    activities.push({
      id: `d${day}-t1`,
      kind: "transfer",
      label: "TRANSFER",
      title: "Private Transfer",
      subtitle: apiDay?.title ?? `Arrival transfer to ${short}`,
      image: IMAGES.transfer,
      meta: ["3 seater | AC", "Duration: 4–5 Hours"],
    });
    activities.push({
      id: `d${day}-s1`,
      kind: "sightseeing",
      title: `Sightseeing in ${short}`,
      subtitle: "Local orientation & scenic viewpoints",
      image: img,
      meta: ["Places Covered: 2", "Duration: 3 Hours"],
      placesCovered: 2,
    });
    activities.push({
      id: `d${day}-h1`,
      kind: "hotel",
      label: "RESORT",
      title: hotelName(city, day),
      image: IMAGES.hotel,
      hotelStars: 4,
      hotelScore: 4.2 + (day % 3) * 0.1,
      hotelScoreLabel: "Excellent",
      checkIn: formatShortDate(day),
      checkOut: formatShortDate(Math.min(totalDays, day + 1)),
      meta: ["Breakfast included"],
    });
    activities.push({
      id: `d${day}-m1`,
      kind: "meal",
      label: "MEAL",
      title: "Welcome Dinner",
      subtitle: "At hotel or local restaurant",
      image: IMAGES.meal,
      meta: ["1 Meal included"],
    });
    return activities;
  }

  if (day === totalDays) {
    activities.push({
      id: `d${day}-m1`,
      kind: "meal",
      label: "MEAL",
      title: "Breakfast",
      subtitle: "At hotel",
      image: IMAGES.meal,
      meta: ["1 Meal included"],
    });
    activities.push({
      id: `d${day}-s1`,
      kind: "sightseeing",
      title: "Leisure until check-out",
      subtitle: apiDay?.title ?? "Free time for shopping & photos",
      image: img,
      meta: ["Duration: 2 Hours"],
    });
    activities.push({
      id: `d${day}-t1`,
      kind: "transfer",
      label: "TRANSFER",
      title: "Private Transfer",
      subtitle: apiDay?.body?.slice(0, 80) ?? `Departure from ${short}`,
      image: IMAGES.transfer,
      meta: ["3 seater | AC", "Duration: 4–5 Hours"],
    });
    return activities;
  }

  if (prevCity && prevCity !== city) {
    activities.push({
      id: `d${day}-t1`,
      kind: "transfer",
      label: "TRANSFER",
      title: "Private Transfer",
      subtitle: `${cityShort(prevCity)} to ${short}`,
      image: IMAGES.transfer,
      meta: ["3 seater | AC", "Duration: 5–6 Hours"],
    });
  }

  activities.push({
    id: `d${day}-s1`,
    kind: "sightseeing",
    title: `Sightseeing in ${short}`,
    subtitle: apiDay?.title ?? `Explore ${short} highlights`,
    image: img,
    meta: ["Places Covered: 3", "Duration: 5 Hours"],
    placesCovered: 3,
  });

  if (day % 2 === 0) {
    activities.push({
      id: `d${day}-s2`,
      kind: "sightseeing",
      title: "Optional local experiences",
      subtitle: "Adventure or cultural add-on",
      image: IMAGES.mountain,
      meta: ["Duration: 2 Hours"],
    });
  }

  activities.push({
    id: `d${day}-h1`,
    kind: "hotel",
    label: "RESORT",
    title: hotelName(city, day + 2),
    image: IMAGES.hotel,
    hotelStars: 4,
    hotelScore: 4.3,
    hotelScoreLabel: "Excellent",
    checkIn: formatShortDate(day),
    checkOut: formatShortDate(day + 1),
  });

  activities.push({
    id: `d${day}-m1`,
    kind: "meal",
    label: "MEAL",
    title: day % 2 === 0 ? "Breakfast & Dinner" : "Breakfast",
    image: IMAGES.meal,
    meta: [day % 2 === 0 ? "2 Meals included" : "1 Meal included"],
  });

  return activities;
}

/** Rich day-wise plan for package detail (demo until API provides structured itinerary). */
export function buildDemoPackageItinerary(tour: TourPackage): PackageDemoItinerary {
  const totalDays = Math.max(1, tour.durationDays || tour.durationNights + 1 || 5);
  const cities = parseCities(tour.location);
  const apiByDay = new Map(
    (tour.itinerary ?? []).map((d) => [d.day, d] as const),
  );

  const days: PackageItineraryDayPlan[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const cityIndex = Math.min(
      cities.length - 1,
      Math.floor(((day - 1) * cities.length) / totalDays),
    );
    const city = cities[cityIndex] ?? cities[0] ?? "Destination";
    const prevCity =
      day > 1
        ? cities[
            Math.min(
              cities.length - 1,
              Math.floor(((day - 2) * cities.length) / totalDays),
            )
          ]
        : null;
    const apiDay = apiByDay.get(day);
    const activities = buildDayActivities(
      tour,
      day,
      totalDays,
      city,
      prevCity,
      apiDay,
    );
    const summary = countSummary(activities);

    days.push({
      day,
      dateLabel: formatDateLabel(day),
      location: cityShort(city),
      title: apiDay?.title ?? (day === 1 ? `Arrival in ${cityShort(city)}` : day === totalDays ? "Departure" : `Explore ${cityShort(city)}`),
      summary,
      activities,
    });
  }

  const totals = days.reduce(
    (acc, d) => ({
      days: acc.days + 1,
      transfers: acc.transfers + d.summary.transfers,
      hotels: acc.hotels + d.summary.hotels,
      activities: acc.activities + d.summary.activities,
      meals: acc.meals + d.summary.meals,
    }),
    { days: 0, transfers: 0, hotels: 0, activities: 0, meals: 0 },
  );

  return { days, totals };
}
