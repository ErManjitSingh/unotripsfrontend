// Shared wizard types used across all step components

export type PropertyType =
  | "hotel" | "resort" | "boutique_hotel" | "heritage_hotel"
  | "villa" | "homestay" | "service_apartment" | "hostel";

export type BedType = "single" | "double" | "twin" | "queen" | "king" | "bunk";

export interface NearbyAttraction { name: string; distance_km: string; }
export interface DiningVenue { name: string; cuisine: string; timing: string; description: string; open_to_public: boolean; }
export interface ContactDetails { phone: string; email: string; whatsapp: string; website: string; gst: string; }
export interface PropertyPolicies { cancellation: string; check_in_time: string; check_out_time: string; children: string; pets: string; smoking: string; extra_bed: string; early_check_in: string; late_check_out: string; age_restriction: string; alcohol: string; payment_methods: string[]; }

// ── Rate plans ──────────────────────────────────────────────────────────────
// AUDIT FIX (partner/backend pricing alignment, 2026-07): base_price,
// weekend_price, and the flat meal_plans dict (breakfast/lunch/dinner,
// separately priced) are RETIRED on the backend — see
// app/schemas/hotels/property.py's RoomTypePayload. A room is now priced
// exactly the way Ops prices it: one number per meal-plan tier, per
// channel, per rate row (Room Rate / Extra Bed). rate_plans is REQUIRED
// by the backend (no fallback price source left) and the backend
// server-side validates rate_plans.website.room.ep > 0.
//
// Partner only ever fills in the "website" channel — "staff" and "agent"
// are Ops-exclusive (enforced server-side by RateInventoryService), but
// the full RatePlans shape must still be sent because the backend schema
// has no default for it. We send zeroed staff/agent blocks.
//
//   EP  = Room only
//   CP  = Room + breakfast
//   MAP = Room + breakfast + one more meal (usually dinner)
//   AP  = Room + all meals
export interface RatePlanBlock {
  ep:  number;
  cp:  number;
  map: number;
  ap:  number;
}

export interface RatePlanChannel {
  room:      RatePlanBlock;
  extra_bed: RatePlanBlock;
}

export interface RatePlans {
  website: RatePlanChannel;
  staff:   RatePlanChannel;
  agent:   RatePlanChannel;
}

/** Fresh, independent zeroed rate-plan block — never share/mutate a single instance. */
export function emptyRatePlanBlock(): RatePlanBlock {
  return { ep: 0, cp: 0, map: 0, ap: 0 };
}

/** Fresh, independent zeroed channel (room + extra_bed rows). */
export function emptyRatePlanChannel(): RatePlanChannel {
  return { room: emptyRatePlanBlock(), extra_bed: emptyRatePlanBlock() };
}

/** Fresh, independent zeroed rate_plans object for all 3 channels. */
export function emptyRatePlans(): RatePlans {
  return {
    website: emptyRatePlanChannel(),
    staff:   emptyRatePlanChannel(),
    agent:   emptyRatePlanChannel(),
  };
}

export interface RoomTypePayload {
  name: string; description: string; bed_type: BedType;
  max_occupancy: number; size_sqft: number; count: number;
  amenities: string[]; images: string[];
  rate_plans: RatePlans; weekend_markup_percent?: number;
  is_active: boolean;
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