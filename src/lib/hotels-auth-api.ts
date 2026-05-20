/**
 * Auth API — https://unohotels-backend.onrender.com/docs
 */

import { ApiError, apiData, type ApiEnvelope } from "@/lib/api";

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

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "guest" | "partner";
}): Promise<AuthResponse> {
  return apiData<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone ?? null,
      role: payload.role ?? "guest",
    }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return apiData<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshAuthTokens(refreshToken: string): Promise<AuthTokens> {
  return apiData<AuthTokens>("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function fetchAuthMe(accessToken: string): Promise<AuthUser> {
  return apiData<AuthUser>("/v1/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function logoutUser(accessToken: string): Promise<void> {
  await apiData<{ message?: string }>("/v1/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function guestSendOtp(phone: string): Promise<{ message: string }> {
  return apiData<{ message: string }>("/v1/auth/guest/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone: phone.replace(/\D/g, "").slice(-10) }),
  });
}

export async function guestVerifyOtp(phone: string, otp: string): Promise<AuthResponse> {
  return apiData<AuthResponse>("/v1/auth/guest/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      phone: phone.replace(/\D/g, "").slice(-10),
      otp: otp.replace(/\D/g, "").slice(0, 6),
    }),
  });
}

export async function forgotPassword(email: string): Promise<{ message?: string }> {
  return apiData<{ message?: string }>("/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
