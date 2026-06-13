// Shared wizard types used across all step components

export type PropertyType =
  | "hotel" | "resort" | "boutique_hotel" | "heritage_hotel"
  | "villa" | "homestay" | "service_apartment" | "hostel";

export type BedType = "single" | "double" | "twin" | "queen" | "king" | "bunk";
export type PartnerMealKey = "breakfast" | "lunch" | "dinner";
export type MealPlans = Partial<Record<PartnerMealKey, number>>;

export interface NearbyAttraction { name: string; distance_km: string; }
export interface DiningVenue { name: string; cuisine: string; timing: string; description: string; open_to_public: boolean; }
export interface ContactDetails { phone: string; email: string; whatsapp: string; website: string; gst: string; }
export interface PropertyPolicies { cancellation: string; check_in_time: string; check_out_time: string; children: string; pets: string; smoking: string; extra_bed: string; early_check_in: string; late_check_out: string; age_restriction: string; alcohol: string; payment_methods: string[]; }

export interface RoomTypePayload {
  name: string; description: string; bed_type: BedType;
  max_occupancy: number; size_sqft: number; count: number;
  amenities: string[]; images: string[];
  base_price: number; weekend_price?: number;
  is_active: boolean; meal_plans: MealPlans;
}

export interface WizardAgreements {
  terms_accepted: boolean; cancellation_accepted: boolean;
  payment_accepted: boolean; legal_accepted: boolean;
}

export interface PropertyWizardData {
  name: string; property_type: PropertyType; star_category: number;
  description: string; total_rooms: number;
  address: string; city: string; state: string; pincode: string;
  landmark: string; latitude: number; longitude: number;
  amenities: string[]; tags: string[];
  check_in_time: string; check_out_time: string;
  cancellation: string; children: string; pets: string; smoking: string;
  extra_bed: string; early_check_in: string; late_check_out: string;
  age_restriction: string; alcohol: string; payment_methods: string[];
  contact: ContactDetails;
  nearby_attractions: NearbyAttraction[];
  room_types: RoomTypePayload[];
  dining_venues: DiningVenue[];
  photo_categories: { category: string; label: string; images: string[] }[];
  agreements: WizardAgreements;
}

export const MEAL_DEFAULT_PRICES: Record<PartnerMealKey, number> = {
  breakfast: 300, lunch: 450, dinner: 450,
};
export const MEAL_PLAN_CODES: PartnerMealKey[] = ["breakfast", "lunch", "dinner"];
export const PARTNER_MEAL_PLAN_LABELS: Record<PartnerMealKey, string> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner",
};
export const PARTNER_MEAL_DESCRIPTIONS: Record<PartnerMealKey, string> = {
  breakfast: "Morning meal served daily",
  lunch: "Midday meal served daily",
  dinner: "Evening meal served daily",
};