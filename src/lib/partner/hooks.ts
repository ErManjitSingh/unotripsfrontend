/**
 * src/lib/partner/hooks.ts
 * React Query hooks for partner data — all use the existing auth context.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "./api";

function useToken(): string | null {
  const { getAccessToken } = useAuth();
  return getAccessToken();
}

// ── Account ───────────────────────────────────────────────────────────────────

export function usePartnerAccount() {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-account"],
    queryFn: () => partnerApi.getAccount(token!),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Properties ────────────────────────────────────────────────────────────────

export function usePartnerProperties(params: { page?: number; limit?: number; status?: string } = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-properties", params],
    queryFn: () => partnerApi.listProperties(token!, params),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePartnerProperty(propertyId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-property", propertyId],
    queryFn: () => partnerApi.getProperty(token!, propertyId),
    enabled: !!token && !!propertyId,
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function usePartnerBookings(params: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  date_from?: string;
  date_to?: string;
  property_id?: string;
} = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-bookings", params],
    queryFn: () => partnerApi.listBookings(token!, params),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function usePartnerAnalytics(period: string, propertyId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-analytics", period, propertyId],
    queryFn: () => partnerApi.getAnalyticsSummary(token!, period, propertyId),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useRevenueChart(period: string, propertyId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-revenue-chart", period, propertyId],
    queryFn: () => partnerApi.getRevenueChart(token!, period, propertyId),
    enabled: !!token,
  });
}

// ── Payouts ───────────────────────────────────────────────────────────────────

export function usePartnerPayouts(params: { page?: number; limit?: number } = {}) {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-payouts", params],
    queryFn: () => partnerApi.listPayouts(token!, params),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePayoutSummary() {
  const token = useToken();
  return useQuery({
    queryKey: ["partner-payout-summary"],
    queryFn: () => partnerApi.getPayoutSummary(token!),
    enabled: !!token,
    staleTime: 30_000,
  });
}