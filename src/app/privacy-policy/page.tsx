import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses, and protects traveler information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy Policy"
      title="Your travel details stay protected."
      intro="This policy explains what information UNO Trips collects, why we collect it, and how we use it to plan and support your bookings."
      updated="6 July 2026"
      sections={[
        {
          title: "Information we collect",
          body: [
            "We may collect your name, phone number, email address, travel dates, destination preferences, traveler count, booking details, payment references, and support conversations.",
            "When you browse our website, we may collect basic technical information such as device type, browser, pages visited, and approximate location to keep the experience reliable and secure.",
          ],
        },
        {
          title: "How we use your information",
          body: [
            "We use your information to respond to enquiries, create itineraries, confirm bookings, coordinate hotels and transfers, process support requests, and send important trip updates.",
            "We may also use aggregated, non-identifying data to improve website performance, package recommendations, pricing clarity, and customer support quality.",
          ],
        },
        {
          title: "Sharing with partners",
          body: [
            "We share only the information needed to complete your trip with relevant hotels, transport providers, activity partners, payment processors, or support vendors.",
            "We do not sell your personal information. Partner access is limited to booking fulfilment, service delivery, fraud prevention, compliance, and customer support.",
          ],
        },
        {
          title: "Data security and retention",
          body: [
            "We use reasonable administrative, technical, and operational safeguards to protect your information from unauthorized access or misuse.",
            "We retain booking and communication records for as long as required for service, accounting, legal, dispute-resolution, and operational purposes.",
          ],
        },
        {
          title: "Your choices",
          body: [
            "You can request correction, access, or deletion of your personal information by contacting us, subject to legal, accounting, and booking-related retention requirements.",
            `For privacy requests, contact us at ${SITE.email}.`,
          ],
        },
      ]}
    />
  );
}
