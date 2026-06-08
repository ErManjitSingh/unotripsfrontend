/**
 * Auth API — https://unohotels-backend.onrender.com/docs
 */

import { ApiError, apiData, apiJson, type ApiEnvelope } from "@/lib/api";
import { fetchAccountProfile } from "@/lib/hotels-account-api";

/** Browser → /api/auth/* (server proxy with wake-up). SSR → /v1/auth/* direct. */
function authApiPath(segment: string): string {
  const path = segment.startsWith("/") ? segment : `/${segment}`;
  if (typeof window !== "undefined") {
    return `/api/auth${path.replace(/^\/v1\/auth/, "")}`;
  }
  return path.startsWith("/v1/auth") ? path : `/v1/auth${path}`;
}

export type { ApiEnvelope };
export { ApiError, ApiError as HotelsAuthError };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  partner_id?: string | null;
  kyc_status?: string | null;
  partner_status?: string | null;
  phone_verified?: boolean;
  email_verified?: boolean;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

function isAuthTokens(value: unknown): value is AuthTokens {
  return (
    !!value &&
    typeof value === "object" &&
    "access_token" in value &&
    typeof (value as AuthTokens).access_token === "string"
  );
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    typeof (value as AuthUser).id === "string"
  );
}

function normalizeTokens(raw: Record<string, unknown>): AuthTokens {
  return {
    access_token: String(raw.access_token),
    refresh_token: String(raw.refresh_token ?? raw.access_token),
    expires_in: Number(raw.expires_in ?? 1800),
  };
}

function guestUserFromPhone(phone: string): AuthUser {
  const now = new Date().toISOString();
  const digits = phone.replace(/\D/g, "").slice(-10);
  return {
    id: `guest-phone-${digits}`,
    email: `${digits}@guest.unotrips.local`,
    name: `Guest ${digits.slice(-4)}`,
    phone: digits,
    avatar: null,
    role: "guest",
    is_verified: true,
    is_active: true,
    created_at: now,
    updated_at: now,
    phone_verified: true,
    email_verified: false,
  };
}

/** Guest OTP may return tokens-only; email login returns user + tokens. */
export async function normalizeAuthPayload(data: unknown, phone?: string): Promise<AuthResponse> {
  if (!data || typeof data !== "object") {
    throw new ApiError("Unexpected auth response from server.", 500);
  }

  const record = data as Record<string, unknown>;

  if (isAuthUser(record.user) && isAuthTokens(record.tokens)) {
    return { user: record.user, tokens: record.tokens };
  }

  if (isAuthTokens(record)) {
    const tokens = normalizeTokens(record as unknown as Record<string, unknown>);
    try {
      const user = await fetchAuthMe(tokens.access_token);
      return { user, tokens };
    } catch {
      try {
        const user = await fetchAccountProfile(tokens.access_token);
        return { user, tokens };
      } catch {
        if (!phone) throw new ApiError("Login succeeded but profile could not be loaded.", 500);
        return { user: guestUserFromPhone(phone), tokens };
      }
    }
  }

  throw new ApiError("Unexpected auth response from server.", 500);
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "guest" | "partner";
}): Promise<AuthResponse> {
  const phone = payload.phone?.replace(/\D/g, "").slice(-10);
  if (!phone || phone.length !== 10) {
    throw new ApiError("A valid 10-digit mobile number is required.", 422);
  }

  const data = await apiData<unknown>(authApiPath("/v1/auth/register"), {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone,
      role: payload.role ?? "guest",
    }),
  });
  return normalizeAuthPayload(data);
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const data = await apiData<unknown>(authApiPath("/v1/auth/login"), {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return normalizeAuthPayload(data);
}

export async function refreshAuthTokens(refreshToken: string): Promise<AuthTokens> {
  return apiData<AuthTokens>(authApiPath("/v1/auth/refresh"), {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function fetchAuthMe(accessToken: string): Promise<AuthUser> {
  return apiData<AuthUser>(authApiPath("/v1/auth/me"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function logoutUser(accessToken: string): Promise<void> {
  await apiData<{ message?: string }>(authApiPath("/v1/auth/logout"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function guestSendOtp(phone: string): Promise<{ message: string }> {
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);

  if (normalized.length !== 10) {
    throw new ApiError("Enter a valid 10-digit mobile number.", 422);
  }

  const result = await apiJson<{ message: string }>(authApiPath("/v1/auth/guest/send-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: normalized }),
  });

  if (!result.ok) {
    throw new ApiError(result.message, result.status);
  }

  return result.data;
}

export async function guestVerifyOtp(phone: string, otp: string): Promise<AuthResponse> {
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);
  const code = otp.replace(/\D/g, "").slice(0, 6);

  if (normalized.length !== 10) {
    throw new ApiError("Enter a valid 10-digit mobile number.", 422);
  }
  if (code.length !== 6) {
    throw new ApiError("Enter the 6-digit OTP.", 422);
  }

  const result = await apiJson<unknown>(authApiPath("/v1/auth/guest/verify-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: normalized, otp: code }),
  });

  if (!result.ok) {
    throw new ApiError(result.message, result.status);
  }

  return normalizeAuthPayload(result.data, normalized);
}

export async function forgotPassword(email: string): Promise<{ message?: string }> {
  return apiData<{ message?: string }>(authApiPath("/v1/auth/forgot-password"), {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
