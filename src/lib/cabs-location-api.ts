import { ApiError, apiRequest } from "@/lib/api";

export type CabLocation = {
  place_id: string;
  label: string;
  locality?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  result_type?: string | null;
};

export type CabRouteEstimate = {
  distance_km: number;
  duration_minutes: number;
  cached: boolean;
};

async function cabLocationData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest(path, init);
  const body = await response.json().catch(() => null) as { data?: T; message?: string } | T | null;
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? body.message : "Location service request failed";
    throw new ApiError(message || "Location service request failed", response.status);
  }
  // Public cab routes return their raw payload, whereas most website APIs use { data }.
  return body && typeof body === "object" && !Array.isArray(body) && "data" in body ? body.data as T : body as T;
}

export function searchCabLocations(query: string): Promise<CabLocation[]> {
  return cabLocationData<CabLocation[]>(`/v1/cabs/locations/autocomplete?q=${encodeURIComponent(query)}&limit=5`);
}

export function estimateCabRoute(pickup: CabLocation, drop: CabLocation): Promise<CabRouteEstimate> {
  return cabLocationData<CabRouteEstimate>("/v1/cabs/locations/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pickup, drop }),
  });
}
