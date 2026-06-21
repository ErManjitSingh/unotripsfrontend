import { HotelsPopularHotelsPreview } from "@/components/hotels/hotels-popular-hotels-preview";
import { fetchFeaturedHotels } from "@/lib/hotels-api";

type HotelsPopularHotelsSectionProps = {
  viewMoreHref: string;
};

export async function HotelsPopularHotelsSection({ viewMoreHref }: HotelsPopularHotelsSectionProps) {
  const hotels = await fetchFeaturedHotels();

  if (!hotels.length) {
    return (
      <section className="py-12 sm:py-16" id="popular-hotels">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">No popular hotels right now</p>
            <p className="mt-2 text-sm text-slate-500">Please check back soon or try another destination.</p>
          </div>
        </div>
      </section>
    );
  }

  return <HotelsPopularHotelsPreview hotels={hotels} viewMoreHref={viewMoreHref} />;
}