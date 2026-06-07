export {
  API_DOCS_URL,
  ApiError,
  apiData,
  apiDataWithAuth,
  apiJson,
  apiRequest,
  getApiBase,
  getPublicApiBase,
  getServerApiBase,
} from "@/lib/api";

import { apiJson, apiRequest } from "@/lib/api";

const DEFAULT_INIT: RequestInit = { cache: "no-store" };

export async function apiGetEnvelope<T>(path: string, init?: RequestInit): Promise<T | null> {
  const result = await apiJson<T>(path, { ...DEFAULT_INIT, ...init });
  return result.ok ? result.data : null;
}

export async function apiGetRaw<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await apiRequest(path, { ...DEFAULT_INIT, ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getBackendBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_HOTELS_API_URL?.replace(/\/$/, "") ||
    process.env.HOTELS_API_URL?.replace(/\/$/, "") ||
    "https://unohotels-backend.onrender.com"
  );
}