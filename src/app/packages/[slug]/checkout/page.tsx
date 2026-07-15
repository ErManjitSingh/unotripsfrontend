import { notFound } from "next/navigation";
import { PackageDetailView } from "@/components/packages/package-detail-view";
import { getPackageBySlug, getRelatedPackages } from "@/services/packages";
import { decodeRooms } from "@/lib/rooms-utils";
import { NEW_DATA_PREVIEW } from "@/lib/new-data-preview";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    rooms?: string;
    date?: string;
    cab?: string;
    hotels?: string;
    preview?: string;
  }>;
};

export default async function PackageCheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const tour = await getPackageBySlug(slug);
  if (!tour) notFound();

  const pageTour = query.preview === "new-data" && slug === "test-packages"
    ? { ...tour, priceINR: NEW_DATA_PREVIEW.base_price, oldPriceINR: undefined }
    : tour;
  const similar = await getRelatedPackages(tour, 1);
  const initialHotels = query.hotels
    ? query.hotels.split(",").map(Number).filter(Number.isFinite)
    : [];

  return (
    <PackageDetailView
      tour={pageTour}
      similar={similar}
      initialRooms={decodeRooms(query.rooms)}
      initialDate={query.date ?? null}
      initialCab={Math.max(0, Number(query.cab) || 0)}
      initialHotels={initialHotels}
      checkoutOnly
    />
  );
}
