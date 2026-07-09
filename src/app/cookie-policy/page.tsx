import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${SITE.name} uses cookies and similar technologies.`,
};

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      eyebrow="Cookie Policy"
      title="Cookies help us keep travel simple."
      intro="This policy explains how UNO Trips uses cookies and similar technologies to run the website, remember preferences, and improve booking flows."
      updated="6 July 2026"
      sections={[
        {
          title: "What cookies are",
          body: [
            "Cookies are small files stored on your device when you visit a website. Similar technologies may include local storage, pixels, tags, and analytics identifiers.",
            "They help us keep sessions stable, understand website performance, remember preferences, and improve user experience.",
          ],
        },
        {
          title: "Cookies we use",
          body: [
            "Essential cookies support core website functions such as navigation, login sessions, enquiry flows, security, and booking continuity.",
            "Analytics and performance cookies help us understand page usage, load speed, errors, and popular destinations so we can improve the website.",
            "Marketing or personalization cookies may help us show more relevant offers, destination suggestions, or campaign experiences where permitted.",
          ],
        },
        {
          title: "Third-party technologies",
          body: [
            "Some cookies or tracking technologies may be set by payment processors, analytics providers, advertising platforms, embedded tools, or customer support services.",
            "These providers process data under their own policies and controls, while UNO Trips uses them to support website functionality and service improvement.",
          ],
        },
        {
          title: "Managing cookies",
          body: [
            "You can control or delete cookies from your browser settings. Blocking some cookies may affect login, enquiry forms, booking flows, or saved preferences.",
            "If a cookie consent tool is shown on the website, you can use it to update your preferences where available.",
          ],
        },
        {
          title: "Contact",
          body: [
            `For questions about cookies or tracking technologies, contact ${SITE.name} at ${SITE.email}.`,
          ],
        },
      ]}
    />
  );
}
