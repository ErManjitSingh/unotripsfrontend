"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

function isoToLocal(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  let cur = start;
  while (!isAfter(cur, end)) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ── Single Month Calendar ──────────────────────────────────────────────────

function MonthGrid({
  month,
  today,
  checkInDate,
  checkOutDate,
  hoverDate,
  onDayClick,
  onDayHover,
  onDayLeave,
  compact = false,
}: {
  month: Date;
  today: Date;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  hoverDate: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date) => void;
  onDayLeave: () => void;
  compact?: boolean;
}) {
  const days = getCalendarDays(month);

  const effectiveEnd = checkOutDate || (hoverDate && checkInDate && isAfter(hoverDate, checkInDate) ? hoverDate : null);

  return (
    <div className="w-full">
      {/* Weekday row */}
      <div className="mb-1.5 grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-[9px] font-bold uppercase tracking-widest text-[#b0b0b0]">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, month);
          const isDisabled = isBefore(day, today) && !isSameDay(day, today);
          const isStart = checkInDate ? isSameDay(day, checkInDate) : false;
          const isEnd = checkOutDate ? isSameDay(day, checkOutDate) : false;
          const isHoverEnd = !checkOutDate && hoverDate && checkInDate && isAfter(hoverDate, checkInDate) ? isSameDay(day, hoverDate) : false;
          const isEndpoint = isStart || isEnd || isHoverEnd;

          const inRange =
            isCurrentMonth &&
            effectiveEnd &&
            checkInDate &&
            isAfter(day, checkInDate) &&
            isBefore(day, effectiveEnd);

          const showLeftHalf = (isEnd || isHoverEnd) && checkInDate && effectiveEnd;
          const showRightHalf = isStart && effectiveEnd;

          const dayIsToday = isSameDay(day, today);

          return (
            <div
              key={i}
              className={cn("relative flex items-center justify-center", compact ? "h-7" : "h-8")}
            >
              {/* Range background: left half (before endpoint circle) */}
              {showLeftHalf && isCurrentMonth && (
                <div className="pointer-events-none absolute inset-y-[6px] left-0 right-1/2 bg-[#fff3eb]" />
              )}
              {/* Range background: right half (after start circle) */}
              {showRightHalf && isCurrentMonth && (
                <div className="pointer-events-none absolute inset-y-[6px] left-1/2 right-0 bg-[#fff3eb]" />
              )}
              {/* Range fill for middle days */}
              {inRange && !isEndpoint && (
                <div className="pointer-events-none absolute inset-y-[6px] inset-x-0 bg-[#fff3eb]" />
              )}

              {/* Day button */}
              {isCurrentMonth ? (
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onDayClick(day)}
                  onMouseEnter={() => !isDisabled && onDayHover(day)}
                  onMouseLeave={onDayLeave}
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-all",
                    compact && "h-6 w-6 text-[10px]",
                    // Default
                    !isEndpoint && !isDisabled && "hover:bg-[#f0f0f0] text-[#212121]",
                    // Disabled
                    isDisabled && "cursor-not-allowed text-[#d5d5d5]",
                    // Today marker (ring)
                    dayIsToday && !isEndpoint && "ring-1 ring-inset ring-[#EF6614] text-[#EF6614] font-bold",
                    // In-range middle days
                    inRange && !isEndpoint && "text-[#212121] hover:bg-[#ffe8d6]",
                    // Endpoints — filled orange circle
                    isEndpoint && !isDisabled && "bg-[#EF6614] text-white font-bold shadow-md shadow-[#EF6614]/30 hover:bg-[#d95d10]",
                  )}
                >
                  {format(day, "d")}
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Public component ───────────────────────────────────────────────────────

type HotelDateRangePickerProps = {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  /** How many months to render side-by-side */
  numberOfMonths?: 1 | 2;
  compact?: boolean;
  className?: string;
};

export function HotelDateRangePicker({
  checkIn,
  checkOut,
  onChange,
  numberOfMonths = 2,
  compact = false,
  className,
}: HotelDateRangePickerProps) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const checkInDate = isoToLocal(checkIn);
  const checkOutDate = isoToLocal(checkOut);

  const [baseMonth, setBaseMonth] = useState<Date>(() => checkInDate ?? today);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  // true = waiting for checkout pick
  const [pickingEnd, setPickingEnd] = useState(!!checkIn && !checkOut);

  const months: Date[] = [];
  for (let i = 0; i < numberOfMonths; i++) months.push(addMonths(baseMonth, i));

  const canGoPrev = isAfter(baseMonth, today);

  const handleDayClick = useCallback(
    (day: Date) => {
      if (!checkInDate || !pickingEnd) {
        // First click → set start, wait for end
        onChange(dateToIso(day), "");
        setPickingEnd(true);
      } else {
        if (isBefore(day, checkInDate) || isSameDay(day, checkInDate)) {
          // Restart selection
          onChange(dateToIso(day), "");
          setPickingEnd(true);
        } else {
          onChange(checkIn, dateToIso(day));
          setPickingEnd(false);
          setHoverDate(null);
        }
      }
    },
    [checkIn, checkInDate, pickingEnd, onChange],
  );

  // Night count badge
  let nights: number | null = null;
  if (checkInDate && checkOutDate) {
    nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000);
  }

  return (
    <div className={cn("select-none", className)}>
      {/* ── Status bar ── */}
      {!compact ? (
        <>
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#f8f8f8] px-3 py-2">
            <div className="flex-1 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#9E9E9E]">Check-In</p>
              <p className={cn("mt-0.5 text-[12px] font-bold", checkInDate ? "text-[#212121]" : "text-[#b0b0b0]")}>
                {checkInDate ? format(checkInDate, "EEE, d MMM") : "Select date"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-px w-6 bg-[#ddd]" />
              {nights !== null ? (
                <span className="rounded bg-[#EF6614]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#EF6614]">
                  {nights}N
                </span>
              ) : (
                <span className="text-[9px] text-[#b0b0b0]">→</span>
              )}
              <div className="h-px w-6 bg-[#ddd]" />
            </div>
            <div className="flex-1 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#9E9E9E]">Check-Out</p>
              <p className={cn("mt-0.5 text-[12px] font-bold", checkOutDate ? "text-[#212121]" : "text-[#b0b0b0]")}>
                {checkOutDate ? format(checkOutDate, "EEE, d MMM") : pickingEnd ? "Pick date" : "Select date"}
              </p>
            </div>
          </div>

          {/* Hint text */}
          <p className="mb-2 text-center text-[10px] text-[#9E9E9E]">
            {!checkInDate
              ? "Select check-in date"
              : pickingEnd
              ? "Now select your check-out date"
              : "Tap a date to change"}
          </p>
        </>
      ) : null}

      {/* ── Navigation ── */}
      <div className={cn("flex items-center justify-between px-1", compact ? "mb-2" : "mb-3")}>
        <button
          type="button"
          onClick={() => setBaseMonth((m) => subMonths(m, 1))}
          disabled={!canGoPrev}
          className={cn("flex items-center justify-center rounded-full transition hover:bg-[#f0f0f0] disabled:opacity-30", compact ? "h-6 w-6" : "h-7 w-7")}
        >
          <ChevronLeft className="h-3.5 w-3.5 text-[#424242]" strokeWidth={2.5} />
        </button>

        <div className={cn("flex", numberOfMonths === 2 ? "gap-8 sm:gap-12" : "gap-0")}>
          {months.map((m) => (
            <span key={m.getTime()} className={cn("min-w-[120px] text-center font-bold text-[#212121]", compact ? "text-[11px]" : "text-[12px]")}>
              {format(m, "MMMM yyyy")}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setBaseMonth((m) => addMonths(m, 1))}
          className={cn("flex items-center justify-center rounded-full transition hover:bg-[#f0f0f0]", compact ? "h-6 w-6" : "h-7 w-7")}
        >
          <ChevronRight className="h-3.5 w-3.5 text-[#424242]" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Month grids ── */}
      <div className={cn("flex", compact ? "gap-2" : "gap-4", numberOfMonths === 2 ? "sm:gap-10" : "")}>
        {months.map((m) => (
          <div key={m.getTime()} className="flex-1">
            <MonthGrid
              month={m}
              today={today}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              hoverDate={hoverDate}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
              onDayLeave={() => setHoverDate(null)}
              compact={compact}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Floating Popover Wrapper ───────────────────────────────────────────────

type DatePickerPopoverProps = {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  onApply: () => void;
  onClose: () => void;
  compact?: boolean;
};

export function DatePickerPopover({ checkIn, checkOut, onChange, onApply, onClose, compact = false }: DatePickerPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 top-full z-[260] mt-2 max-w-[calc(100vw-1rem)] overflow-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)]",
        compact
          ? "max-h-[min(42vh,16rem)] w-[min(290px,calc(100vw-1rem))] p-2"
          : "max-h-[min(62vh,24rem)] w-[min(360px,calc(100vw-1rem))] p-2.5 sm:p-3",
      )}
    >
      {/* Responsive: 1 month on <640px, 2 months on ≥640px */}
      <div className="hidden sm:block">
        <HotelDateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={onChange}
          numberOfMonths={1}
          compact={compact}
        />
      </div>
      <div className="block sm:hidden">
        <HotelDateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={onChange}
          numberOfMonths={1}
          compact={compact}
        />
      </div>

      {!compact ? (
        <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
          <p className="text-[11px] text-[#9E9E9E]">
            {!checkIn ? "Pick check-in date" : !checkOut ? "Now pick check-out date" : "Dates applied ✓"}
          </p>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-[#616161] hover:bg-[#f5f5f5]"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
