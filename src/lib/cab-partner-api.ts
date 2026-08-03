export type CabPartnerDocument = {
  id: string;
  document_type: string;
  file_name: string | null;
  status: string;
  created_at: string;
};

export type CabPartnerApplication = {
  id: string;
  registration_type: "agency" | "individual";
  onboarding_status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "suspended";
  onboarding_step: number;
  owner_name: string;
  business_name: string | null;
  primary_phone: string;
  email: string | null;
  city: string;
  state: string;
  address: string | null;
  gstin: string | null;
  business_registration_number: string | null;
  organization_type: string | null;
  pincode: string | null;
  years_in_business: string | null;
  website: string | null;
  preferred_working_areas: string[];
  date_of_birth: string | null;
  gender: string | null;
  aadhaar_provided: boolean;
  driving_license_provided: boolean;
  pan_provided: boolean;
  review_notes: string | null;
  documents: CabPartnerDocument[];
};

export type CabPartnerContext = {
  is_cab_partner: boolean;
  membership_role: "owner" | "manager" | null;
  application: CabPartnerApplication | null;
};

export async function getCabPartnerContext(accessToken: string): Promise<CabPartnerContext> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch("/api/cab-partner/me", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message ?? "Could not load cab partner status.");
    return body.data ?? body;
  } finally {
    clearTimeout(timer);
  }
}

export async function createCabPartnerApplication(
  accessToken: string,
  payload: {
    registration_type: "agency" | "individual";
    owner_name: string;
    business_name?: string;
    primary_phone: string;
    email?: string;
    city: string;
    state: string;
  },
) {
  const response = await fetch("/api/cab-partner/applications", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  // A proxy/upstream can legally return an empty JSON body. Normalise it before
  // reading its envelope so the original API error remains visible to partners.
  const body = (await response.json().catch(() => ({}))) ?? {};
  if (!response.ok) throw new Error(body.message ?? "Could not save your application.");
  return body.data ?? body;
}

export async function updateCabPartnerApplication(accessToken: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/cab-partner/applications/me", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Could not save your application details.");
  return body.data ?? body;
}

export async function uploadCabPartnerDocument(accessToken: string, documentType: string, file: File) {
  const form = new FormData();
  form.set("document_type", documentType);
  form.set("file", file);
  const response = await fetch("/api/cab-partner/applications/me/documents/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Could not upload document.");
  return body.data ?? body;
}

export async function submitCabPartnerApplication(accessToken: string) {
  const response = await fetch("/api/cab-partner/applications/me/submit", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Could not submit application.");
  return body.data ?? body;
}

/** Map a saved draft application into form field values used by the onboarding wizard. */
export function draftApplicationToFormState(application: CabPartnerApplication) {
  const businessType: "agency" | "individual" =
    application.registration_type === "individual" ? "individual" : "agency";

  const basicValues: Record<string, string> = {
    full_name: application.owner_name || "",
    mobile_number: application.primary_phone || "",
    email_address: application.email || "",
    email_id: application.email || "",
    city_location: application.city || "",
    terms: "on",
  };

  const detailValues: Record<string, string> = {
    full_name: application.owner_name || "",
    mobile_number: application.primary_phone || "",
    email_id: application.email || "",
    email_address: application.email || "",
    business_agency_name: application.business_name || "",
    business_registration_number: application.business_registration_number || "",
    type_of_organization: application.organization_type || "",
    gst_number: application.gstin || "",
    pan_number: application.pan_provided ? "Provided securely" : "",
    business_address: application.address || "",
    address: application.address || "",
    city_town: application.city || "",
    state: application.state || "",
    pincode: application.pincode || "",
    years_in_business: application.years_in_business || "",
    website: application.website || "",
    preferred_working_city_area: application.preferred_working_areas?.[0] || "",
    date_of_birth: application.date_of_birth || "",
    gender: application.gender || "",
    aadhaar_number: application.aadhaar_provided ? "Provided securely" : "",
    driving_license_number: application.driving_license_provided ? "Provided securely" : "",
  };

  const uploadedDocuments = Object.fromEntries(
    (application.documents || []).map((document) => [
      document.document_type,
      document.file_name || document.document_type,
    ]),
  );

  const uploadState = Object.fromEntries(
    Object.keys(uploadedDocuments).map((key) => [key, "uploaded" as const]),
  );

  // Backend onboarding_step: 1 = started, 2 = details saved, 3 = docs started, 4 = submitted.
  // UI steps: 0 type, 1 details, 2 documents, 3 verification.
  const backendStep = Number(application.onboarding_step ?? 1);
  let step = 1;
  if ((application.documents?.length ?? 0) > 0 || backendStep >= 2) {
    step = 2;
  }

  return { businessType, basicValues, detailValues, uploadedDocuments, uploadState, step };
}

// ── Partner fleet (My Vehicles) ──────────────────────────────────────────────

export type PartnerCabCity = { city: string; state: string };

export type PartnerCab = {
  id: string;
  name: string;
  slug: string;
  category: string;
  seats: number;
  luggage_capacity: number;
  fuel_type: string | null;
  ac: boolean;
  permit_type: string | null;
  short_description: string | null;
  features: string[];
  service_types: string[];
  registration_number: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_year: number | null;
  base_city: string | null;
  vehicle_notes: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  driver_whatsapp: string | null;
  driver_license: string | null;
  featured_image: string | null;
  gallery_images: string[];
  cities: PartnerCabCity[];
  is_active: boolean;
  has_pricing: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnerCabPayload = {
  name: string;
  category: string;
  seats: number;
  luggage_capacity: number;
  fuel_type?: string | null;
  ac: boolean;
  permit_type?: string | null;
  short_description?: string;
  features?: string[];
  service_types?: string[];
  registration_number?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_year?: number | null;
  base_city?: string | null;
  vehicle_notes?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_whatsapp?: string | null;
  driver_license?: string | null;
  featured_image?: string | null;
  gallery_images?: string[];
  cities?: PartnerCabCity[];
};

async function partnerApi<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
  if (init?.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`/api/cab-partner/${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof body.detail === "string" ? body.detail : body.message;
    throw new Error(detail ?? "Cab partner request failed.");
  }
  return (body.data ?? body) as T;
}

export function listPartnerVehicles(accessToken: string) {
  return partnerApi<PartnerCab[]>(accessToken, "vehicles");
}

export function getPartnerVehicle(accessToken: string, cabId: string) {
  return partnerApi<PartnerCab>(accessToken, `vehicles/${cabId}`);
}

export function createPartnerVehicle(accessToken: string, payload: PartnerCabPayload) {
  return partnerApi<PartnerCab>(accessToken, "vehicles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePartnerVehicle(accessToken: string, cabId: string, payload: Partial<PartnerCabPayload>) {
  return partnerApi<PartnerCab>(accessToken, `vehicles/${cabId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setPartnerVehicleStatus(accessToken: string, cabId: string, isActive: boolean) {
  return partnerApi<PartnerCab>(accessToken, `vehicles/${cabId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function uploadPartnerVehiclePhoto(
  accessToken: string,
  file: File,
  category: "featured" | "gallery" = "gallery",
) {
  const form = new FormData();
  form.set("file", file);
  form.set("category", category);
  const response = await fetch("/api/cab-partner/vehicles/upload-photo", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? body.detail ?? "Could not upload photo.");
  const data = body.data ?? body;
  return { url: data.url as string, key: data.key as string | undefined };
}

export type PartnerCabNetPricing = {
  oneway_local_net: number;
  oneway_out_net: number;
  roundtrip_local_net: number;
  roundtrip_out_net: number;
  fullday_local_net: number;
  fullday_out_net: number;
  fullday_included_km: number;
  fullday_included_hrs: number;
  extra_km_net: number;
  extra_hr_net: number;
  driver_allowance_per_night: number;
  night_charge: number;
};

export type PartnerCabPricing = PartnerCabNetPricing & {
  oneway_local_selling: number;
  oneway_out_selling: number;
  roundtrip_local_selling: number;
  roundtrip_out_selling: number;
  fullday_local_selling: number;
  fullday_out_selling: number;
  extra_km_selling: number;
  extra_hr_selling: number;
};

export function getPartnerVehiclePricing(accessToken: string, cabId: string) {
  return partnerApi<PartnerCabPricing | null>(accessToken, `vehicles/${cabId}/pricing`);
}

export function upsertPartnerVehiclePricing(
  accessToken: string,
  cabId: string,
  payload: PartnerCabNetPricing,
) {
  return partnerApi<PartnerCabPricing>(accessToken, `vehicles/${cabId}/pricing`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export type PartnerCabBooking = {
  id: string;
  confirmation_number: string;
  status: string;
  payment_status: string;
  cab_type_id: string;
  cab_name: string;
  cab_category: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_registration: string | null;
  vehicle_model: string | null;
  trip_type: string;
  travel_date: string;
  return_date: string | null;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  drop_address: string;
  drop_city: string;
  drop_state: string;
  billed_distance_km: number;
  is_outstation: boolean;
  trip_duration_minutes: number | null;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  passengers: number;
  special_instructions: string | null;
  flight_train_number: string | null;
  trip_fare_net: number;
  driver_allowance: number;
  night_charge: number;
  subtotal_net: number;
  total_amount: number;
  currency: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export function listPartnerBookings(accessToken: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return partnerApi<PartnerCabBooking[]>(accessToken, `bookings${qs}`);
}

export function getPartnerBooking(accessToken: string, bookingId: string) {
  return partnerApi<PartnerCabBooking>(accessToken, `bookings/${bookingId}`);
}

export function markPartnerBookingCompleted(accessToken: string, bookingId: string) {
  return partnerApi<PartnerCabBooking>(accessToken, `bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" }),
  });
}

export function updatePartnerBookingDriver(
  accessToken: string,
  bookingId: string,
  payload: { driver_name: string; driver_phone: string },
) {
  return partnerApi<PartnerCabBooking>(accessToken, `bookings/${bookingId}/driver`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updatePartnerBookingVehicle(
  accessToken: string,
  bookingId: string,
  payload: { cab_id: string; sync_driver?: boolean },
) {
  return partnerApi<PartnerCabBooking>(accessToken, `bookings/${bookingId}/vehicle`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function cancelPartnerBooking(accessToken: string, bookingId: string, reason: string) {
  return partnerApi<PartnerCabBooking>(accessToken, `bookings/${bookingId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export type PartnerEarningsDay = {
  date: string;
  label: string;
  amount: number;
  trip_count: number;
};

export type PartnerEarningsTrip = {
  booking_id: string;
  confirmation_number: string;
  route_label: string;
  travel_date: string;
  completed_at: string;
  amount: number;
  currency: string;
  status: string;
};

export type PartnerEarningsSummary = {
  currency: string;
  total_earnings: number;
  completed_trips: number;
  confirmed_pending: number;
  confirmed_trips: number;
  this_week_earnings: number;
  avg_rating: number | null;
  review_count: number;
  daily: PartnerEarningsDay[];
  recent_trips: PartnerEarningsTrip[];
};

export function getPartnerEarningsSummary(accessToken: string) {
  return partnerApi<PartnerEarningsSummary>(accessToken, "earnings/summary");
}

export type PartnerBankDetails = {
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_account_holder: string | null;
  has_bank_details: boolean;
  bank_account_verified: boolean;
  bank_verified_at: string | null;
};

export function getPartnerBank(accessToken: string) {
  return partnerApi<PartnerBankDetails>(accessToken, "bank");
}

export function updatePartnerBank(
  accessToken: string,
  payload: {
    bank_account_number: string;
    bank_ifsc: string;
    bank_account_holder: string;
  },
) {
  return partnerApi<PartnerBankDetails>(accessToken, "bank", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type PartnerPayout = {
  id: string;
  booking_id: string;
  confirmation_number: string | null;
  route_label: string | null;
  travel_date: string | null;
  gross_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  utr: string | null;
  paid_at: string | null;
  created_at: string;
};

export type PartnerPayoutSummary = {
  currency: string;
  pending_settlement: number;
  pending_count: number;
  paid_out: number;
  paid_count: number;
  confirmed_pending: number;
  confirmed_trips: number;
  has_bank_details: boolean;
  bank_account_verified: boolean;
};

export function getPartnerPayoutSummary(accessToken: string) {
  return partnerApi<PartnerPayoutSummary>(accessToken, "payouts/summary");
}

export function listPartnerPayouts(accessToken: string) {
  return partnerApi<PartnerPayout[]>(accessToken, "payouts");
}

export type PartnerCabReview = {
  id: string;
  booking_id: string;
  confirmation_number: string | null;
  route_label: string | null;
  travel_date: string | null;
  owner_id: string | null;
  user_id: string | null;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  partner_reply: string | null;
  partner_replied_at: string | null;
  status: string;
  created_at: string;
};

export function listPartnerReviews(accessToken: string) {
  return partnerApi<PartnerCabReview[]>(accessToken, "reviews");
}

export function replyToPartnerReview(accessToken: string, reviewId: string, partner_reply: string) {
  return partnerApi<PartnerCabReview>(accessToken, `reviews/${reviewId}/reply`, {
    method: "PATCH",
    body: JSON.stringify({ partner_reply }),
  });
}
