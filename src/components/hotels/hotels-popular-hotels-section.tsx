import { HotelsPopularHotelsPreview } from "@/components/hotels/hotels-popular-hotels-preview";
import { fetchAllHotels, fetchFeaturedHotels } from "@/lib/hotels-api";
import type { HotelListing } from "@/lib/hotels-catalog";

type HotelsPopularHotelsSectionProps = {
  viewMoreHref: string;
  hotels?: HotelListing[];
};

export async function HotelsPopularHotelsSection({ viewMoreHref, hotels: hotelsProp }: HotelsPopularHotelsSectionProps) {
  const featuredHotels = hotelsProp ?? (await fetchFeaturedHotels());
  const hotels =
    featuredHotels.length >= 8
      ? featuredHotels
      : await fetchAllHotels(12).then(({ hotels: allHotels }) => {
          const map = new Map<string, HotelListing>();
          for (const hotel of [...featuredHotels, ...allHotels]) {
            map.set(hotel.id, hotel);
          }
          return Array.from(map.values());
        });

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
