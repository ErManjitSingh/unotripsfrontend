"use client";

import { AnimatePresence, motion } from "framer-motion";
import HTMLFlipBook from "react-pageflip";
import {
  ArrowDownToLine, Car, ChevronLeft, ChevronRight, Expand, Grid2X2,
  MapPin, Minus, Plus, Sparkles, X,
} from "lucide-react";
import {
  forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { TourPackage } from "@/lib/constants";
import { cn, formatInrAmount } from "@/lib/utils";

type TripBrochureModalProps = {
  open: boolean;
  onClose: () => void;
  tour: TourPackage;
  stays?: Array<{ name: string; location?: string; image?: string }>;
};

type BrochurePageProps = {
  children: ReactNode;
  pageNumber: number;
  className?: string;
  cover?: boolean;
};

const FALLBACK_HIMALAYAN_IMAGE = "/images/brochure-himalayan-dawn.png";
const UNO_TRIPS_LOGO = "/images/unotrips-logo-cutout.png";
const FALLBACK_BROCHURE_VISUALS = [
  FALLBACK_HIMALAYAN_IMAGE,
  "/images/brochure-shimla-church.png",
  "/images/brochure-kufri-ridge.png",
  "/images/brochure-manali-lodge.png",
];

const BrochurePage = forwardRef<HTMLDivElement, BrochurePageProps>(function BrochurePage(
  { children, pageNumber, className, cover = false },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cn(
        "brochure-paper relative h-full w-full overflow-hidden bg-[#fffdf8] text-[#172033]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(rgba(83,66,43,0.22)_0.45px,transparent_0.5px)] [background-size:5px_5px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80" />
      {children}
      {!cover && <div className="absolute inset-x-0 bottom-0 z-[60] flex h-14 items-center justify-between bg-gradient-to-t from-[#fffdf8] via-[#fffdf8]/95 to-transparent px-6 pt-3"><img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="h-4 w-auto shrink-0 object-contain opacity-80" /><span className="pt-2 text-[10px] font-semibold leading-none text-slate-400">{String(pageNumber).padStart(2, "0")}</span></div>}
    </section>
  );
});

function cleanCopy(value?: string) {
  return (value ?? "")
    .replace(/-{2,}/g, "—")
    .replace(/\s+/g, " ")
    .replace(/\btest (tour |package )?package\b/gi, "curated journey")
    .trim();
}

function brochureTitle(value?: string) {
  return cleanCopy(value)
    .replace(/\s*[—–-]?\s*\d+\s*(?:nights?|n)\s*\d+\s*(?:days?|d)\s*$/i, "")
    .replace(/\s*[—–-]?\s*\d+\s*(?:days?|d)\s*\d+\s*(?:nights?|n)\s*$/i, "")
    .replace(/^test\s+/i, "")
    .trim() || "Your UNO Journey";
}

function compactLocation(location?: string) {
  return location?.split(",").slice(0, 2).join(" · ") || "Himalayan escape";
}

function descriptionFor(tour: TourPackage, location: string) {
  const description = cleanCopy(tour.description);
  if (description.length > 45 && !/\b(test|qa|sample)\b/i.test(description)) return description;
  return `A considered escape through ${location}, with unhurried mornings, dramatic landscapes, and stays chosen for how they make you feel.`;
}

function excerpt(value: string, max = 190) {
  if (value.length <= max) return value;
  const end = value.slice(0, max).lastIndexOf(" ");
  return `${value.slice(0, Math.max(end, 1)).trim()}…`;
}

function routeStopFrom(value: string) {
  const stop = cleanCopy(value)
    .replace(/\([^)]*\)/g, "")
    .replace(/^\s*(?:day\s*\d+\s*[:/-]?\s*)/i, "")
    .replace(/\b(?:local|sight\w*|sigh\w*|arrival|departure|checkout|check[- ]?in|airport|railway station)\b.*$/i, "")
    .replace(/\b(?:to|from)\b\s*$/i, "")
    .replace(/[,:;]+$/g, "")
    .trim();

  if (!stop || /^(?:drive|return|transfer|overnight)$/i.test(stop)) return null;
  return stop
    .replace(/\bkuffri\b/gi, "Kufri")
    .replace(/\bdelhi\b/gi, "Delhi")
    .replace(/\bdharmshala\b/gi, "Dharamshala")
    .replace(/\bdalhouise\b/gi, "Dalhousie")
    .replace(/\s+/g, " ")
    .trim();
}

function packageDestinations(tour: TourPackage) {
  // Itinerary titles are the source of truth. Each title can contain an
  // arrival, a transfer, local sightseeing, or a return, so split the route
  // into place-like fragments and retain their first appearance in journey order.
  const candidates = (tour.itinerary ?? [])
    .flatMap((day) => cleanCopy(day.title).split(/(?:—|–|\||\/|\+|•|\bto\b)/i))
    .map(routeStopFrom)
    .filter((stop): stop is string => Boolean(stop && stop.length > 2));
  const unique = Array.from(new Map(candidates.map((stop) => [stop.toLocaleLowerCase(), stop])).values());
  return unique.length ? unique : [compactLocation(tour.location)];
}

type RouteMapNode = { left: number; top: number };

function routeMapNodes(count: number): RouteMapNode[] {
  if (count <= 1) return [{ left: 52, top: 46 }];
  if (count === 2) return [{ left: 20, top: 66 }, { left: 80, top: 22 }];

  const routeShapes: RouteMapNode[] = [
    { left: 14, top: 63 }, { left: 27, top: 22 }, { left: 42, top: 66 }, { left: 57, top: 20 },
    { left: 71, top: 61 }, { left: 84, top: 23 }, { left: 82, top: 57 }, { left: 91, top: 16 },
  ];
  return routeShapes.slice(0, Math.min(count, routeShapes.length));
}

function routeMapPath(nodes: RouteMapNode[]) {
  const points = [{ left: 6, top: 84 }, ...nodes];
  if (points.length < 2) return "";
  const scaled = points.map((point) => ({ x: point.left * 10, y: point.top * 5 }));
  return scaled.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = scaled[index - 1];
    const beforePrevious = scaled[index - 2] ?? previous;
    const next = scaled[index + 1] ?? point;
    const tension = 0.18;
    const controlOneX = previous.x + (point.x - beforePrevious.x) * tension;
    const controlOneY = previous.y + (point.y - beforePrevious.y) * tension;
    const controlTwoX = point.x - (next.x - previous.x) * tension;
    const controlTwoY = point.y - (next.y - previous.y) * tension;
    return `${path} C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${point.x} ${point.y}`;
  }, "");
}

function dayJourneyDetails(value?: string) {
  const copy = cleanCopy(value);
  const distanceMatch = copy.match(/\(?\s*(\d[\d,.]*)\s*(?:km|kms?)\s*\)?/i);
  const route = copy
    .replace(distanceMatch?.[0] ?? "", "")
    .replace(/\(arrival\)/gi, "")
    .replace(/\s*(?:—|–)\s*/g, " → ")
    .replace(/\s+to\s+/gi, " → ")
    .replace(/\s+/g, " ")
    .trim();
  const arrival = route.split("→").at(-1)?.trim() || "Your next stay";
  return { route: route || "The road ahead", distance: distanceMatch?.[1] ? `${distanceMatch[1]} km` : null, arrival };
}

function hasUsablePrice(price: number) {
  return Number.isFinite(price) && price >= 1000;
}

function PageKicker({ children }: { children: ReactNode }) {
  return <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#c7632b]">{children}</p>;
}

function getTourImages(tour: TourPackage) {
  return Array.from(new Set([tour.image, ...(tour.galleryImages ?? [])].filter(Boolean))) as string[];
}

type PrintBrochureDocumentProps = {
  title: string;
  duration: string;
  location: string;
  description: string;
  destinations: string[];
  routeDestinations: string[];
  routeNodes: RouteMapNode[];
  routePath: string;
  days: NonNullable<TourPackage["itinerary"]>;
  stays: Array<{ name: string; location?: string; image?: string }>;
  inclusions: string[];
  visuals: string[];
  price: number;
  priceIsUsable: boolean;
};

function PrintBrochureDocument({
  title, duration, location, description, destinations, routeDestinations, routeNodes, routePath,
  days, stays, inclusions, visuals, price, priceIsUsable,
}: PrintBrochureDocumentProps) {
  const printPageTotal = days.length + 6;
  const printFooter = (page: number) => <footer className="brochure-print-footer"><img src={UNO_TRIPS_LOGO} alt="UNO Trips" /><span>{String(page).padStart(2, "0")} / {String(printPageTotal).padStart(2, "0")}</span></footer>;

  return (
    <section className="brochure-print-document" aria-hidden="true">
      <article className="brochure-print-page brochure-print-cover">
        <img src={visuals[0]} alt="" className="brochure-print-cover-image" />
        <div className="brochure-print-cover-wash" />
        <div className="brochure-print-cover-content"><img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="brochure-print-mark" /><div><p className="brochure-print-kicker">Curated mountain escape</p><h1>{title}</h1><p className="brochure-print-duration">{duration}</p></div><div><p className="brochure-print-kicker">Your route</p><p className="brochure-print-route-copy">{destinations.join(" · ")}</p></div></div>
      </article>

      <article className="brochure-print-page brochure-print-welcome-page">
        <section className="brochure-print-welcome"><div><p className="brochure-print-kicker">01 / Welcome</p><h2>Escape into<br />the Himalayas.</h2><p className="brochure-print-copy">{excerpt(description, 520)}</p><p className="brochure-print-location"><MapPin /> {location}</p></div><img src={visuals[0]} alt="" /><span>Himalayan mornings</span></section>
        {printFooter(2)}
      </article>

      <article className="brochure-print-page brochure-print-route-page">
        <section className="brochure-print-route-panel"><p className="brochure-print-kicker">02 / The route</p><h2>Follow the open road.</h2><p className="brochure-print-stop-count">{destinations.length} stops</p><div className="brochure-print-route-map"><svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true"><path d={routePath} fill="none" stroke="#d95f24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 17" /></svg><div className="brochure-print-car"><Car /></div>{routeDestinations.map((destination, index) => { const position = routeNodes[index]; return <div key={`${destination}-${index}`} className="brochure-print-stop" style={{ left: `${position.left}%`, top: `${position.top}%` }}><img src={visuals[index % visuals.length]} alt="" /><b>{String(index + 1).padStart(2, "0")}</b><span>{destination}</span></div>; })}</div></section>
        {printFooter(3)}
      </article>

      {days.map((day, index) => { const journey = dayJourneyDetails(day.title); const image = visuals[(index + 1) % visuals.length]; return <article className="brochure-print-page brochure-print-day-solo" key={`print-day-${day.day}`}><section className="brochure-print-day"><div className="brochure-print-day-copy"><p className="brochure-print-kicker">{String(index + 4).padStart(2, "0")} / Day {String(day.day).padStart(2, "0")}</p><h2>{journey.route}</h2>{journey.distance && <p className="brochure-print-distance"><Car /> {journey.distance} scenic drive</p>}<div className="brochure-print-story"><p>Today&apos;s story</p><span>{excerpt(cleanCopy(day.body), 620)}</span></div><div className="brochure-print-day-note"><span>Tonight</span><b>{journey.arrival}</b></div></div><div className="brochure-print-day-image"><img src={image} alt="" /><div /><p>Let the view set the pace.</p></div></section>{printFooter(index + 4)}</article>; })}

      <article className="brochure-print-page brochure-print-summary">
        <section><p className="brochure-print-kicker">Trip essentials</p><h2>Everything considered.</h2><div className="brochure-print-inclusions">{inclusions.slice(0, 6).map((item) => <p key={item}><Sparkles /> {cleanCopy(item)}</p>)}</div></section><section className="brochure-print-price-card"><p className="brochure-print-kicker">Your trip</p><h3>{duration}</h3>{priceIsUsable ? <><span>Starting from</span><strong>₹{formatInrAmount(price)}</strong></> : <strong>Tailored pricing</strong>}</section>
        {printFooter(days.length + 4)}
      </article>

      <article className="brochure-print-page brochure-print-stays-page">
        <section className="brochure-print-stays"><p className="brochure-print-kicker">Curated stays</p><h2>Rest where the view lingers.</h2><div className="brochure-print-stay-gallery">{visuals.slice(0, 3).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" />)}</div>{(stays.length ? stays.slice(0, 3) : [{ name: "Hand-picked accommodation", location }]).map((stay, index) => <div key={`${stay.name}-${index}`}><img src={stay.image ?? visuals[(index + 1) % visuals.length]} alt="" /><p><b>{cleanCopy(stay.name)}</b>{stay.location && <span>{cleanCopy(stay.location)}</span>}</p></div>)}</section>
        {printFooter(days.length + 5)}
      </article>

      <article className="brochure-print-page brochure-print-cover brochure-print-closing">
        <img src={visuals[0]} alt="" className="brochure-print-cover-image" /><div className="brochure-print-cover-wash" /><div className="brochure-print-cover-content"><img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="brochure-print-mark" /><div><p className="brochure-print-kicker">Ready when you are</p><h1>Plan this trip<br />your way.</h1><p className="brochure-print-closing-copy">A travel expert can shape every stay, pause, and detail around you.</p></div><div>{priceIsUsable && <><p>Starting from</p><strong>₹{formatInrAmount(price)}</strong></>}</div></div>
        {printFooter(printPageTotal)}
      </article>
    </section>
  );
}

export function TripBrochureModal({ open, onClose, tour, stays = [] }: TripBrochureModalProps) {
  const [activePage, setActivePage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState(false);
  const [isMobileReader, setIsMobileReader] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [isPrintDocumentReady, setIsPrintDocumentReady] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const bookRef = useRef<any>(null);
  const didAutoOpenRef = useRef(false);
  const dialogId = useId();

  const title = brochureTitle(tour.title);
  const location = compactLocation(tour.location);
  const duration = `${tour.durationDays} Days · ${tour.durationNights} Nights`;
  const description = descriptionFor(tour, location);
  const days = tour.itinerary ?? [];
  const dayPageStart = 4;
  const staysPage = dayPageStart + days.length;
  const essentialsPage = staysPage + 1;
  const galleryPage = essentialsPage + 1;
  const planPage = galleryPage + 1;
  const rawImages = useMemo(() => getTourImages(tour), [tour]);
  const visuals = useMemo(
    () => Array.from(new Set([...rawImages, ...FALLBACK_BROCHURE_VISUALS])),
    [rawImages],
  );
  const destinations = useMemo(() => packageDestinations(tour), [tour]);
  const routeDestinations = useMemo(() => destinations.slice(0, 8), [destinations]);
  const routeNodes = useMemo(() => routeMapNodes(routeDestinations.length), [routeDestinations.length]);
  const routePath = useMemo(() => routeMapPath(routeNodes), [routeNodes]);
  const inclusions = tour.inclusions?.length
    ? tour.inclusions.slice(0, 6)
    : ["Thoughtfully selected stays", "Private transfers", "Daily breakfast & dinner", "On-ground travel support"];
  const pageTotal = planPage + 1;
  const priceIsUsable = hasUsablePrice(tour.priceINR);
  // `react-pageflip` needs a numeric page width, so derive it from 95% of the
  // live reader canvas rather than choosing arbitrary desktop pixel widths.
  const bookWidth = stageSize.width
    ? Math.max(isMobileReader ? 260 : 300, Math.floor(stageSize.width * (isMobileReader ? 0.88 : 0.475)))
    : (isMobileReader ? 360 : 500);
  const bookHeight = stageSize.height
    ? isMobileReader
      ? Math.max(440, Math.min(640, stageSize.height - 18, Math.round(bookWidth / 0.62)))
      : Math.max(300, Math.min(500, stageSize.height - 24))
    : (isMobileReader ? 580 : 500);
  const dayStoryLimit = isMobileReader ? (bookHeight < 560 ? 175 : 220) : bookHeight < 420 ? 220 : 360;
  // Desktop pages are shown as spreads. An even page is the right side of the
  // preceding spread, so always report the actual left/right pages on screen.
  const spreadStart = !isMobileReader && activePage > 0 && activePage % 2 === 0
    ? activePage - 1
    : activePage;
  const visibleEnd = isMobileReader ? activePage : Math.min(spreadStart + 1, pageTotal - 1);
  const readerLabel = activePage === 0
    ? "Cover"
    : isMobileReader
    ? `Page ${activePage} of ${pageTotal - 1}`
    : `Pages ${spreadStart}–${visibleEnd} of ${pageTotal - 1}`;

  useEffect(() => setIsPrintDocumentReady(true), []);

  const thumbnails = [
    { page: 0, number: "00", label: "Cover", image: visuals[0] },
    { page: 1, number: "01", label: "Welcome", image: visuals[0] },
    { page: 2, number: "02", label: "The route", image: visuals[1] },
    { page: 3, number: "03", label: "Itinerary", image: visuals[2] },
    ...days.map((day, index) => ({
      page: dayPageStart + index,
      number: String(dayPageStart + index).padStart(2, "0"),
      label: `Day ${day.day}`,
      image: visuals[(index + 1) % visuals.length],
    })),
    { page: staysPage, number: String(staysPage).padStart(2, "0"), label: "Stays", image: stays[0]?.image ?? visuals[1] },
    { page: essentialsPage, number: String(essentialsPage).padStart(2, "0"), label: "Essentials", image: visuals[0] },
    { page: galleryPage, number: String(galleryPage).padStart(2, "0"), label: "Gallery", image: visuals[2] },
    { page: planPage, number: String(planPage).padStart(2, "0"), label: "Plan your trip", image: visuals[0] },
  ];

  useEffect(() => {
    if (!open) {
      didAutoOpenRef.current = false;
      return;
    }
    setActivePage(0);
    setZoom(1);
    setIsFilmstripOpen(false);
    // React Strict Mode replays effects in development. Without this guard it
    // can turn two sheets at once and make the cover appear to skip ahead.
    if (didAutoOpenRef.current) return;
    didAutoOpenRef.current = true;
    let hasOpened = false;
    const timer = window.setTimeout(() => {
      hasOpened = true;
      const pageFlip = bookRef.current?.pageFlip();
      if (prefersReducedMotion) pageFlip?.turnToPage(1);
      else pageFlip?.flipNext("bottom");
    }, 460);
    return () => {
      window.clearTimeout(timer);
      if (!hasOpened) didAutoOpenRef.current = false;
    };
  }, [open, tour.id]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileReader(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const nextSize = { width: stage.clientWidth, height: stage.clientHeight };
      setStageSize((current) => (
        current.width === nextSize.width && current.height === nextSize.height ? current : nextSize
      ));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [open]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") bookRef.current?.pageFlip()?.flipNext("bottom");
      if (event.key === "ArrowLeft") bookRef.current?.pageFlip()?.flipPrev("bottom");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, open]);

  const goToPage = (page: number) => {
    setIsFilmstripOpen(false);
    bookRef.current?.pageFlip()?.turnToPage(page);
    setActivePage(page);
  };

  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else modalRef.current.requestFullscreen?.();
  };

  const pageButton = (item: typeof thumbnails[number], compact = false) => {
    const selected = activePage === item.page;
    return (
      <button
        key={`${item.page}-${item.label}`}
        type="button"
        onClick={() => goToPage(item.page)}
        className={cn(
          "group flex w-full gap-2 rounded-xl p-2 text-left transition duration-200",
          selected ? "bg-[#fff4eb] ring-1 ring-[#e97334] shadow-[0_7px_18px_rgba(158,75,27,0.12)]" : "hover:bg-stone-100",
          compact && "gap-3 p-2.5",
        )}
      >
        <span className={cn("relative shrink-0 overflow-hidden rounded-md bg-slate-900 shadow-sm", compact ? "h-14 w-20" : "h-12 w-14")}>
          <img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />
          <span className="absolute bottom-1 left-1.5 text-[8px] font-bold tracking-[0.16em] text-white">{item.number}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c7632b]">{item.number}</span>
          <span className="truncate text-[11px] font-bold text-slate-700">{item.label}</span>
        </span>
      </button>
    );
  };

  return (
    <>
      {open && isPrintDocumentReady && createPortal(<PrintBrochureDocument title={title} duration={duration} location={location} description={description} destinations={destinations} routeDestinations={routeDestinations} routeNodes={routeNodes} routePath={routePath} days={days} stays={stays} inclusions={inclusions} visuals={visuals} price={tour.priceINR} priceIsUsable={priceIsUsable} />, document.body)}
      <AnimatePresence>
      {open && (
        <motion.div
          className="brochure-reader-ui fixed inset-0 z-[100] flex items-center justify-center bg-[#1c1917]/70 p-0 backdrop-blur-md sm:p-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
        >
          <motion.div
            ref={modalRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} trip brochure`}
            className="relative flex h-[100dvh] w-full max-w-[1440px] flex-col overflow-hidden rounded-none bg-[#f7f4ee] shadow-[0_35px_100px_rgba(0,0,0,0.52)] sm:h-[min(900px,94dvh)] sm:rounded-[28px]"
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.36, ease: [0.22, 0.8, 0.2, 1] }}
          >
            <header className="relative z-20 flex h-[64px] shrink-0 items-center justify-between border-b border-stone-200/90 bg-white px-4 sm:h-[74px] sm:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-[64px] shrink-0 place-items-center sm:h-11 sm:w-[76px]"><img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="h-auto w-full" /></span>
                <div className="min-w-0"><h2 className="font-brochure-display text-lg font-bold tracking-[-0.035em] text-[#1f2937] sm:text-xl">Trip Brochure</h2><p className="truncate text-[10px] font-semibold text-slate-500 sm:text-[11px]">{title} <span className="hidden sm:inline">• {duration}</span></p></div>
              </div>
              <button type="button" onClick={close} aria-label="Close trip brochure" className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-[#e97334] hover:text-[#d95f24] focus:outline-none focus:ring-2 focus:ring-[#e97334] sm:h-11 sm:w-11"><X className="h-5 w-5" /></button>
            </header>

            <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#fffdf9_0%,#eee9df_75%)]">
              <aside className="hidden w-[168px] shrink-0 overflow-y-auto border-r border-stone-200/90 bg-white/90 p-3 xl:block">
                <p className="px-2 pb-3 pt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Pages</p>
                <div className="space-y-1">{thumbnails.map((item) => pageButton(item))}</div>
              </aside>

              <main ref={stageRef} className="group/bookstage relative flex min-w-0 flex-1 items-center justify-center overflow-hidden px-0 py-2 sm:py-4">
                <div className="pointer-events-none absolute bottom-[7%] left-1/2 h-12 w-[84vw] -translate-x-1/2 rounded-[100%] bg-stone-950/20 blur-2xl sm:bottom-[10%] sm:h-16 sm:w-[min(72vw,780px)] sm:bg-stone-950/25" />
                <button type="button" onClick={() => bookRef.current?.pageFlip()?.flipPrev("bottom")} aria-label="Previous page" className="absolute left-1 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-[#e97334] hover:text-[#d95f24] sm:left-7 sm:h-12 sm:w-12"><ChevronLeft className="h-5 w-5" /></button>

                <div className="relative origin-center transition-transform duration-300" style={{ transform: `scale(${zoom})`, perspective: "1800px" }}>
                  <div className="pointer-events-none absolute inset-y-[3px] -left-2 -right-2 rounded-[22px] bg-[repeating-linear-gradient(0deg,#d9cfbe_0_1px,#fffaf1_1px_4px)] shadow-[0_22px_36px_rgba(41,37,36,0.34)]" />
                  {!isMobileReader && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-40 w-7 -translate-x-1/2 bg-gradient-to-r from-black/20 via-[#6b422c]/60 to-black/20 opacity-90 shadow-[0_0_15px_rgba(0,0,0,0.38)]" />}
                  <div className="relative z-30 overflow-hidden rounded-[18px] shadow-[0_26px_48px_rgba(41,37,36,0.28)]">
                    <HTMLFlipBook
                      key={`${bookWidth}-${bookHeight}-${pageTotal}-${isMobileReader ? "single" : "spread"}`}
                      ref={bookRef}
                      width={bookWidth}
                      height={bookHeight}
                      size="fixed"
                      minWidth={300}
                      maxWidth={bookWidth}
                      minHeight={300}
                      maxHeight={bookHeight}
                      drawShadow
                      maxShadowOpacity={0.9}
                      flippingTime={prefersReducedMotion ? 1 : 720}
                      usePortrait={isMobileReader}
                      showCover
                      mobileScrollSupport={false}
                      swipeDistance={18}
                      startPage={0}
                      startZIndex={10}
                      autoSize
                      clickEventForward
                      useMouseEvents
                      showPageCorners
                      disableFlipByClick={false}
                      className="brochure-book"
                      style={{}}
                      onFlip={(event: any) => setActivePage(event.data)}
                    >
                      <BrochurePage pageNumber={0} cover className="bg-[#3d2216] text-[#fff9f1]">
                        <img src={visuals[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-luminosity" />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(43,24,14,.94),rgba(100,47,18,.64))]" />
                        <div className={cn("relative flex h-full flex-col justify-between", isMobileReader ? "p-7" : "p-9")}><img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="h-auto w-[104px] brightness-0 invert drop-shadow-md" /><div><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffc79f]">Curated mountain escape</p><h3 className={cn("font-brochure-display mt-4 leading-[0.84] tracking-[-0.07em]", isMobileReader ? "text-4xl" : "text-5xl")}>{title}</h3><p className="mt-5 text-sm text-orange-100">{duration}</p></div><div><p className="text-[8px] font-bold uppercase tracking-[0.24em] text-orange-100">Your route</p><p className="mt-2 max-w-[23rem] text-[9px] font-bold uppercase leading-[1.65] tracking-[0.15em] text-orange-50 sm:text-[10px] sm:leading-5 sm:tracking-[0.17em]">{destinations.join(" · ")}</p></div></div>
                      </BrochurePage>

                      <BrochurePage pageNumber={1}>
                        <img src={visuals[0]} alt="" className={cn("absolute object-cover", isMobileReader ? "inset-x-0 top-0 h-[43%] w-full" : "inset-y-0 right-0 h-full w-[47%]")} />
                        <div className={cn("absolute z-10 bg-[#e97334]/80", isMobileReader ? "inset-x-0 top-[41%] h-px shadow-[0_0_0_5px_rgba(255,253,248,0.55)]" : "inset-y-0 right-[47%] w-px shadow-[0_0_0_5px_rgba(255,253,248,0.55)]")} />
                        <div className={cn("absolute z-10 rounded-full bg-[#172033]/75 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm", isMobileReader ? "right-4 top-[36%]" : "bottom-6 right-5")}>Himalayan mornings</div>
                        <div className={cn("relative flex h-full flex-col", isMobileReader ? "w-full justify-end px-6 pb-10 pt-[47%]" : "w-[53%] justify-center px-8 py-10")}><PageKicker>01 / Welcome</PageKicker><h3 className={cn("font-brochure-display mt-4 leading-[0.88] tracking-[-0.07em]", isMobileReader ? "text-[2.75rem]" : "text-[clamp(2.15rem,3.6vw,3.35rem)]")}>Escape into<br />the Himalayas.</h3><p className={cn("mt-4 text-[11px] leading-5 text-slate-600", isMobileReader ? "max-w-[17rem]" : "max-w-[11.5rem]")}>{excerpt(description, isMobileReader ? 180 : 150)}</p><div className="mt-5 flex items-center gap-2 text-[9px] font-bold text-slate-700"><MapPin className="h-3.5 w-3.5 text-[#d95f24]" /> {location}</div></div>
                      </BrochurePage>

                      <BrochurePage pageNumber={2}>
                        <div className={cn("flex h-full flex-col", isMobileReader ? "p-5" : "p-7")}>
                          <PageKicker>02 / The route</PageKicker>
                          <div className="mt-2 flex items-end justify-between gap-3">
                            <h3 className={cn("font-brochure-display leading-[0.9] tracking-[-0.06em]", isMobileReader ? "text-[2.3rem]" : "text-[clamp(2rem,3.1vw,2.8rem)]")}>Follow the open road.</h3>
                            <p className="mb-1 text-right text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">{destinations.length} stops</p>
                          </div>
                          <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#e8dfd1] bg-[linear-gradient(135deg,#fffdf8_0%,#f7efe5_100%)]">
                            <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(#d99a69_0.7px,transparent_0.8px)] [background-size:7px_7px]" />
                            <svg viewBox="0 0 1000 500" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
                              <path d={routePath} fill="none" stroke="#d95f24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 17" opacity="0.8" />
                              <path d={routePath.split(" L ").slice(0, 2).join(" L ")} fill="none" stroke="#f4b486" strokeWidth="13" strokeLinecap="round" opacity="0.24" />
                            </svg>
                            <div className="absolute left-[6%] top-[84%] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#d95f24] text-white shadow-[0_8px_18px_rgba(136,77,27,0.24)]" role="img" aria-label="Car leading the route"><Car className="h-5 w-5" /></div>
                            {routeDestinations.map((destination, index) => {
                              const position = routeNodes[index];
                              return <div key={`${destination}-${index}`} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${position.left}%`, top: `${position.top}%` }}><div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full border-[3px] border-white bg-[#d95f24] shadow-[0_7px_16px_rgba(77,50,29,0.22)]"><img src={visuals[index % visuals.length]} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-slate-950/20 text-[9px] font-extrabold text-white">{String(index + 1).padStart(2, "0")}</span></div><span className="mt-1.5 inline-block max-w-[5.4rem] rounded-full bg-white/95 px-2 py-1 text-[8px] font-extrabold leading-tight text-slate-700 shadow-sm">{destination}</span></div>;
                            })}
                            {destinations.length > routeDestinations.length && <div className="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-1 text-[8px] font-bold text-[#c7632b] shadow-sm">+{destinations.length - routeDestinations.length} more</div>}
                            <div className="absolute bottom-4 right-5 text-[8px] font-bold uppercase tracking-[0.19em] text-[#bc5a29]">The journey is the story</div>
                          </div>
                        </div>
                      </BrochurePage>

                      <BrochurePage pageNumber={3}>
                        <div className="flex h-full flex-col p-8"><PageKicker>03 / Itinerary at a glance</PageKicker><h3 className="font-brochure-display mt-3 text-4xl leading-none tracking-[-0.06em]">The road unfolds.</h3><p className="mt-3 text-[11px] leading-4 text-slate-500">Turn the page for a fuller story of every day.</p><div className="mt-5 space-y-2">{days.map((day) => <div key={day.day} className="grid grid-cols-[28px_1fr] gap-3 border-b border-stone-200 pb-2"><span className="font-brochure-display text-xl leading-none text-[#d95f24]">{String(day.day).padStart(2, "0")}</span><div><p className="text-[11px] font-bold leading-4 text-slate-800">{cleanCopy(day.title)}</p><p className="mt-0.5 line-clamp-1 text-[9px] leading-4 text-slate-500">{excerpt(cleanCopy(day.body), 110)}</p></div></div>)}</div><div className="mt-auto rounded-xl bg-[#fbefe5] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c7632b]">Travel note</p><p className="mt-1 text-[11px] leading-4 text-slate-600">Leave room for an unplanned tea stop, a photograph, and a longer look at the view.</p></div></div>
                      </BrochurePage>

                      {days.map((day, index) => {
                        const pageNumber = dayPageStart + index;
                        const image = visuals[(index + 1) % visuals.length];
                        const journey = dayJourneyDetails(day.title);
                        return (
                          <BrochurePage key={`day-detail-${day.day}`} pageNumber={pageNumber}>
                            <div className={cn("grid h-full gap-4 p-5 pb-14", isMobileReader ? "grid-cols-1 grid-rows-[1.12fr_.88fr] gap-3 p-4 pb-14" : "grid-cols-[1.05fr_.95fr]")}>
                              <div className="flex min-w-0 flex-col"><PageKicker>{String(pageNumber).padStart(2, "0")} / Day {String(day.day).padStart(2, "0")}</PageKicker><h3 className="font-brochure-display mt-3 line-clamp-2 text-[clamp(1.75rem,2.8vw,2.5rem)] leading-[0.92] tracking-[-0.065em]">{journey.route}</h3>{journey.distance && <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff0e5] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#c7632b]"><Car className="h-3.5 w-3.5" /> {journey.distance} scenic drive</span>}<div className="mt-4 border-l-2 border-[#e97334] pl-3"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c7632b]">Today&apos;s story</p><p className="mt-1.5 text-[10px] leading-4 text-slate-600">{excerpt(cleanCopy(day.body), dayStoryLimit)}</p></div><div className="mt-auto grid grid-cols-2 gap-2 pt-4"><div className="rounded-xl border border-[#eadfce] bg-[#fffaf3] p-3"><Car className="h-3.5 w-3.5 text-[#d95f24]" /><p className="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Roadbook</p><p className="mt-1 text-[10px] font-bold text-slate-700">{journey.distance ?? "Scenic drive"}</p></div><div className="rounded-xl border border-[#eadfce] bg-[#fffaf3] p-3"><MapPin className="h-3.5 w-3.5 text-[#d95f24]" /><p className="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Tonight</p><p className="mt-1 line-clamp-1 text-[10px] font-bold text-slate-700">{journey.arrival}</p></div></div></div>
                              <div className="relative min-h-0 overflow-hidden rounded-2xl bg-slate-900"><img src={image} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" /><div className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/15 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">Day {String(day.day).padStart(2, "0")}</div><div className="absolute inset-x-0 bottom-0 p-4 text-white"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-100">A slower moment</p><p className="font-brochure-display mt-2 text-[1.5rem] leading-[0.9]">Let the view set the pace.</p></div></div>
                            </div>
                          </BrochurePage>
                        );
                      })}

                      <BrochurePage pageNumber={staysPage}>
                        <div className="grid h-full grid-cols-[1.1fr_.9fr] gap-5 p-7"><div className="relative overflow-hidden rounded-2xl bg-slate-900"><img src={stays[0]?.image ?? visuals[1]} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><PageKicker>{String(staysPage).padStart(2, "0")} / Curated stays</PageKicker><p className="font-brochure-display mt-2 text-2xl leading-[0.9]">Rest where the view lingers.</p></div></div><div className="flex flex-col justify-between"><div><PageKicker>Stay beautifully</PageKicker><h3 className="font-brochure-display mt-3 text-3xl leading-[0.92] tracking-[-0.055em]">A good day deserves a beautiful ending.</h3><p className="mt-4 text-[11px] leading-5 text-slate-600">Warm rooms, a slower evening, and a stay that feels part of the destination.</p></div><div className="space-y-2">{(stays.length ? stays.slice(0, 2) : [{ name: "Hand-picked accommodation", location }]).map((stay, index) => <div key={`${stay.name}-${index}`} className="rounded-xl border border-stone-200 bg-white p-3"><p className="text-[11px] font-bold text-slate-800">{cleanCopy(stay.name)}</p>{stay.location && <p className="mt-1 text-[9px] text-slate-500">{cleanCopy(stay.location)}</p>}</div>)}</div></div></div>
                      </BrochurePage>

                      <BrochurePage pageNumber={essentialsPage}>
                        <div className="flex h-full flex-col p-8"><PageKicker>{String(essentialsPage).padStart(2, "0")} / Trip essentials</PageKicker><h3 className="font-brochure-display mt-3 text-4xl leading-none tracking-[-0.06em]">Everything considered.</h3><div className="mt-8 grid grid-cols-2 gap-6"><div><p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Included</p><ul className="space-y-3">{inclusions.map((item) => <li key={item} className="flex gap-2 text-[11px] leading-4 text-slate-600"><Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#d95f24]" />{cleanCopy(item)}</li>)}</ul></div><div className="rounded-2xl bg-[#fbefe5] p-5"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c7632b]">Your trip</p><p className="font-brochure-display mt-4 text-3xl leading-none text-slate-800">{duration}</p>{priceIsUsable ? <><p className="mt-6 text-[10px] text-slate-500">Starting from</p><p className="font-brochure-display mt-1 text-[2.1rem] leading-none tracking-[-0.04em] text-[#d95f24]">₹{formatInrAmount(tour.priceINR)}</p></> : <p className="mt-6 text-sm font-bold text-[#d95f24]">Tailored pricing</p>}</div></div></div>
                      </BrochurePage>

                      <BrochurePage pageNumber={galleryPage}>
                        <div className="grid h-full grid-cols-2 gap-2 p-4">{Array.from({ length: 5 }, (_, index) => <div key={index} className={cn("relative overflow-hidden rounded-xl bg-stone-300", index === 0 && "row-span-2", index === 4 && "col-span-2")}><img src={visuals[index % visuals.length]} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />{index === 0 && <p className="absolute bottom-4 left-4 font-brochure-display text-2xl leading-none text-white">A visual diary.</p>}</div>)}</div>
                      </BrochurePage>

                      <BrochurePage pageNumber={planPage} cover className="bg-[#412214] text-white">
                        <img src={visuals[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" /><div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(47,25,14,.93),rgba(124,45,18,.66))]" /><div className="relative flex h-full flex-col justify-between p-9"><img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="h-auto w-[104px] brightness-0 invert drop-shadow-md" /><div><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffc79f]">Ready when you are</p><h3 className="font-brochure-display mt-4 text-5xl leading-[0.84] tracking-[-0.07em]">Plan this trip<br />your way.</h3><p className="mt-6 max-w-[17rem] text-[12px] leading-5 text-orange-50/85">A travel expert can shape every stay, pause, and detail around you.</p></div><div>{priceIsUsable && <><p className="text-[10px] text-orange-100">Starting from</p><p className="font-brochure-display mt-1 text-[2.1rem] leading-none tracking-[-0.04em]">₹{formatInrAmount(tour.priceINR)}</p></>}</div></div>
                      </BrochurePage>
                    </HTMLFlipBook>
                    <AnimatePresence>
                      {activePage === 0 && !isMobileReader && (
                        <motion.div
                          className="pointer-events-none absolute inset-y-0 left-0 z-[35] w-1/2 overflow-hidden rounded-l-[18px] bg-[#203a42] text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <img src={visuals[1]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
                          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(14,35,43,.94),rgba(32,69,73,.76)_55%,rgba(196,104,50,.58))]" />
                          <div className="relative flex h-full flex-col justify-between p-8">
                            <img src={UNO_TRIPS_LOGO} alt="UNO Trips" className="h-auto w-[98px] brightness-0 invert drop-shadow-md" />
                            <div><p className="text-[9px] font-bold uppercase tracking-[0.28em] text-orange-100">The first page</p><h3 className="font-brochure-display mt-4 max-w-[15rem] text-4xl leading-[0.86] tracking-[-0.065em]">A beautiful journey starts with a little anticipation.</h3><p className="mt-5 max-w-[15rem] text-[11px] leading-5 text-white/80">A considered escape, made for slower mornings, mountain air, and stories you&apos;ll want to keep.</p></div>
                            <div className="border-t border-white/25 pt-4"><div className="grid grid-cols-2 gap-3 text-[9px]"><span><b className="block text-[8px] uppercase tracking-[0.18em] text-orange-100">Duration</b>{duration}</span><span><b className="block text-[8px] uppercase tracking-[0.18em] text-orange-100">Destination</b>{location}</span></div><p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">Turn the cover to begin →</p></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button type="button" onClick={() => bookRef.current?.pageFlip()?.flipNext("bottom")} aria-label="Next page" className="absolute right-1 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-[#e97334] hover:text-[#d95f24] sm:right-7 sm:h-12 sm:w-12"><ChevronRight className="h-5 w-5" /></button>
              </main>

              <AnimatePresence>{isFilmstripOpen && <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="absolute inset-y-0 left-0 z-50 w-[270px] overflow-y-auto border-r border-stone-200 bg-white p-4 shadow-2xl xl:hidden"><div className="mb-3 flex items-center justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Filmstrip</p><p className="mt-1 text-[11px] font-bold text-slate-700">{readerLabel}</p></div><button type="button" onClick={() => setIsFilmstripOpen(false)} aria-label="Close pages" className="rounded-lg p-2 text-slate-500 hover:bg-stone-100"><X className="h-4 w-4" /></button></div><div className="space-y-1">{thumbnails.map((item) => pageButton(item, true))}</div></motion.aside>}</AnimatePresence>
            </div>

            <footer className="flex min-h-[58px] shrink-0 items-center justify-between gap-2 border-t border-stone-200 bg-white px-3 sm:min-h-[66px] sm:gap-3 sm:px-7">
              <div className="hidden items-center gap-2 sm:flex"><button type="button" onClick={() => setZoom((value) => Math.max(0.82, Number((value - 0.08).toFixed(2))))} aria-label="Zoom out" className="rounded-lg p-2 text-slate-500 hover:bg-stone-100 hover:text-[#d95f24]"><Minus className="h-4 w-4" /></button><input aria-label="Brochure zoom" type="range" min="0.82" max="1.08" step="0.02" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="h-1 w-24 cursor-pointer accent-[#e97334]" /><button type="button" onClick={() => setZoom((value) => Math.min(1.08, Number((value + 0.08).toFixed(2))))} aria-label="Zoom in" className="rounded-lg p-2 text-slate-500 hover:bg-stone-100 hover:text-[#d95f24]"><Plus className="h-4 w-4" /></button></div>
              <span className="rounded-full border border-stone-200 bg-[#fffdf9] px-4 py-2 text-[11px] font-bold text-slate-600 shadow-sm">{readerLabel}</span>
              <div className="flex items-center gap-1"><button type="button" onClick={() => setIsFilmstripOpen((value) => !value)} aria-label="Show pages" title="Show page filmstrip" className="rounded-lg p-2.5 text-slate-500 hover:bg-stone-100 hover:text-[#d95f24]"><Grid2X2 className="h-4 w-4" /></button><button type="button" onClick={() => window.print()} aria-label="Download brochure PDF" title="Download brochure PDF" className="rounded-lg p-2.5 text-slate-500 hover:bg-stone-100 hover:text-[#d95f24]"><ArrowDownToLine className="h-4 w-4" /></button><button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen" title="Toggle fullscreen" className="rounded-lg p-2.5 text-slate-500 hover:bg-stone-100 hover:text-[#d95f24]"><Expand className="h-4 w-4" /></button></div>
            </footer>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
