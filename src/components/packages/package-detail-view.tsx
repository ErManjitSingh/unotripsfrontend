import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import {
  Building2,
  Bus,
  Camera,
  Check,
  ChevronRight,
  Globe2,
  Info,
  MapPin,
  Plane,
  Shield,
  Star,
  Utensils,
  Users,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  QuickEnquiryProvider,
  QuickEnquiryTrigger,
  WhatsAppEnquiryLink,
} from "@/components/enquiry/quick-enquiry";
import { PackageDayItinerary } from "@/components/packages/package-day-itinerary";
import { PackageDetailEnquirySidebar } from "@/components/packages/package-detail-enquiry-sidebar";
import { PackageDetailHeroGallery } from "@/components/packages/package-detail-hero-gallery";
import { buildDemoPackageItinerary } from "@/lib/package-demo-itinerary";
import type { TourPackage } from "@/lib/constants";
import { SITE, TESTIMONIALS } from "@/lib/constants";
import { packageDetailHref } from "@/lib/packages";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";
import { siteTelHref } from "@/lib/site-contact";
import { cn, formatInrAmount } from "@/lib/utils";

const INCLUDE_ITEMS = [
  { label: "Hotel", icon: Building2 },
  { label: "Meals", icon: Utensils },
  { label: "Flight", icon: Plane },
  { label: "Sightseeing", icon: Camera },
  { label: "Transport", icon: Bus },
  { label: "Visa", icon: Shield },
] as const;

/** Veena-style first row: six icons only (no separate “tour manager” tile). */
const INCLUDE_ITEMS_HERO = INCLUDE_ITEMS.slice(0, 6);

function highlightsFromDescription(desc?: string): string[] {
  if (!desc?.trim()) {
    return [
      "Hand-picked hotels and smooth transfers",
      "Guided sightseeing with local insights",
      "Transparent inclusions before you pay",
      "24×7 support during your holiday",
    ];
  }
  const parts = desc
    .split(/[.;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 14 && s.length < 220);
  return parts.length
    ? parts.slice(0, 10)
    : highlightsFromDescription(undefined);
}

function searchHintFromTitle(title: string): string {
  const w = title.trim().split(/\s+/).filter(Boolean);
  if (w.length >= 2) return `${w[0]} ${w[1]}`.slice(0, 32);
  return w[0]?.slice(0, 24) || "packages";
}

function buildGalleryImages(
  tour: TourPackage,
  similar: TourPackage[],
): string[] {
  const raw = [tour.image, ...similar.map((s) => s.image)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of raw) {
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  while (out.length < 4) out.push(tour.image);
  return out.slice(0, 12);
}

function guestPhotoCount(tour: TourPackage): number {
  let s = 0;
  for (let i = 0; i < tour.id.length; i++) s += tour.id.charCodeAt(i);
  return 120 + (s % 140);
}

function joiningFromPrice(price: number): number {
  return Math.max(0, Math.round(price * 0.76));
}

function itineraryRouteLine(tour: TourPackage) {
  const raw = (tour.location ?? "")
    .split(/[,|·]/)
    .map((x) => x.trim())
    .filter(Boolean);
  const chunks = raw.length ? raw.slice(0, 6) : ["Destination"];
  const totalN = Math.max(
    1,
    tour.durationNights || Math.max(0, tour.durationDays - 1),
  );
  const per = Math.max(1, Math.round(totalN / chunks.length));
  return chunks.map((c, i) => (
    <Fragment key={`${c}-${i}`}>
      {i > 0 ? (
        <span
          className="mx-1 inline-flex items-center gap-0.5 text-slate-400"
          aria-hidden
        >
          <span>→</span>
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1">
        <Globe2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <span className="font-medium text-slate-800">{c}</span>
        <span className="text-slate-500">({per}N)</span>
      </span>
    </Fragment>
  ));
}

export type PackageDetailViewProps = {
  tour: TourPackage;
  similar: TourPackage[];
};

export function PackageDetailView({ tour, similar }: PackageDetailViewProps) {
  const slug = tour.slug ?? tour.id;
  const countries = tour.countries ?? 1;
  const cities =
    tour.cities ?? Math.max(1, Math.min(6, tour.durationDays || 3));
  const fullStars = Math.min(5, Math.round(tour.rating));
  const highlights = highlightsFromDescription(tour.description);
  const demoItineraryPlan = buildDemoPackageItinerary(tour);
  const code = slug.slice(0, 8).toUpperCase();
  const tourCode =
    slug
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 4)
      .toUpperCase() || "PKG";
  const galleryImages = buildGalleryImages(tour, similar);
  const joiningPrice = joiningFromPrice(tour.priceINR);
  const extraPhotos = guestPhotoCount(tour);

  const heroTestimonials = TESTIMONIALS.map((m) => ({
    quote: m.text,
    name: m.name,
    metaLine: `${m.location} · Tour Manager on request`,
  }));

  const highlightBullets = highlights.slice(0, 5);

  return (
    <>
      <Navbar variant="ease" easeActiveNavId="holidays" />
      <QuickEnquiryProvider>
        <div className="min-h-screen bg-[#f4f6f8]">
          <div
            className={cn(
              "mx-auto w-full max-w-[1200px] pb-12",
              PAGE_MARGIN_X_CLASS,
            )}
          >
            {/* Breadcrumb — Veena-style chevrons */}
            <nav
              className="flex flex-wrap items-center gap-1 border-b border-[#e0e0e0] bg-white px-1 py-3 text-[11px] text-slate-600 sm:px-0 sm:text-xs"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <ChevronRight
                className="h-3 w-3 shrink-0 text-slate-300"
                aria-hidden
              />
              <Link href="/packages" className="hover:text-primary">
                Packages
              </Link>
              <ChevronRight
                className="h-3 w-3 shrink-0 text-slate-300"
                aria-hidden
              />
              <span className="line-clamp-2 font-medium text-slate-900">
                {tour.title}
              </span>
            </nav>

            {/* Title & meta — above gallery slider */}
            <section className="border-b border-[#e0e0e0] bg-white px-1 py-4 sm:px-0 sm:py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-orange-500 bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    {tour.packageType ?? "Group tour"}
                  </span>
                  <span className="rounded border border-orange-500 bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    {tourCode}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                    <Check
                      className="h-3 w-3 shrink-0 text-emerald-600"
                      strokeWidth={3}
                      aria-hidden
                    />
                    Experience
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                    <Check
                      className="h-3 w-3 shrink-0 text-emerald-600"
                      strokeWidth={3}
                      aria-hidden
                    />
                    Culture
                  </span>
                </div>

                <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-[1.95rem]">
                  {tour.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                    {tour.durationDays} Days
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                    {countries} {countries === 1 ? "Country" : "Countries"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                    {cities} {cities === 1 ? "City" : "Cities"}
                    <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
                  {itineraryRouteLine(tour)}
                </div>

                <Link
                  href="#itinerary"
                  className="mt-2 inline-flex items-center gap-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View day-wise tour itinerary
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>

                {tour.location ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
                    <MapPin
                      className="h-3.5 w-3.5 shrink-0 text-primary"
                      aria-hidden
                    />
                    {tour.location}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-800">
                  <span
                    className="flex items-center gap-0.5 text-amber-500"
                    aria-hidden
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]",
                          i < fullStars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200",
                        )}
                      />
                    ))}
                  </span>
                  <span className="text-slate-300" aria-hidden>
                    |
                  </span>
                  <span className="font-semibold">
                    {formatInrAmount(tour.reviewCount)} Reviews
                  </span>
                </div>
              </div>
            </section>

            {/* Hero: main gallery (left) + enquiry form (right) */}
            <section className="border-b border-[#e0e0e0] bg-white px-1 pb-5 pt-4 sm:px-0 sm:pb-6 sm:pt-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-stretch lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-h-0 min-w-0 lg:h-full">
                  <PackageDetailHeroGallery
                    tourTitle={tour.title}
                    images={galleryImages}
                    testimonials={heroTestimonials}
                    guestPhotoExtraCount={extraPhotos}
                  />
                </div>

                <aside className="flex min-h-0 w-full min-w-0 flex-col lg:h-full">
                  <PackageDetailEnquirySidebar
                    tourTitle={tour.title}
                    tourSku={code}
                    className="flex-1"
                  />
                </aside>
              </div>
            </section>

            {/* Tour includes / highlights */}
            <section className="border-b border-[#e0e0e0] bg-white">
              <div className="px-1 py-6 sm:px-0 sm:py-8">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                  <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        Tour includes
                      </h2>
                      <ul className="mt-5 flex flex-wrap justify-between gap-3 sm:gap-4">
                        {INCLUDE_ITEMS_HERO.map(({ label, icon: Icon }) => (
                          <li
                            key={label}
                            className="flex w-[30%] max-w-[5.5rem] flex-col items-center gap-2 text-center sm:w-[14%] sm:max-w-none"
                          >
                            <Icon
                              className="h-7 w-7 text-slate-700"
                              strokeWidth={1.25}
                              aria-hidden
                            />
                            <span className="text-[10px] font-semibold leading-tight text-slate-800 sm:text-[11px]">
                              {label}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users
                            className="h-6 w-6"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                          Tour includes the services of {SITE.name}&apos;s tour
                          manager on applicable departures — professional
                          coordination, clear briefings, and on-ground support.
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                      <h2 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        Tour highlights
                      </h2>
                      <ul className="mt-4 space-y-2">
                        {highlightBullets.map((h, idx) => (
                          <li
                            key={idx}
                            className="flex gap-2 text-sm text-slate-700"
                          >
                            <span
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-800"
                              aria-hidden
                            />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="#itinerary"
                        className="mt-6 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        View more
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dates strip */}
            <section
              id="dates-prices"
              className="mt-6 scroll-mt-28 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-6"
            >
              <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
                Select departure &amp; guests
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                As seats fill, fares may change — lock early for the best value.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="min-w-[140px] flex-1 rounded-lg border-2 border-primary bg-primary/5 p-3 text-center sm:min-w-[160px]">
                  <p className="text-[10px] font-bold uppercase text-primary">
                    Sample date
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900">
                    ₹{formatInrAmount(tour.priceINR)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Twin share · indicative
                  </p>
                </div>
                <div className="min-w-[140px] flex-1 rounded-lg border border-[#e0e0e0] bg-slate-50/80 p-3 text-center sm:min-w-[160px]">
                  <p className="text-[10px] font-bold uppercase text-slate-500">
                    Joining / leaving
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-slate-900">
                    ₹{formatInrAmount(joiningPrice)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Own flights option
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start xl:gap-10">
              <div className="min-w-0 space-y-8">
                <PackageDayItinerary plan={demoItineraryPlan} />

                <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Tour information
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-md border border-[#e0e0e0] bg-slate-50/50 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                        Inclusions
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        Accommodation, selected meals, sightseeing transport,
                        and assistance from our travel desk as per your
                        confirmed itinerary.
                      </p>
                    </div>
                    <div className="rounded-md border border-[#e0e0e0] bg-slate-50/50 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                        Exclusions
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        Personal expenses, travel insurance unless added, visa
                        fees where applicable, and anything not explicitly
                        listed on your voucher.
                      </p>
                    </div>
                    <div className="rounded-md border border-[#e0e0e0] bg-slate-50/50 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                        Advance prep
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        Valid ID, comfortable walking shoes, adapters for
                        chargers, and any prescribed medication. Our team shares
                        a detailed checklist after booking.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Need to know
                  </h2>
                  <div className="mt-4 space-y-4 text-sm text-slate-600">
                    <div>
                      <h3 className="font-semibold text-slate-900">Weather</h3>
                      <p className="mt-1 text-xs leading-relaxed sm:text-sm">
                        Pack layers; mountain/coastal stretches can be cooler in
                        the evenings even when days are warm.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Transport
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed sm:text-sm">
                        Inter-city segments use comfortable coaches or trains as
                        per route; short walks are part of city tours.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Documents
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed sm:text-sm">
                        Government-issued photo ID for domestic sectors;
                        passport validity 6+ months for international legs.
                        Carry soft copies in your phone.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-5 sm:p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Cancellation policy &amp; payment terms
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
                    Policies vary by airline, hotel, and season. Your quote
                    includes refundable vs non-refundable components before you
                    confirm. GST / TCS as per current government notifications.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-slate-800">
                    Tour price: ₹{formatInrAmount(tour.priceINR)} / person on
                    twin sharing (indicative).
                  </p>
                </section>

                {similar.length > 0 ? (
                  <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      You may also like
                    </h2>
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                      {similar.slice(0, 4).map((p) => (
                        <li key={p.id}>
                          <Link
                            href={packageDetailHref(p)}
                            className="group flex gap-3 rounded-lg border border-[#e0e0e0] p-3 transition hover:border-primary/40 hover:shadow-md"
                          >
                            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                                {p.title}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {p.durationDays}D · from ₹
                                {formatInrAmount(p.priceINR)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/packages"
                      className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                    >
                      View all packages
                    </Link>
                  </section>
                ) : null}
              </div>

              <aside className="hidden space-y-4 lg:block lg:sticky lg:top-28">
                <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                  <p className="text-center text-xs font-bold text-slate-900">
                    Looking for assistance?
                  </p>
                  <a
                    href={siteTelHref()}
                    className="mt-2 block text-center text-sm font-semibold text-primary"
                  >
                    {SITE.phone}
                  </a>
                  <p className="mt-1 text-center text-[11px] text-slate-500">
                    <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                      {SITE.email}
                    </a>
                  </p>
                  <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
                    <span className="font-semibold text-slate-700">Address:</span> {SITE.address}
                  </p>
                  <WhatsAppEnquiryLink
                    tourTitle={tour.title}
                    tourSku={code}
                    label="Enquire on WhatsApp"
                    variant="button"
                    className="mt-3"
                  />
                  <QuickEnquiryTrigger
                    tourTitle={tour.title}
                    tourSku={code}
                    label="Open enquiry form"
                    variant="link"
                    icon={false}
                    className="mt-2 w-full justify-center text-[11px]"
                  />
                </div>
              </aside>
            </div>

            <p className="mt-10 text-center text-[11px] text-slate-500 sm:text-xs">
              Itinerary is indicative for planning — final schedule may vary slightly at confirmation.{" "}
              {SITE.name}
            </p>
          </div>
        </div>
      </QuickEnquiryProvider>
      <Footer />
    </>
  );
}
