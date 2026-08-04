import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: `Cancellation, refund, and change rules for ${SITE.name} bookings.`,
};

export default function CancellationPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Cancellation Policy"
      title="Clear cancellation rules before you book."
      intro="Cancellation and refund amounts depend on the package, suppliers, travel date, season, and components included in your booking."
      updated="6 July 2026"
      sections={[
        {
          title: "General cancellation terms",
          body: [
            "Every confirmed booking may have a cancellation schedule based on hotels, transport, activities, permits, flights, trains, buses, and destination-specific rules.",
            "Your final quote or booking confirmation may include stricter or more specific terms. Those booking-specific terms will take priority over this general policy.",
          ],
        },
        {
          title: "Typical package cancellation slabs",
          body: [
            "More than 30 days before travel: cancellation charges may start from 10% of the package cost, plus any non-refundable supplier charges.",
            "15 to 29 days before travel: cancellation charges may be around 25% of the package cost. 7 to 14 days before travel: charges may be around 50%.",
            "Within 7 days of travel, during no-show, or after trip commencement, bookings are generally non-refundable unless a supplier confirms otherwise.",
          ],
        },
        {
          title: "Flights, hotels, and supplier fees",
          body: [
            "Airlines, hotels, transport providers, activity operators, and visa or permit vendors may apply separate cancellation, rescheduling, or no-show charges.",
            "Refunds for these components are processed only after the supplier confirms eligibility and releases the amount to UNO Trips.",
          ],
        },
        {
          title: "Refund timeline",
          body: [
            "Eligible refunds are generally processed to the original payment method after supplier confirmation and internal reconciliation.",
            "Bank, card, UPI, wallet, or payment gateway timelines may vary after UNO Trips initiates the refund.",
          ],
        },
        {
          title: "How to cancel",
          body: [
            `To request cancellation, contact us at ${SITE.email} or ${SITE.phone} with your booking reference, traveler name, and reason for cancellation.`,
            "Cancellation is considered requested only after UNO Trips receives the request through an official support channel.",
          ],
        },
      ]}
    />
  );
}
