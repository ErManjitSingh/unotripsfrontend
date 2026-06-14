/**
 * src/app/activities/[slug]/page.tsx
 * Individual activity detail page — /activities/bungee-jumping-rishikesh etc.
 * Server component — no "use client"
 */
import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import { Navbar }              from "@/components/layout/Navbar";
import { Footer }              from "@/components/layout/Footer";
import { ActivityDetailClient } from "@/components/activities/ActivityDetailClient";
import { HARDCODED_ACTIVITIES } from "@/components/activities/ActivitiesClient";

type Props = { params: Promise<{ slug: string }> };

// Generate static pages for all 5 activities at build time
export async function generateStaticParams() {
  return HARDCODED_ACTIVITIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = HARDCODED_ACTIVITIES.find((a) => a.slug === slug);
  if (!activity) return { title: "Activity Not Found" };
  return {
    title: `${activity.name} | UNO Trips`,
    description: activity.short_description ?? `Book ${activity.name} with UNO Trips.`,
  };
}

export default async function ActivityDetailPage({ params }: Props) {
  const { slug } = await params;
  const activity = HARDCODED_ACTIVITIES.find((a) => a.slug === slug);
  if (!activity) notFound();

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="activities" />
      <main>
        <ActivityDetailClient activity={activity} />
      </main>
      <Footer />
    </>
  );
}