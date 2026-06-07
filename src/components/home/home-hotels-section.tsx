import { HandpickedHotelsSlider } from "@/components/home/handpicked-hotels-slider";
import { fetchAllHotels } from "@/lib/hotels-api";

export async function HomeHotelsSection() {
  const { hotels, total } = await fetchAllHotels(50);

  if (!hotels.length) {
    return (
      <section className="bg-white py-10">
        <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            No hotels available from the API right now.
          </p>
        </div>
      </section>
    );
  }

  return <HandpickedHotelsSlider hotels={hotels} total={total} />;
}
