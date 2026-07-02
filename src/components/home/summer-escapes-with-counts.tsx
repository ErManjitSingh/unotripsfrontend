import { unstable_cache } from "next/cache";
import { getPackages } from "@/lib/cms-api";
import { filterTourPackagesByDestinationSlug } from "@/lib/package-destination-filter";
import { SUMMER_ESCAPE_CARDS } from "@/lib/summer-escapes-cards";
import { SummerEscapesSection } from "@/components/home/summer-escapes-section";

const getCachedPackages = unstable_cache(
  () => getPackages(),
  ["summer-escapes-packages"],
  { revalidate: 300 },
);

export async function SummerEscapesWithCounts({ className }: { className?: string }) {
  const packages = await getCachedPackages();
  const packageCountsBySlug: Record<string, number> = {};
  for (const card of SUMMER_ESCAPE_CARDS) {
    packageCountsBySlug[card.slug] = filterTourPackagesByDestinationSlug(
      packages,
      card.slug,
    ).length;
  }
  return (
    <SummerEscapesSection
      className={className}
      packageCountsBySlug={packageCountsBySlug}
    />
  );
}
