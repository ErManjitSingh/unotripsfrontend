"use client";

import { useEffect, useId, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  HIMACHAL_ADS,
  HS1_BEST_TIME,
  HS1_INCLUSIONS,
  HS1_PACKAGES,
  HS1_TESTIMONIALS,
  type Hs1Package,
} from "@/lib/meta/himachal-special-data";
import { HimachalChatbot } from "@/components/meta/himachal-chatbot/himachal-chatbot";
import { WeatherWidget } from "./weather-widget";

type Props = {
  h1: string;
};

const ADS = HIMACHAL_ADS;
const PHONE = ADS.phoneTel;
const WA = `https://wa.me/${ADS.whatsapp}?text=${encodeURIComponent(
  "Hi, I want a Himachal tour quote from Himachal Special Ads Landing.",
)}`;

function IconPhone({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconWhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function IconPin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconHeart({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconFlame({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2c0 4-3 6-3 10a3 3 0 0 0 6 0c0-2 2-3.5 2-6-2 1-3 2.5-3 4.5C14 7 13 4.5 12 2zm-1.5 16.5a1.5 1.5 0 1 0 3 0c0-1.5-1.5-2.5-1.5-2.5s-1.5 1-1.5 2.5z" />
    </svg>
  );
}

function IconHotel({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 21h18M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-5h6v5M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
    </svg>
  );
}

function IconCoffee({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M6 2v2M10 2v2M14 2v2" />
    </svg>
  );
}

function IconCar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 17h14v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2H8v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2z" />
      <path d="M5 17l-1.5-5.5A2 2 0 0 1 5.4 9H18.6a2 2 0 0 1 1.9 2.5L19 17" />
      <path d="M7 9V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function IconCamera({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconShield({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconStar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function InclusionIcon({ type }: { type: (typeof HS1_INCLUSIONS)[number]["icon"] }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  switch (type) {
    case "hotel":
      return (
        <svg {...common} stroke="currentColor" strokeWidth="1.8">
          <path d="M3 21V8l9-5 9 5v13" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );
    case "meal":
      return (
        <svg {...common} stroke="currentColor" strokeWidth="1.8">
          <path d="M4 3v8a4 4 0 0 0 4 4h0V3" />
          <path d="M8 15v6M16 3v18M16 3c2.5 2 3 5 0 8" />
        </svg>
      );
    case "transfer":
      return (
        <svg {...common} stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="10" width="18" height="8" rx="2" />
          <path d="M5 10V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2M7 18v2M17 18v2" />
        </svg>
      );
    case "sight":
      return (
        <svg {...common} stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        </svg>
      );
    default:
      return (
        <svg {...common} stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10z" />
        </svg>
      );
  }
}

function LeadForm({
  packageTitle,
  onClose,
}: {
  packageTitle: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      destination: String(fd.get("destination") || "Himachal"),
      package: String(fd.get("package") || packageTitle),
      landingPage: ADS.landingPage,
      captureType: "form",
      message: "Google Ads Himachal Special landing enquiry",
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/meta/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { success?: boolean; message?: string };
        if (!res.ok || !data.success) {
          setError(data.message || "Something went wrong. Please call us.");
          return;
        }
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "conversion", {
            send_to: "AW-17928878008",
          });
        }
        router.push(`${ADS.path}/thank-you`);
      } catch {
        setError("Network error. Please call or WhatsApp us.");
      }
    });
  }

  return (
    <form className="hs1-form" onSubmit={onSubmit}>
      <input type="hidden" name="package" value={packageTitle} />
      <input type="hidden" name="destination" value="Himachal" />
      <div className="hs1-input-wrap">
        <IconUser />
        <input name="name" required autoComplete="name" placeholder="Your name *" />
      </div>
      <div className="hs1-input-wrap">
        <IconPhone size={18} />
        <input
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone number *"
          pattern="[0-9+\-\s]{10,15}"
        />
      </div>
      <div className="hs1-input-wrap">
        <IconMail />
        <input name="email" type="email" autoComplete="email" placeholder="Email (optional)" />
      </div>
      {error ? <p className="hs1-form-error">{error}</p> : null}
      <button type="submit" className="hs1-form-submit" disabled={pending}>
        {pending ? "Sending..." : "Get Free Quote"}
      </button>
      <p className="hs1-form-note">No spam · Free consultation · Instant WhatsApp response</p>
    </form>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function PackageCard({
  pkg,
  onEnquire,
}: {
  pkg: Hs1Package;
  onEnquire: (title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const thumbs = pkg.galleryImages.slice(0, 3);
  const waText = encodeURIComponent(
    `Hi, I want details for ${pkg.title} (${pkg.duration}) starting ${pkg.priceFrom}/person.`,
  );

  return (
    <article className="hs1-card" id={pkg.anchor}>
      <div className="hs1-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image}
          alt={pkg.title}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
        />
        {pkg.bestSeller ? (
          <span className="hs1-card-best">
            <IconFlame />
            BEST SELLER
          </span>
        ) : null}
        <button type="button" className="hs1-card-heart" aria-label="Save package">
          <IconHeart />
        </button>
        <span className="hs1-card-dur">{pkg.duration}</span>
        <div className="hs1-card-thumbs" aria-hidden>
          {thumbs.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" width={48} height={48} loading="lazy" decoding="async" />
          ))}
          <span className="hs1-card-thumb-more">+{pkg.extraPhotoCount}</span>
        </div>
      </div>

      <div className="hs1-card-body">
        <div className="hs1-card-title-row">
          <h3 className="hs1-card-title">{pkg.shortTitle}</h3>
          <p className="hs1-card-price">
            <span className="amt">{pkg.priceFrom}</span>
            <span className="pp">/person</span>
          </p>
        </div>

        <p className="hs1-card-loc">
          <IconPin />
          <span>{pkg.locationLine}</span>
        </p>

        <div className="hs1-card-amenities">
          <div className="hs1-card-amenity">
            <span className="hs1-card-amenity-icon">
              <IconHotel />
            </span>
            <span className="lbl">Hotels</span>
            <span className="sub">{pkg.hotelLabel}</span>
          </div>
          <div className="hs1-card-amenity">
            <span className="hs1-card-amenity-icon">
              <IconCoffee />
            </span>
            <span className="lbl">Breakfast</span>
            <span className="sub">{pkg.breakfastLabel}</span>
          </div>
          <div className="hs1-card-amenity">
            <span className="hs1-card-amenity-icon">
              <IconCar />
            </span>
            <span className="lbl">Transfers</span>
            <span className="sub">{pkg.transferLabel}</span>
          </div>
          <div className="hs1-card-amenity">
            <span className="hs1-card-amenity-icon">
              <IconCamera />
            </span>
            <span className="lbl">Sightseeing</span>
            <span className="sub">{pkg.sightseeingLabel}</span>
          </div>
        </div>

        <div className="hs1-card-highlights">
          <div className="hs1-card-highlights-head">
            <strong>Package Highlights</strong>
            <svg className="hs1-card-mtn" width="40" height="20" viewBox="0 0 40 20" aria-hidden>
              <path d="M0 18 L10 6 L16 12 L24 2 L40 18 Z" fill="currentColor" opacity="0.18" />
            </svg>
          </div>
          <ul>
            {pkg.highlightBullets.map((b) => (
              <li key={b}>
                <span className="hs1-card-check">
                  <IconCheck />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hs1-card-footer">
          <div className="hs1-card-rating">
            <span className="hs1-card-star">
              <IconStar />
            </span>
            <span>
              {pkg.rating.toFixed(1)} ({pkg.reviewCount} Reviews)
            </span>
          </div>
          <button
            type="button"
            className="hs1-card-details"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide Details" : "View Details"}
            <span aria-hidden>{"\u2192"}</span>
          </button>
        </div>

        <div className="hs1-card-cta">
          <a
            className="hs1-btn hs1-btn-wa"
            href={`https://wa.me/${ADS.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsApp />
            <span>WhatsApp</span>
          </a>
          <button
            type="button"
            className="hs1-btn hs1-btn-book"
            onClick={() => onEnquire(pkg.title)}
          >
            <span>Book Now</span>
          </button>
        </div>

        {open ? (
          <div id={panelId} className="hs1-card-expand">
            <p className="hs1-card-expand-title">Day-wise Itinerary</p>
            <ul className="hs1-itinerary">
              {pkg.itinerary.map((day) => (
                <li key={day}>
                  <span className="hs1-dot" aria-hidden />
                  <span>{day}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function HimachalSpecialLanding({ h1 }: Props) {
  const [modalPkg, setModalPkg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!modalPkg) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalPkg]);

  return (
    <div className="hs1-root">
      <header className="hs1-header">
        <div className="hs1-header-inner">
          <a href={ADS.path} className="hs1-logo" aria-label="Uno Trips">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ADS.img}/logo.png`}
              alt="Uno Trips Logo"
              width={120}
              height={40}
              decoding="async"
            />
          </a>
          <a className="hs1-header-call" href={`tel:${PHONE}`}>
            <IconPhone />
            <span>{ADS.phoneDisplay}</span>
          </a>
        </div>
      </header>

      <section className="hs1-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hs1-hero-img"
          src={`${ADS.img}/hero.webp`}
          alt="Himachal Pradesh mountains - Shimla Manali Dharamshala"
          width={1280}
          height={720}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hs1-hero-overlay" />
        <div className="hs1-hero-content">
          <p className="hs1-hero-badge">Best Himachal Tour Packages 2026</p>
          <h1 className="hs1-hero-title">{h1}</h1>
          <p className="hs1-hero-sub">Shimla - Manali - Dharamshala - Kullu</p>
          <div className="hs1-hero-cta">
            <button
              type="button"
              className="hs1-btn hs1-btn-primary hs1-pulse"
              onClick={() => setModalPkg(h1)}
            >
              <IconCalendar />
              <span>Book Now</span>
              <IconArrow />
            </button>
            <a className="hs1-btn hs1-btn-ghost" href={`tel:${PHONE}`}>
              <IconPhone size={16} />
              <span>Call Now</span>
            </a>
          </div>
        </div>

        <div className="hs1-review-overlay">
          <p className="hs1-review-trust">
            No spam - Free consultation - Instant response on WhatsApp
          </p>
          <div className="hs1-review-row">
            <div className="hs1-review-item">
              <div className="hs1-review-logo g">G</div>
              <div className="hs1-review-meta">
                <div className="rating">
                  <span className="star">{"\u2605"}</span>
                  <span>4.9</span>
                </div>
                <div className="count">(14,001 reviews)</div>
              </div>
            </div>
            <div className="hs1-review-item">
              <div className="hs1-review-logo ta" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="hs1-review-meta">
                <div className="rating">
                  <span className="star">{"\u2605"}</span>
                  <span>5.0</span>
                </div>
                <div className="count">(3,850 reviews)</div>
              </div>
            </div>
            <div className="hs1-review-item">
              <div className="hs1-review-logo fb">f</div>
              <div className="hs1-review-meta">
                <div className="rating">
                  <span className="star">{"\u2605"}</span>
                  <span>4.9</span>
                </div>
                <div className="count">(1,031 reviews)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav className="hs1-jump" aria-label="Destination shortcuts">
        <a href="#Manali">Manali</a>
        <a href="#Manali">Shimla</a>
        <a href="#Jibhi">Jibhi</a>
        <a href="#Honeymoon">Honeymoon</a>
        <a href="#Spiti">Spiti</a>
        <a href="#inclusions">Inclusions</a>
      </nav>

      <section className="hs1-section">
        <div className="hs1-container">
          <h2 className="hs1-section-title">Best Himachal Tour Packages</h2>
          <p className="hs1-section-sub">
            Customized trips with hotels, meals, transfers & day-wise itineraries — save up to 60%
          </p>
          <div className="hs1-pkg-list">
            {HS1_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onEnquire={setModalPkg} />
            ))}
          </div>
        </div>
      </section>

      <section className="hs1-section alt" id="inclusions">
        <div className="hs1-container">
          <h2 className="hs1-section-title">What&apos;s Included</h2>
          <p className="hs1-section-sub">Everything you need for a smooth Himachal holiday</p>
          <ul className="hs1-incl-grid">
            {HS1_INCLUSIONS.map((item) => (
              <li key={item.label}>
                <span className="hs1-incl-icon">
                  <InclusionIcon type={item.icon} />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hs1-section">
        <div className="hs1-container">
          <h2 className="hs1-section-title">Best Time to Visit</h2>
          <p className="hs1-section-sub">Plan around seasons — live Manali weather below</p>
          <div className="hs1-time-grid">
            <div className="hs1-season-list">
              {HS1_BEST_TIME.map((s) => (
                <div key={s.season} className="hs1-season">
                  <strong>
                    {s.season} · {s.label}
                  </strong>
                  <span>{s.detail}</span>
                </div>
              ))}
            </div>
            <WeatherWidget />
          </div>
        </div>
      </section>

      <section className="hs1-section alt">
        <div className="hs1-container">
          <h2 className="hs1-section-title">Trusted by Travellers</h2>
          <p className="hs1-section-sub">Honeymoon, family & adventure stories from real guests</p>
          <div className="hs1-trust-grid">
            {HS1_TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="hs1-testimonial">
                <div className="stars" aria-label={`${t.rating} out of 5 stars`}>
                  {"\u2605\u2605\u2605\u2605\u2605".slice(0, t.rating)}
                </div>
                <p>&ldquo;{t.quote}&rdquo;</p>
                <div className="who">{t.name}</div>
                <div className="tag">{t.tag}</div>
              </blockquote>
            ))}
          </div>
          <div className="hs1-badges">
            {ADS.badges.map((b) => (
              <span key={b} className="hs1-badge">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="hs1-footer">
        <div className="hs1-footer-inner">
          <strong>{ADS.brand}</strong>
          <p>HP Tourism Registration No: {ADS.hpTourismReg}</p>
          <p>GSTIN: {ADS.gstin}</p>
          <div className="hs1-footer-links">
            <a href={`tel:${PHONE}`}>Call {ADS.phoneDisplay}</a>
            <a href={WA} target="_blank" rel="noopener noreferrer">
              WhatsApp Us
            </a>
          </div>
          <p style={{ marginTop: "1rem", opacity: 0.7, fontSize: "0.78rem" }}>
            {"\u00A9"} {new Date().getFullYear()} Uno Trips · Himachal tour packages
          </p>
        </div>
      </footer>

      <div className="hs1-sticky" role="navigation" aria-label="Quick actions">
        <div className="hs1-sticky-btns">
          <a className="hs1-sticky-call" href={`tel:${PHONE}`}>
            <IconPhone size={16} />
            Call Now
          </a>
          <a className="hs1-sticky-wa" href={WA} target="_blank" rel="noopener noreferrer">
            <IconWhatsApp />
            WhatsApp Us
          </a>
        </div>
        <p className="hs1-sticky-trust">
          <IconShield size={13} />
          <span>100% Secure Booking | No Hidden Charges</span>
        </p>
      </div>

      {modalPkg ? (
        <div className="hs1-sheet" role="dialog" aria-modal="true" aria-labelledby="hs1-modal-title">
          <button
            type="button"
            className="hs1-sheet-backdrop"
            aria-label="Close dialog"
            onClick={() => setModalPkg(null)}
          />
          <div className="hs1-sheet-panel">
            <div className="hs1-sheet-handle" aria-hidden />
            <button
              type="button"
              className="hs1-modal-close"
              aria-label="Close"
              onClick={() => setModalPkg(null)}
            >
              {"\u00D7"}
            </button>
            <div className="hs1-modal-header">
              <h2 id="hs1-modal-title">Book Now</h2>
              <p>Share your details — we reply on call / WhatsApp</p>
              <p className="hs1-modal-pkg">{modalPkg}</p>
            </div>
            <LeadForm packageTitle={modalPkg} />
          </div>
        </div>
      ) : null}

      <HimachalChatbot
        landingPage={ADS.landingPage}
        destination="Himachal"
      />
    </div>
  );
}