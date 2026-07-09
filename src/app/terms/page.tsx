import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for using ${SITE.name} services and booking travel through UNO Trips.`,
};

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms of Service"
      title="Simple terms for smoother travel."
      intro="These terms describe how enquiries, quotes, bookings, payments, changes, and support work when you use UNO Trips."
      updated="6 July 2026"
      sections={[
        {
          title: "Use of our services",
          body: [
            "By using our website, submitting an enquiry, or confirming a booking, you agree to provide accurate traveler, contact, and payment information.",
            "You are responsible for checking names, travel dates, destination details, inclusions, exclusions, hotel category, transport type, and any special conditions before payment.",
          ],
        },
        {
          title: "Quotes and bookings",
          body: [
            "Prices, availability, hotel rooms, flights, transfers, and activities are subject to confirmation at the time of booking.",
            "A booking is confirmed only after required payment is received and UNO Trips issues a confirmation through email, WhatsApp, dashboard, or another official channel.",
          ],
        },
        {
          title: "Payments",
          body: [
            "Payment schedules may include token amounts, partial payments, or full payments depending on the package, date of travel, and supplier requirements.",
            "Taxes, convenience fees, payment gateway charges, peak-season supplements, and supplier surcharges may apply where relevant and will be communicated before confirmation.",
          ],
        },
        {
          title: "Traveler responsibilities",
          body: [
            "Travelers are responsible for valid identity documents, visas, permits, health requirements, baggage rules, and reporting on time for transfers, flights, trains, buses, and activities.",
            "UNO Trips may assist with guidance, but final compliance with government, airline, hotel, and destination rules remains the traveler's responsibility.",
          ],
        },
        {
          title: "Changes and support",
          body: [
            "Change requests are handled subject to availability, supplier policies, revised pricing, and timelines. Some components may be non-refundable or non-changeable.",
            `For help with an active booking, contact ${SITE.phone} or ${SITE.email}.`,
          ],
        },
      ]}
    />
  );
}
