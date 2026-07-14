"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BedDouble, CalendarDays, Car, ChevronLeft, ChevronRight, Clock3,
  Headphones, Hotel, MapPin, Plane, ShieldCheck, Star, Ticket, CircleCheck,
  Users, UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TourPackage } from "@/lib/constants";
import { DatePickerPopover } from "@/components/hotels/hotel-date-range-picker";

type AnyRecord = Record<string, any>;

type Props = {
  tour: TourPackage;
  images: string[];
  roomsLabel: string;
  total: number;
  initialDate?: string | null;
  hotelGroups: AnyRecord[];
  cabOptions: AnyRecord[];
  selectedHotels: number[];
  selectedCab: number;
  onBook: () => void;
  onEnquire: () => void;
  onChangeHotel: (index: number) => void;
  onChangeRoom: (index: number) => void;
  onChangeCab: () => void;
};

const formatMoney = (amount: number) => new Intl.NumberFormat("en-IN").format(Math.round(amount || 0));
const itineraryTabs = [{ label: "Itinerary", Icon: CalendarDays }, { label: "Summary", Icon: BedDouble }, { label: "Transfers", Icon: Car }, { label: "Stay", Icon: Hotel }];

function travelDate(value?: string | null) {
  if (!value) return "Select date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Select date" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function todayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function GlacialStylePackageDetail({
  tour, images, roomsLabel, total, initialDate, hotelGroups, cabOptions,
  selectedHotels, selectedCab, onBook, onEnquire, onChangeHotel, onChangeRoom, onChangeCab,
}: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [selectedTravelDate, setSelectedTravelDate] = useState(initialDate ?? "");
  const [travellerCount, setTravellerCount] = useState(Number(roomsLabel.match(/(\d+)\s+Adult/i)?.[1] ?? 2));
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [topDateOpen, setTopDateOpen] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const itinerary = tour.itinerary ?? [];
  const heroImages = images.length ? images : [tour.image].filter(Boolean);
  const heroImage = heroImages[imageIndex] ?? tour.image;
  const nights = tour.durationNights || Math.max(1, itinerary.length - 1);
  const firstHotel = hotelGroups[0];
  const selectedHotel = firstHotel?.opts?.[selectedHotels[0] ?? 0];
  const cab = cabOptions[selectedCab];
  const perPerson = Math.max(0, Math.round(total / Math.max(1, travellerCount)));
  const travellerLabel = `${travellerCount} Adult${travellerCount === 1 ? "" : "s"}`;
  const notices = ["Lowest price today", "Limited seats available!", "🔥 12 booked today"];

  useEffect(() => {
    const timer = window.setInterval(() => setNoticeIndex((index) => (index + 1) % notices.length), 3200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!initialDate) setSelectedTravelDate((current) => current || todayDateValue());
  }, [initialDate]);

  const inclusions = useMemo(() => [
    { Icon: BedDouble, text: `${nights} Nights`, sub: "Hotel accommodation" },
    { Icon: Hotel, text: "Handpicked stays", sub: "Comfortable rooms" },
    { Icon: UtensilsCrossed, text: "Meals included", sub: "Breakfast & dinner" },
    { Icon: Car, text: cab?.name ?? "Private vehicle", sub: "Transfers & sightseeing" },
  ], [cab?.name, nights]);

  const selectImage = (next: number) => setImageIndex((next + heroImages.length) % heroImages.length);

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-16 pt-[56px] text-[#172033] sm:pt-[64px] lg:pt-[72px]">
      <section className="sticky top-0 z-30 mt-3 hidden px-4 py-0 sm:block sm:mt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[74px] w-full max-w-[1320px] flex-wrap items-center gap-2 rounded-2xl border-2 border-primary bg-white px-4 py-2 shadow-[0_12px_26px_-20px_rgba(194,65,12,.48)] sm:px-5 xl:flex-nowrap">
          <div className="grid min-w-[390px] grid-cols-2 overflow-visible rounded-md border border-orange-100 bg-orange-50/60 text-slate-800">
            <div className="px-4 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wide text-primary/70">Starts from</p><p className="mt-0.5 text-base font-bold">New Delhi</p></div>
            <div className="relative z-[300] border-l border-orange-100"><button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setTopDateOpen(true); }} className="block w-full cursor-pointer px-4 py-2.5 text-left"><span className="block text-[10px] font-bold uppercase tracking-wide text-primary/70">Travelling on</span><span className="mt-0.5 block text-base font-bold">{travelDate(selectedTravelDate)}</span></button>{topDateOpen && <DatePickerPopover checkIn={selectedTravelDate} checkOut="" onChange={(checkIn) => { setSelectedTravelDate(checkIn); setTopDateOpen(false); }} onApply={() => setTopDateOpen(false)} onClose={() => setTopDateOpen(false)} compact />}</div>
          </div>
          <div className="relative min-w-[210px]">
            <button type="button" onClick={() => setTravellersOpen((open) => !open)} className="w-full rounded-md border border-orange-100 bg-orange-50/60 px-4 py-2.5 text-left text-slate-800"><p className="text-[10px] font-bold uppercase tracking-wide text-primary/70">No. of travellers</p><p className="mt-0.5 text-base font-bold">{travellerLabel}</p></button>
            {travellersOpen && <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><div className="flex items-center justify-between gap-5"><div><p className="text-sm font-bold text-slate-800">Adults</p><p className="text-xs text-slate-500">Age 12+</p></div><div className="flex items-center gap-3"><button type="button" aria-label="Remove adult" onClick={() => setTravellerCount((count) => Math.max(1, count - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 text-lg">−</button><span className="w-5 text-center font-bold">{travellerCount}</span><button type="button" aria-label="Add adult" onClick={() => setTravellerCount((count) => Math.min(12, count + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-primary text-lg text-primary">+</button></div></div><button type="button" onClick={() => setTravellersOpen(false)} className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-bold text-white">Done</button></div>}
          </div>
          <div className="min-w-[180px] px-2 text-slate-800"><p className="text-[10px] font-bold uppercase tracking-wide text-primary/70">Price</p><p className="mt-0.5 text-base font-bold">₹{formatMoney(perPerson)} <span className="text-xs font-medium text-slate-500">per person</span></p></div>
          <div className="ml-auto flex gap-2"><button type="button" onClick={onEnquire} className="rounded-md border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary">Enquire Now</button><button type="button" onClick={onBook} className="rounded-md bg-primary px-7 py-2.5 text-sm font-bold text-white shadow-sm">Book Now</button></div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-0 sm:py-5">
        <nav className="hidden" aria-hidden="true"><Link href="/" tabIndex={-1}>Home</Link></nav>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5 pb-3 sm:p-5 sm:pb-3">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-primary px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">{tour.packageType?.replace(/_/g, " ") || "Domestic tour"}</span><span className="rounded bg-orange-50 px-2.5 py-1 text-xs font-bold text-primary">{nights}N/{tour.durationDays}D</span><span className="text-sm font-medium text-slate-500">Curated holiday package</span></div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-[#162034] sm:text-[1.95rem]">{tour.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-2 font-semibold text-slate-700"><MapPin className="h-4 w-4 text-primary" />{tour.location || "Himachal Pradesh, India"}</span>
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{roomsLabel}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{tour.rating.toFixed(1)} <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" /></span>
                  {tour.reviewCount > 0 && <span className="font-semibold">{tour.reviewCount} reviews</span>}
                </div>
              </div>
              <div className="relative aspect-[2.75/1] overflow-hidden bg-slate-200">
                {heroImage && <Image src={heroImage} alt={tour.title} fill priority className="object-cover" sizes="(min-width: 1280px) 1200px, 100vw" />}
                <button type="button" className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm"><Ticket className="mr-1.5 inline h-3.5 w-3.5" />View Gallery</button>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/15 to-transparent p-4 text-white"><span className="flex max-w-[80%] items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-[11px] font-semibold"><MapPin className="h-4 w-4" />{tour.location || "Himachal Pradesh, India"}</span><span className="rounded bg-black/55 px-3 py-2 text-[11px] font-bold">{imageIndex + 1} / {heroImages.length}</span></div>
                {heroImages.length > 1 && <><button aria-label="Previous image" onClick={() => selectImage(imageIndex - 1)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"><ChevronLeft /></button><button aria-label="Next image" onClick={() => selectImage(imageIndex + 1)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"><ChevronRight /></button></>}
              </div>
            </section>

            <section className="grid gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              {inclusions.map(({ Icon, text, sub }) => <div key={text} className="flex items-center gap-3 border-slate-100 lg:border-r lg:last:border-0"><Icon className="h-6 w-6 text-primary" /><div><p className="text-sm font-bold">{text}</p><p className="text-[11px] text-slate-500">{sub}</p></div></div>)}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-extrabold"><span className="mr-2 text-primary">✦</span>Package Highlights</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{heroImages.slice(0, 6).map((src, index) => <div key={`${src}-highlight-${index}`} className="min-w-0"><div className="relative aspect-[1.45/1] overflow-hidden rounded-md bg-slate-100"><Image src={src} alt="" fill className="object-cover" sizes="160px" /></div><p className="mt-1.5 truncate text-center text-[10px] font-semibold text-slate-600">{["Scenic mountains", "Pine forests", "Beautiful waterfalls", "Local culture", "Peaceful landscapes", "Adventure activities"][index]}</p></div>)}</div>
            </section>

            <section id="itinerary" className="overflow-hidden rounded-[24px] bg-white shadow-[0_18px_55px_rgba(16,24,40,0.07)]">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">The journey</p><h2 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-[#172033] sm:text-[26px]">Every day, beautifully planned</h2><p className="mt-1.5 max-w-xl text-sm text-slate-500">A considered route with comfortable stays, private transfers and memorable experiences.</p></div><div className="rounded-2xl bg-[#FFF8F2] px-4 py-3 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#98A2B3]">Your escape</p><p className="mt-1 text-sm font-extrabold text-[#172033]">{itinerary.length} days <span className="mx-1 text-[#FFB27A]">·</span> curated</p></div></div><div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-[#F8FAFC] p-1" aria-label="Itinerary sections">{itineraryTabs.map(({ label, Icon }, index) => <button key={label} type="button" className={cn("flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition", index === 0 ? "bg-white text-primary shadow-[0_2px_8px_rgba(16,24,40,0.08)]" : "text-slate-500 hover:bg-white hover:text-slate-700")}><Icon className="h-4 w-4" />{label}</button>)}</div></div>

              <div className="px-5 py-6 sm:px-7 sm:py-8"><div className="space-y-8">{itinerary.map((item, index) => <article key={item.day} className="relative pl-8 sm:pl-10"><div className="absolute bottom-[-32px] left-[10px] top-8 w-px bg-gradient-to-b from-[#FF6B00] via-slate-200 to-transparent sm:left-[13px]" /><div className="absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full bg-primary shadow-[0_0_0_5px_#FFF3EB] sm:h-7 sm:w-7"><span className="text-[10px] font-extrabold text-white">{String(index + 1).padStart(2, "0")}</span></div><header className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Day {item.day}</span><span className="h-1 w-1 rounded-full bg-[#FFB27A]" /><span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">On the itinerary</span></div><h3 className="mt-2 max-w-2xl text-lg font-extrabold leading-snug tracking-[-0.015em] text-[#172033] sm:text-xl">{item.title}</h3></div>{initialDate && <div className="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">{travelDate(initialDate)}</div>}<div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-slate-500 shadow-sm"><Car className="h-4 w-4 text-[#344054]" /><div><p className="text-xs font-bold text-[#344054]">~ 7–8 hrs</p><p className="text-[10px]">Total drive</p></div></div></header><div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"><div className="flex min-w-0 items-center gap-4 rounded-2xl bg-[#F8FAFC] p-3"><div className="relative h-16 w-44 shrink-0 overflow-hidden rounded-xl bg-white text-primary shadow-sm"><Image src={cab?.img ?? "/images/cabs/sedan-generated.png"} alt={cab?.name ?? "Sedan"} fill className="object-cover" sizes="176px" /></div><div className="min-w-0"><p className="text-sm font-bold text-[#172033]">{cab?.name ?? "Private transfer"}</p><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span>4 seater</span><span>3 luggage</span><span className="text-emerald-600">Private transfer</span></div></div></div>{index === 0 && <button type="button" onClick={onChangeCab} className="self-center rounded-xl px-3 py-2 text-xs font-bold text-primary transition hover:bg-orange-50">Change vehicle <span aria-hidden="true" className="ml-1">↗</span></button>}</div><div className="mt-4 max-w-4xl"><p className={cn("whitespace-pre-line text-sm leading-6 text-slate-500", item.body.length > 420 && !expandedDays[item.day] && "line-clamp-3")}>{item.body}</p>{item.body.length > 420 && <button type="button" onClick={() => setExpandedDays((current) => ({ ...current, [item.day]: !current[item.day] }))} className="mt-2 text-xs font-bold text-primary transition hover:text-[#D94F00]">{expandedDays[item.day] ? "Show less" : "Read more"} <span aria-hidden="true">→</span></button>}</div>{selectedHotel && <div className="mt-5 overflow-hidden rounded-2xl border border-[#F2F4F7] bg-gradient-to-br from-[#FFFDFC] to-[#FFF8F2]"><div className="flex min-h-[132px]"><div className="relative w-32 shrink-0 sm:w-40"><Image src={selectedHotel.img ?? heroImage} alt={selectedHotel.name ?? "Hotel"} fill className="object-cover" sizes="160px" /></div><div className="min-w-0 flex-1 p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{index === 0 ? "Your first stay" : "Your stay"}</p><h4 className="mt-1 text-base font-extrabold text-[#172033]">{selectedHotel.name}</h4><div className="mt-2 flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < (selectedHotel.stars ?? 3) ? "fill-amber-400 text-amber-400" : "text-slate-200")} />)}</div><span className="mt-1 text-[11px] font-medium text-slate-500">(128 reviews)</span></div><button type="button" onClick={() => onChangeHotel(0)} className="shrink-0 text-xs font-bold text-primary">Change hotel <span aria-hidden="true">↗</span></button></div><div className="mt-3 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2F4F7] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"><UtensilsCrossed className="h-3.5 w-3.5 text-slate-500" />Breakfast & Dinner</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2F4F7] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"><BedDouble className="h-3.5 w-3.5 text-slate-500" />Deluxe Room</span></div><button type="button" onClick={() => onChangeRoom(0)} className="mt-2 text-xs font-bold text-primary">Change room</button></div></div></div>}</article>)}</div></div>
       </section>
         </div>

          <aside className="w-full min-w-0 xl:sticky xl:top-[106px] xl:h-fit">
            <section className="overflow-hidden rounded-[12px] border border-[#D0D5DD] bg-white px-3 py-3 shadow-[0_10px_35px_rgba(16,24,40,.08)] sm:px-4 sm:py-4">
              <div className="flex h-9 items-center overflow-hidden rounded-[12px] bg-[#FFF4EC] px-3 text-[10px] font-semibold text-[#FF5A00] sm:text-[11px]"><span key={noticeIndex} className="flex items-center gap-2 animate-[notice-slide_500ms_ease-out]">{noticeIndex !== 2 && <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#FF6B00] text-sm font-bold text-white">ϟ</span>}<span>{notices[noticeIndex]}</span></span></div>
              <div className="relative mt-3 h-[140px] overflow-hidden rounded-[12px] border border-[#D0D5DD]">{heroImage && <Image src={heroImage} alt="" fill className="object-cover object-right" sizes="704px" />}<div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-[38%] to-transparent" /><div className="relative z-10 max-w-[52%] px-5 pt-4 xl:max-w-[88%]"><p className="text-sm font-semibold text-[#667085]">Starting from</p><p className="mt-1 whitespace-nowrap text-[3rem] font-extrabold leading-none tracking-[-.05em] text-[#FF5A00] xl:text-[2.45rem]">₹{formatMoney(perPerson)} <span className="text-base font-semibold tracking-normal text-[#667085]">/ person</span></p><div className="mt-2 inline-flex items-center gap-2 rounded-[12px] bg-[#FFF0E6] px-3 py-2 text-sm font-semibold text-[#344054]"><Users className="h-4 w-4 text-[#FF5A00]" />Twin room sharing</div></div></div>
              <div className="flex items-center gap-2 border-b border-[#F2F4F7] py-3"><div className="flex w-[42%] shrink-0 items-center gap-2"><CalendarDays className="h-7 w-7 shrink-0 text-[#FF5A00]" /><div className="min-w-0"><p className="whitespace-nowrap text-sm font-bold text-[#172033]">{tour.durationNights} Nights / {tour.durationDays} Days</p><p className="mt-1 whitespace-nowrap text-[10px] text-[#667085]">Starting from: <b className="text-[#344054]">New Delhi</b></p></div></div><div className="grid min-w-0 flex-1 grid-cols-4 text-center text-[10px] text-[#344054]"><span className="border-l border-[#F2F4F7]"><UtensilsCrossed className="mx-auto mb-1 h-4 w-4" />Meal</span><span className="border-l border-[#F2F4F7]"><Hotel className="mx-auto mb-1 h-4 w-4" />Hotel</span><span className="border-l border-[#F2F4F7]"><Car className="mx-auto mb-1 h-4 w-4" />Cab</span><span className="border-l border-[#F2F4F7]"><Ticket className="mx-auto mb-1 h-4 w-4" />Sightseeing</span></div></div>
              <div className="mt-3 rounded-2xl border border-[#E4E7EC] p-3"><h3 className="text-sm font-bold text-[#344054]">Customize your trip</h3><p className="mt-1 text-xs text-[#667085]">Change travel date & rooms as per your comfort</p><div className="mt-3 flex gap-3"><div className="relative min-w-0 flex-1"><button onClick={() => setDateOpen(true)} className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#E4E7EC] px-3 text-left text-xs text-[#667085]"><CalendarDays className="h-5 w-5 shrink-0 text-[#FF5A00]" /><span className="truncate whitespace-nowrap">{selectedTravelDate ? travelDate(selectedTravelDate) : "Select travel date"}</span><ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90" /></button>{dateOpen && <DatePickerPopover checkIn={selectedTravelDate} checkOut="" onChange={(checkIn) => { setSelectedTravelDate(checkIn); setDateOpen(false); }} onApply={() => setDateOpen(false)} onClose={() => setDateOpen(false)} compact placement="top" />}</div><button onClick={() => setDateOpen(true)} className="h-10 rounded-xl border border-[#E4E7EC] px-5 text-sm font-bold text-[#FF5A00]">Modify</button></div><div className="mt-3 flex items-center justify-between rounded-xl bg-[#FFF4EC] px-4 py-1.5 text-sm font-bold text-[#FF5A00]">Book with just ₹{formatMoney(Math.max(5000, Math.round(total * 0.15)))} <span className="text-xl">›</span></div></div>
              <div className="mt-5 grid grid-cols-2 gap-4"><button onClick={onEnquire} className="h-14 rounded-xl border border-[#FF5A00] bg-white text-base font-bold text-[#FF5A00] transition hover:bg-[#FFF4EC]">Enquire Now</button><button onClick={onBook} className="h-14 rounded-xl bg-gradient-to-r from-[#FF7A18] to-[#FF5A00] text-base font-bold text-white shadow-[0_10px_22px_rgba(255,107,0,.2)] transition hover:-translate-y-0.5">Book Now</button></div>
              <div className="mt-3 grid grid-cols-3 gap-2"><div className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBF8] px-1.5 py-2 text-[9px] whitespace-nowrap text-[#344054]"><ShieldCheck className="h-5 w-5 shrink-0 text-[#FF5A00]" /><span>Best Price</span></div><div className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBF8] px-1.5 py-2 text-[9px] whitespace-nowrap text-[#344054]"><Headphones className="h-5 w-5 shrink-0 text-[#FF5A00]" /><span>24×7 Support</span></div><div className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBF8] px-1.5 py-2 text-[9px] whitespace-nowrap text-[#344054]"><CircleCheck className="h-5 w-5 shrink-0 text-[#FF5A00]" /><span>Secure Payments</span></div></div><p className="mt-4 text-center text-xs text-[#667085]"><ShieldCheck className="mr-2 inline h-4 w-4" />Secure your slot with minimal booking amount</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
