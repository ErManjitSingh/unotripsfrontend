/**
 * src/app/activities/[slug]/page.tsx
 * Individual activity detail page — /activities/bungee-jumping-rishikesh etc.
 * Server component — no "use client"
 */
import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import { HeroGlassNavbar }     from "@/components/home/hero-glass-navbar";
import { Footer }              from "@/components/layout/Footer";
import { ActivityDetailClient } from "@/components/activities/ActivityDetailClient";
import type { ActivityDetail } from "@/components/activities/ActivityDetailClient";
import { fetchActivitiesServer } from "@/lib/activities-api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

async function getActivity(slug: string): Promise<ActivityDetail | null> {
  const response = await fetchActivitiesServer({ page: 1, limit: 50 });
  const item = response.items.find((activity) => activity.slug === slug);
  if (!item) return null;

  return {
    slug: item.slug,
    name: item.name,
    short_description: item.short_description,
    featured_image: item.featured_image ?? "/images/hotels/hero-banner.webp",
    gallery: item.gallery_images?.length
      ? item.gallery_images
      : [item.featured_image ?? "/images/hotels/hero-banner.webp"],
    category: item.category ?? "Activities",
    destination_name: item.destination_name,
    location: item.location ?? item.destination_name ?? "India",
    tags: item.tags?.length ? item.tags : [item.category ?? "Experience"],
    duration: item.duration ?? "Flexible duration",
    difficulty_level: item.difficulty_level,
    age_limit: item.age_limit ?? "All ages",
    best_time: item.best_time ?? "Year round",
    starting_price: item.starting_price ?? 0,
    price_type: item.price_type,
    is_featured: item.is_featured,
    included: item.included ? [item.included] : [],
    excluded: item.excluded ? [item.excluded] : [],
    description: item.full_description ?? item.short_description ?? `Experience ${item.name} with UNO Trips.`,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivity(slug);
  if (!activity) return { title: "Activity Not Found" };
  return {
    title: `${activity.name} | UNO Trips`,
    description: activity.short_description ?? `Book ${activity.name} with UNO Trips.`,
  };
}

export default async function ActivityDetailPage({ params }: Props) {
  const { slug } = await params;
  const activity = await getActivity(slug);
  if (!activity) notFound();

  return (
    <>
      <HeroGlassNavbar activeId="activities" solid />
      <main>
        <ActivityDetailClient activity={activity} />
      </main>
      <Footer />
    </>
  );
}
