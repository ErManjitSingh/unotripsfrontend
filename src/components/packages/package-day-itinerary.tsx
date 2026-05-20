"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Bus,
  Building2,
  Car,
  Clock,
  MapPin,
  Star,
  Utensils,
  Footprints,
} from "lucide-react";
import type {
  PackageDemoItinerary,
  PackageItineraryActivity,
  PackageItineraryDayPlan,
} from "@/lib/package-demo-itinerary";
import { cn } from "@/lib/utils";

type ItineraryTab = "itinerary" | "policies" | "summary";

const KIND_ICON = {
  transfer: Car,
  sightseeing: Footprints,
  hotel: Building2,
  meal: Utensils,
} as const;

function ActivityIcon({ kind }: { kind: PackageItineraryActivity["kind"] }) {
  const Icon = KIND_ICON[kind];
  return <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />;
}

function ActivityCard({ activity }: { activity: PackageItineraryActivity }) {
  const label = activity.label ?? activity.kind.toUpperCase();

  return (
    <article className="overflow-hidden rounded-lg border border-[#e8e8e8] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#424242]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1976D2]">
            <ActivityIcon kind={activity.kind} />
          </span>
          <span>{label}</span>
          {activity.subtitle ? (
            <span className="hidden font-normal normal-case text-[#757575] sm:inline">
              · {activity.subtitle}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:p-4">
        <div className="relative h-[88px] w-full shrink-0 overflow-hidden rounded-md bg-slate-100 sm:h-[72px] sm:w-[108px]">
          <Image
            src={activity.image}
            alt=""
            fill
            className="object-cover"
            sizes="108px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[#212121] sm:text-[15px]">{activity.title}</h4>
          {activity.subtitle && activity.kind !== "transfer" ? (
            <p className="mt-0.5 text-xs text-[#757575]">{activity.subtitle}</p>
          ) : null}

          {activity.kind === "hotel" && activity.hotelStars ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: activity.hotelStars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-[#FFC107] text-[#FFC107]"
                    aria-hidden
                  />
                ))}
              </span>
              {activity.hotelScore ? (
                <span className="rounded bg-[#2E7D32] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {activity.hotelScore.toFixed(1)} {activity.hotelScoreLabel ?? "Excellent"}
                </span>
              ) : null}
            </div>
          ) : null}

          {activity.checkIn && activity.checkOut ? (
            <p className="mt-1.5 text-[11px] text-[#616161]">
              Check-in: <span className="font-semibold">{activity.checkIn}</span>
              {" · "}
              Check-out: <span className="font-semibold">{activity.checkOut}</span>
            </p>
          ) : null}

          {activity.meta?.length ? (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#616161]">
              {activity.meta.map((m) => (
                <li key={m} className="flex items-center gap-1">
                  {m.toLowerCase().includes("duration") ? (
                    <Clock className="h-3 w-3 text-[#9E9E9E]" aria-hidden />
                  ) : m.toLowerCase().includes("places") ? (
                    <MapPin className="h-3 w-3 text-[#9E9E9E]" aria-hidden />
                  ) : (
                    <Bus className="h-3 w-3 text-[#9E9E9E]" aria-hidden />
                  )}
                  {m}
                </li>
              ))}
            </ul>
          ) : null}

          {activity.placesCovered ? (
            <p className="mt-1 text-[11px] text-[#757575]">
              Places Covered: {activity.placesCovered}
            </p>
          ) : null}
        </div>
      </div>

      {activity.kind === "transfer" ? (
        <div className="border-t border-[#E3F2FD] bg-[#E3F2FD]/40 px-3 py-2 text-[11px] text-[#1565C0] sm:px-4">
          There are more ways to reach your destination —{" "}
          <button type="button" className="font-semibold underline">
            VIEW TRANSPORT OPTION(S)
          </button>
        </div>
      ) : null}
    </article>
  );
}

function DayDetailPanel({ day }: { day: PackageItineraryDayPlan }) {
  const included = [
    day.summary.hotels ? `${day.summary.hotels} Hotel` : null,
    day.summary.transfers ? `${day.summary.transfers} Transfer` : null,
    day.summary.activities ? `${day.summary.activities} Activities` : null,
    day.summary.meals ? `${day.summary.meals} Meal` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#D32F2F] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Day {day.day}
        </span>
        <span className="text-base font-bold text-[#212121] sm:text-lg">{day.location}</span>
        {included ? (
          <span className="w-full text-[11px] font-semibold uppercase tracking-wide text-[#757575] sm:w-auto sm:ml-auto">
            Included: {included}
          </span>
        ) : null}
      </div>

      <div className="space-y-3">
        {day.activities.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}

export type PackageDayItineraryProps = {
  plan: PackageDemoItinerary;
  className?: string;
};

export function PackageDayItinerary({ plan, className }: PackageDayItineraryProps) {
  const [tab, setTab] = useState<ItineraryTab>("itinerary");
  const [activeDay, setActiveDay] = useState(1);

  const currentDay = useMemo(
    () => plan.days.find((d) => d.day === activeDay) ?? plan.days[0],
    [plan.days, activeDay],
  );

  const statChips = [
    { id: "days", label: `${plan.totals.days} DAY PLAN`, active: tab === "itinerary" },
    { id: "transfers", label: `${plan.totals.transfers} TRANSFERS`, active: false },
    { id: "hotels", label: `${plan.totals.hotels} HOTELS`, active: false },
    { id: "activities", label: `${plan.totals.activities} ACTIVITIES`, active: false },
    { id: "meals", label: `${plan.totals.meals} MEALS`, active: false },
  ] as const;

  return (
    <section
      id="itinerary"
      className={cn(
        "scroll-mt-28 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex border-b border-[#e0e0e0]">
        {(
          [
            { id: "itinerary" as const, label: "ITINERARY" },
            { id: "policies" as const, label: "POLICIES" },
            { id: "summary" as const, label: "SUMMARY" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 border-b-2 px-3 py-3 text-center text-[11px] font-bold tracking-wide sm:text-xs",
              tab === t.id
                ? "border-[#1976D2] text-[#1976D2]"
                : "border-transparent text-[#757575] hover:text-[#424242]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "itinerary" ? (
        <>
          <div className="flex gap-1 overflow-x-auto border-b border-[#eeeeee] bg-[#fafafa] px-2 py-2 sm:px-4">
            {statChips.map((chip) => (
              <span
                key={chip.id}
                className={cn(
                  "shrink-0 rounded px-2.5 py-1.5 text-[10px] font-bold tracking-wide sm:text-[11px]",
                  chip.id === "days"
                    ? "bg-[#212121] text-white"
                    : "bg-white text-[#616161] ring-1 ring-[#e0e0e0]",
                )}
              >
                {chip.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row">
            <nav
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#eee] p-2 lg:w-[148px] lg:flex-col lg:border-b-0 lg:border-r lg:p-0"
              aria-label="Select day"
            >
              {plan.days.map((d) => {
                const selected = d.day === activeDay;
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    className={cn(
                      "flex min-w-[120px] items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs transition lg:min-w-0 lg:w-full lg:rounded-none lg:border-l-[3px] lg:px-4 lg:py-3",
                      selected
                        ? "bg-[#212121] font-semibold text-white lg:border-l-[#212121]"
                        : "bg-slate-50 text-[#616161] hover:bg-slate-100 lg:border-l-transparent lg:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        selected ? "bg-white" : "bg-[#BDBDBD]",
                      )}
                      aria-hidden
                    />
                    <span className="whitespace-nowrap">{d.dateLabel}</span>
                  </button>
                );
              })}
            </nav>

            <div className="min-w-0 flex-1 p-4 sm:p-5">
              {currentDay ? <DayDetailPanel day={currentDay} /> : null}
            </div>
          </div>
        </>
      ) : tab === "policies" ? (
        <div className="space-y-4 p-5 text-sm leading-relaxed text-[#616161]">
          <div>
            <h3 className="font-bold text-[#212121]">Cancellation policy</h3>
            <p className="mt-2">
              Free cancellation up to 15 days before departure. Between 15–7 days, 50% of
              package cost applies. Within 7 days, non-refundable components (flights/hotels) may
              apply as per supplier rules.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-[#212121]">Payment terms</h3>
            <p className="mt-2">
              Reserve with an initial deposit; balance due before travel documents are released.
              EMI options may be available on select cards at checkout.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <h3 className="text-sm font-bold text-[#212121]">Package summary</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <li className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs">
              <span className="font-bold text-[#1976D2]">{plan.totals.days}</span> days plan
            </li>
            <li className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs">
              <span className="font-bold text-[#1976D2]">{plan.totals.transfers}</span> transfers
            </li>
            <li className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs">
              <span className="font-bold text-[#1976D2]">{plan.totals.hotels}</span> hotel stays
            </li>
            <li className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs">
              <span className="font-bold text-[#1976D2]">{plan.totals.activities}</span>{" "}
              sightseeing blocks
            </li>
            <li className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs sm:col-span-2">
              <span className="font-bold text-[#1976D2]">{plan.totals.meals}</span> meals included
              across the trip
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-[#9E9E9E]">
            Demo itinerary for preview — connect your CMS/API for live day-wise inventory.
          </p>
        </div>
      )}
    </section>
  );
}
