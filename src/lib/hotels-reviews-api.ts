/**
 * Hotel reviews API
 * @see https://unohotels-backend.onrender.com/docs
 */

import { apiData, apiDataWithAuth } from "@/lib/api";
import type { ApiReview } from "@/lib/hotels-api";

export type SubmitHotelReviewPayload = {
  booking_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
};

export async function fetchHotelReviews(
  propertyId: string,
  limit = 20,
): Promise<ApiReview[]> {
  const params = new URLSearchParams({
    property_id: propertyId,
    limit: String(limit),
  });
  const data = await apiData<ApiReview[] | { items?: ApiReview[] }>(
    `/v1/reviews?${params.toString()}`,
  );
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export async function submitHotelReview(
  accessToken: string,
  payload: SubmitHotelReviewPayload,
): Promise<unknown> {
  return apiDataWithAuth("/v1/reviews", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMyReviews(accessToken: string): Promise<ApiReview[]> {
  const data = await apiDataWithAuth<ApiReview[] | { items?: ApiReview[] }>(
    "/v1/reviews/mine",
    accessToken,
  );
  return Array.isArray(data) ? data : (data.items ?? []);
}
