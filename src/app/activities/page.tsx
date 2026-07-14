/**
 * src/app/activities/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER COMPONENT — no "use client" here.
 * All interactivity lives in ActivitiesClient (imported below).
 * This is the correct Next.js App Router pattern — same as hotels/page.tsx.
 *
 * 404 was happening because:
 *   1. The src/app/activities/ folder didn't exist
 *   2. The page had "use client" at top — not allowed for page.tsx metadata export
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Metadata } from "next";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { Footer }          from "@/components/layout/Footer";
import { ActivitiesClient } from "@/components/activities/ActivitiesClient";

export const metadata: Metadata = {
  title: "Activities & Experiences | UNO Trips",
  description:
    "Book adventure, trekking, water sports, wildlife & cultural experiences across India. Verified operators, best prices.",
};

export default function ActivitiesPage() {
  return (
    <>
      <HeroGlassNavbar activeId="activities" darkText />
      <main>
        <ActivitiesClient />
      </main>
      <Footer />
    </>
  );
}
