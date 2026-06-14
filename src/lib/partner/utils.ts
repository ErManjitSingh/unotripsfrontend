/**
 * src/lib/partner/utils.ts
 * Shared formatting helpers used across partner pages.
 */

import { formatInrAmount } from "@/lib/utils";
import type { PropertyStatus, PartnerBookingStatus, PayoutStatus, KycStatus } from "./api";

export function formatInr(amount: number): string {
  return `₹${formatInrAmount(amount)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  draft:          "Draft",
  pending_review: "Under Review",
  approved:       "Live",
  rejected:       "Rejected",
  inactive:       "Inactive",
};

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, { bg: string; text: string; border: string }> = {
  draft:          { bg: "bg-slate-100",   text: "text-slate-600",   border: "border-slate-200"   },
  pending_review: { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
  approved:       { bg: "bg-green-50",    text: "text-green-700",   border: "border-green-200"   },
  rejected:       { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200"     },
  inactive:       { bg: "bg-slate-100",   text: "text-slate-500",   border: "border-slate-200"   },
};

export const BOOKING_STATUS_LABELS: Record<PartnerBookingStatus, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show:   "No Show",
};

export const BOOKING_STATUS_COLORS: Record<PartnerBookingStatus, { bg: string; text: string; border: string }> = {
  pending:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  confirmed: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  cancelled: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  completed: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  no_show:   { bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200"  },
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  paid:       "Paid",
  failed:     "Failed",
};

export const PAYOUT_STATUS_COLORS: Record<PayoutStatus, { bg: string; text: string; border: string }> = {
  pending:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  processing: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  paid:       { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  failed:     { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
};

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  not_started: "Not Started",
  submitted:   "Under Review",
  verified:    "Verified",
  rejected:    "Rejected",
};