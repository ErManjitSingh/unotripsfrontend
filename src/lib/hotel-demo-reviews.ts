import type { HotelListing } from "@/lib/hotels-catalog";

export type HotelReviewUi = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  roomType?: string | null;
  helpfulCount?: number;
};

export function buildDemoHotelReviews(hotel: HotelListing, cityName: string): HotelReviewUi[] {
  const rating = hotel.rating > 0 ? hotel.rating : 4.2;
  const room = hotel.defaultRoomType !== "Room" ? hotel.defaultRoomType : "Standard Room";

  return [
    {
      id: `${hotel.id}-demo-1`,
      author: "Ananya S.",
      rating: Math.min(5, rating + 0.2),
      title: "Smooth check-in and comfortable rooms",
      body: `Stayed at ${hotel.name} for a weekend in ${cityName}. Staff was helpful, room was clean, and the location worked well for sightseeing. Would book again through UNO Trips.`,
      date: "April 2026",
      roomType: room,
      helpfulCount: 18,
    },
    {
      id: `${hotel.id}-demo-2`,
      author: "Rahul K.",
      rating: Math.max(3.5, rating - 0.1),
      title: "Good value for the price",
      body: "Breakfast options were decent and Wi-Fi was stable throughout the stay. Room size matched the listing photos. Minor wait at checkout but overall a solid experience.",
      date: "March 2026",
      roomType: room,
      helpfulCount: 11,
    },
    {
      id: `${hotel.id}-demo-3`,
      author: "Meera P.",
      rating: Math.min(5, rating + 0.4),
      title: "Perfect for a family trip",
      body: `Kids loved the stay and we felt safe in the ${cityName} property. Housekeeping was on time every day. Booking and payment on UNO Trips was hassle-free.`,
      date: "February 2026",
      roomType: room,
      helpfulCount: 9,
    },
  ];
}
