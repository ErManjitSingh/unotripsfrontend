import type { Metadata } from "next";
import { getDestinationBySlug } from "@/lib/cms-api";
import { DestinationPageContent } from "./destination-page-content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestinationBySlug(slug);
  if (!d) return { title: "Destination" };
  return {
    title: `${d.name} tour packages`,
    description: `${d.name} — browse holiday packages, deals, and request a call back.`,
    openGraph: {
      title: `${d.name} Tour Packages`,
      description: `Explore ${d.name} with UNO Trips.`,
      images: [{ url: d.image }],
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  return <DestinationPageContent params={params} />;
}
