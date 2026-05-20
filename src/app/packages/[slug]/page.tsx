import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageDetailView } from "@/components/packages/package-detail-view";
import { getTourBySlug, getTourCatalog } from "@/lib/packages";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Package" };
  return {
    title: tour.title,
    description: tour.description?.slice(0, 155) || `${tour.title} — ${tour.durationDays} days tour package.`,
    openGraph: {
      title: tour.title,
      description: tour.description?.slice(0, 155),
      images: tour.image ? [{ url: tour.image }] : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const catalog = await getTourCatalog();
  const id = tour.slug ?? tour.id;
  const similar = catalog.filter((p) => (p.slug ?? p.id) !== id).slice(0, 8);

  return <PackageDetailView tour={tour} similar={similar} />;
}
