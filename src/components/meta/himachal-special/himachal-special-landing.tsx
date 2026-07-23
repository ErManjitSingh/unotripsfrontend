"use client";

import { useEffect, useId, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  HIMACHAL_ADS,
  HIMACHAL_EXCLUSIONS,
  HIMACHAL_FAQS,
  HIMACHAL_INCLUSIONS,
  HIMACHAL_PACKAGES,
  HIMACHAL_TESTIMONIALS,
  type HimachalPackage,
} from "@/lib/meta/himachal-special-data";
import { HimachalChatbot } from "@/components/meta/himachal-chatbot/himachal-chatbot";

type Props = {
  h1: string;
};

const PHONE = HIMACHAL_ADS.phoneTel;
const WA = `https://wa.me/${HIMACHAL_ADS.whatsapp}?text=${encodeURIComponent("Hi, I want a Himachal tour quote.")}`;

const PKG_INCLUSIONS = [
  "Stay",
  "Meals",
  "Sightseeing & Activities",
  "Local Transport",
  "Trip Assistance",
] as const;

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

function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
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

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z" />
    </svg>
  );
}

function IconTimes() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.5 12.1-1.4 1.4L12 13.4l-2.1 2.1-1.4-1.4 2.1-2.1-2.1-2.1 1.4-1.4 2.1 2.1 2.1-2.1 1.4 1.4-2.1 2.1 2.1 2.1z" />
    </svg>
  );
}

function InclusionIcon({ type }: { type: (typeof HIMACHAL_INCLUSIONS)[number]["icon"] }) {
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

function PackageAccordion({ pkg }: { pkg: HimachalPackage }) {
  const [openItin, setOpenItin] = useState(false);
  const [openAttr, setOpenAttr] = useState(false);
  const itinId = useId();
  const attrId = useId();

  return (
    <div className="hs-acc-wrap">
      <div className="hs-acc">
        <button
          type="button"
          className="hs-acc-btn"
          aria-expanded={openItin}
          aria-controls={itinId}
          onClick={() => setOpenItin((v) => !v)}
        >
          <span>BRIEF ITINERARY</span>
          <span className={`hs-chevron${openItin ? " open" : ""}`} aria-hidden />
        </button>
        <div id={itinId} className={`hs-acc-panel${openItin ? " open" : ""}`} hidden={!openItin}>
          <ul className="hs-itinerary">
            {pkg.itinerary.map((day) => (
              <li key={day}>
                <span className="hs-dot" aria-hidden />
                <span>{day}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {pkg.attractions.length > 0 ? (
        <div className="hs-acc">
          <button
            type="button"
            className="hs-acc-btn"
            aria-expanded={openAttr}
            aria-controls={attrId}
            onClick={() => setOpenAttr((v) => !v)}
          >
            <span>KEY ATTRACTIONS</span>
            <span className={`hs-chevron${openAttr ? " open" : ""}`} aria-hidden />
          </button>
          <div id={attrId} className={`hs-acc-panel${openAttr ? " open" : ""}`} hidden={!openAttr}>
            <ul className="hs-attractions">
              {pkg.attractions.map((a) => (
                <li key={a}>
                  <span className="hs-dot" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
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
      landingPage: HIMACHAL_ADS.landingPage,
      captureType: "form",
      message: "Google Ads Himachal landing enquiry",
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
        router.push(`${HIMACHAL_ADS.path}/thank-you`);
      } catch {
        setError("Network error. Please call or WhatsApp us.");
      }
    });
  }

  return (
    <form className="hs-form" onSubmit={onSubmit}>
      <input type="hidden" name="package" value={packageTitle} />
      <input type="hidden" name="destination" value="Himachal" />
      <div className="hs-input-wrap">
        <IconUser />
        <input name="name" required autoComplete="name" placeholder="Your name *" />
      </div>
      <div className="hs-input-wrap">
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
      <div className="hs-input-wrap">
        <IconMail />
        <input name="email" type="email" autoComplete="email" placeholder="Email (optional)" />
      </div>
      {error ? <p className="hs-form-error">{error}</p> : null}
      <button type="submit" className="hs-form-submit" disabled={pending}>
        {pending ? "Sending..." : "Book Now"}
      </button>
      <p className="hs-form-note">No spam - Free consultation - We will call you back</p>
      {onClose ? (
        <button type="button" className="hs-modal-close" onClick={onClose} aria-label="Close" style={{ position: "static", margin: "0 auto" }}>
          Close
        </button>
      ) : null}
    </form>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function HimachalSpecialLanding({ h1 }: Props) {
  const [modalPkg, setModalPkg] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

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

  const manaliPkgs = HIMACHAL_PACKAGES.filter((p) => p.focus.includes("manali"));
  const jibhiPkgs = HIMACHAL_PACKAGES.filter((p) => p.focus.includes("jibhi"));
  const honeymoonPkgs = HIMACHAL_PACKAGES.filter((p) => p.focus.includes("honeymoon"));
  const shimlaPkgs = HIMACHAL_PACKAGES.filter(
    (p) => p.focus.includes("shimla") && !p.focus.includes("honeymoon"),
  );

  return (
    <div className="hs-root">
      <header className="hs-header">
        <div className="hs-header-inner">
          <a href={HIMACHAL_ADS.path} className="hs-logo" aria-label="Uno Trips">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${HIMACHAL_ADS.img}/logo.png`}
              alt="Uno Trips Logo"
              width={120}
              height={40}
              decoding="async"
            />
          </a>
          <a className="hs-header-call" href={`tel:${PHONE}`}>
            <IconPhone />
            <span>{HIMACHAL_ADS.phoneDisplay}</span>
          </a>
        </div>
      </header>

      <section className="hs-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hs-hero-img"
          src={`${HIMACHAL_ADS.img}/hero-original.webp`}
          alt="Himachal Pradesh - Shimla Manali Dharamshala"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hs-hero-overlay" />
        <div className="hs-hero-content">
          <p className="hs-hero-badge">Best Himachal Tour Packages</p>
          <h1 className="hs-hero-title">{h1}</h1>
          <p className="hs-hero-sub">Shimla - Manali - Dharamshala - Kullu</p>
          <div className="hs-hero-cta">
            <button
              type="button"
              className="hs-btn hs-btn-primary hs-pulse"
              onClick={() => setModalPkg(h1)}
            >
              <IconCalendar />
              <span>Book Now</span>
              <IconArrow />
            </button>
            <a className="hs-btn hs-btn-ghost" href={`tel:${PHONE}`}>
              <IconPhone size={16} />
              <span>Call Now</span>
            </a>
          </div>
        </div>

        <div className="hs-review-overlay">
          <p className="hs-review-trust">No spam - Free consultation - Instant response on WhatsApp</p>
          <div className="hs-review-row">
            <div className="hs-review-item">
              <div className="hs-review-logo g">G</div>
              <div className="hs-review-meta">
                <div className="rating">
                  <span className="star">★</span>
                  <span>4.9</span>
                </div>
                <div className="count">(14,001 reviews)</div>
              </div>
            </div>
            <div className="hs-review-item">
              <div className="hs-review-logo ta" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="hs-review-meta">
                <div className="rating">
                  <span className="star">★</span>
                  <span>5.0</span>
                </div>
                <div className="count">(3,850 reviews)</div>
              </div>
            </div>
            <div className="hs-review-item">
              <div className="hs-review-logo fb">f</div>
              <div className="hs-review-meta">
                <div className="rating">
                  <span className="star">★</span>
                  <span>4.9</span>
                </div>
                <div className="count">(1,031 reviews)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav className="hs-jump" aria-label="Destination shortcuts">
        <a href="#ManaliTour">Manali</a>
        <a href="#ShimlaTour">Shimla</a>
        <a href="#JibhiTour">Jibhi</a>
        <a href="#Honeymoon">Honeymoon</a>
        <a href="#inclusions">Inclusions</a>
      </nav>

      <section className="hs-pricing">
        <div className="hs-pricing-inner">
          <h2 className="hs-section-title">Best Himachal Tour Packages</h2>
          <p className="hs-section-sub">Explore the land of snow-clad peaks and valleys</p>
          <div className="hs-pricing-actions">
            <button
              type="button"
              className="hs-btn hs-btn-primary hs-pulse"
              onClick={() => setModalPkg(h1)}
            >
              <IconCalendar />
              <span>Book Now</span>
              <IconArrow />
            </button>
            <a className="hs-btn hs-btn-wa" href={WA} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp />
              <span>Chat on WhatsApp</span>
            </a>
            <div className="hs-cta-trust">
              <p>
                <span>
                  <span className="ok" aria-hidden>
                    ✓
                  </span>{" "}
                  No spam, free consultation
                </span>
                <span>
                  <span className="star" aria-hidden>
                    ★
                  </span>{" "}
                  10+ years experience
                </span>
                <span>
                  <span className="ok" aria-hidden>
                    ✓
                  </span>{" "}
                  Instant response
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="inclusions" className="hs-section">
        <div className="hs-section-inner">
          <h2>What&apos;s included</h2>
          <p className="hs-lead">Clear inclusions so you know what you pay for.</p>
          <ul className="hs-incl-grid">
            {HIMACHAL_INCLUSIONS.map((item) => (
              <li key={item.label}>
                <span className="hs-incl-icon">
                  <InclusionIcon type={item.icon} />
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          <div className="hs-excl">
            <h3>Not included</h3>
            <ul>
              {HIMACHAL_EXCLUSIONS.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PackageBlock
        id="Honeymoon"
        title="Honeymoon packages"
        subtitle="Romantic Shimla & Manali stays couples love."
        packages={honeymoonPkgs}
        onEnquire={setModalPkg}
      />
      <PackageBlock
        id="ManaliTour"
        title="Manali tour packages"
        subtitle="Solang, snow days and Kullu valley itineraries."
        packages={manaliPkgs}
        onEnquire={setModalPkg}
      />
      <PackageBlock
        id="JibhiTour"
        title="Jibhi & Tirthan packages"
        subtitle="Quiet valley escapes built for Jibhi searches."
        packages={jibhiPkgs}
        onEnquire={setModalPkg}
      />
      <PackageBlock
        id="ShimlaTour"
        title="Shimla tour packages"
        subtitle="Mall Road, Kufri and classic hill-station plans."
        packages={shimlaPkgs}
        onEnquire={setModalPkg}
      />

      <section id="packages" className="hs-section hs-packages-bg">
        <div className="hs-section-inner">
          <h2>Himachal Tour Packages</h2>
          <p className="hs-lead">Handpicked itineraries for every traveller</p>
          <div className="hs-pkg-list">
            {HIMACHAL_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onEnquire={setModalPkg} />
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="hs-section">
        <div className="hs-section-inner">
          <h2>Honeymooners &amp; travellers love us</h2>
          <p className="hs-lead">Real guest stories from Himachal trips.</p>
          <div className="hs-reviews">
            {HIMACHAL_TESTIMONIALS.map((t) => (
              <figure key={t.name} className="hs-review">
                <div className="hs-review-avatar" aria-hidden>
                  {t.name.split("&")[0].trim().slice(0, 1)}
                </div>
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  <span>{t.tag}</span>
                  <span className="hs-stars" aria-label={`${t.rating} stars`}>
                    {"★".repeat(t.rating)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="hs-mid-cta">
        <h2>Talk to a Travel Expert</h2>
        <p>10+ years experience - Custom itineraries - No spam</p>
        <button
          type="button"
          className="hs-btn hs-btn-primary hs-pulse"
          onClick={() => setModalPkg(h1)}
        >
          <IconCalendar />
          <span>Book Now</span>
          <IconArrow />
        </button>
      </section>

      <section className="hs-faq-section" id="faq">
        <h2>Frequently Asked Questions (FAQs)</h2>
        <div className="hs-faq">
          {HIMACHAL_FAQS.map((f, i) => (
            <div key={f.q} className="hs-faq-item">
              <button
                type="button"
                className="hs-faq-btn"
                aria-expanded={faqOpen === i}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <span>{f.q}</span>
                <span className={`hs-chevron${faqOpen === i ? " open" : ""}`} aria-hidden />
              </button>
              {faqOpen === i ? <p className="hs-faq-a">{f.a}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <footer className="hs-footer">
        <div className="hs-footer-grid">
          <div>
            <h3>Uno Trips</h3>
            <p>
              Your trusted travel partner for amazing Himachal tours. Experience the beauty of
              snow-clad peaks and valleys with our curated packages.
            </p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#packages">Tour Packages</a>
              </li>
              <li>
                <a href="#faq">FAQs</a>
              </li>
              <li>
                <a href="#Honeymoon">Honeymoon</a>
              </li>
              <li>
                <a href="#inclusions">Inclusions</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Contact Us</h3>
            <ul>
              <li>
                <a href={`tel:${PHONE}`}>{HIMACHAL_ADS.phoneDisplay}</a>
              </li>
              <li>
                <a href={WA} target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="hs-footer-copy">&copy; {new Date().getFullYear()} Uno Trips. All rights reserved.</p>
      </footer>

      <div className="hs-sticky" role="region" aria-label="Quick actions">
        <a className="hs-sticky-call" href={`tel:${PHONE}`}>
          <IconPhone size={16} />
          Call
        </a>
        <a className="hs-sticky-wa" href={WA} target="_blank" rel="noopener noreferrer">
          <IconWhatsApp size={18} />
          WhatsApp
        </a>
      </div>

      {modalPkg ? (
        <div className="hs-modal" role="dialog" aria-modal="true" aria-label="Book Your Himachal Tour">
          <div className="hs-modal-backdrop" onClick={() => setModalPkg(null)} />
          <div className="hs-modal-card">
            <div className="hs-modal-header">
              <h2>Book Your Himachal Tour</h2>
              <p>No spam - Free consultation - We will call you back</p>
              {modalPkg !== h1 ? <p className="hs-modal-pkg">{modalPkg}</p> : null}
              <button
                type="button"
                className="hs-modal-close"
                onClick={() => setModalPkg(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <LeadForm packageTitle={modalPkg} />
          </div>
        </div>
      ) : null}

      <HimachalChatbot
        landingPage={HIMACHAL_ADS.landingPage}
        destination="Himachal"
      />
    </div>
  );
}

function PackageBlock({
  id,
  title,
  subtitle,
  packages,
  onEnquire,
}: {
  id: string;
  title: string;
  duration?: string;
  subtitle: string;
  packages: HimachalPackage[];
  onEnquire: (title: string) => void;
}) {
  if (!packages.length) return null;
  return (
    <section id={id} className="hs-section">
      <div className="hs-section-inner">
        <h2>{title}</h2>
        <p className="hs-lead">{subtitle}</p>
        <div className="hs-pkg-list">
          {packages.map((pkg) => (
            <PackageCard key={`${id}-${pkg.id}`} pkg={pkg} onEnquire={onEnquire} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({
  pkg,
  onEnquire,
}: {
  pkg: HimachalPackage;
  onEnquire: (title: string) => void;
}) {
  const cardId = pkg.anchor || pkg.id;
  return (
    <article className="hs-pkg" id={cardId !== pkg.anchor ? pkg.id : undefined}>
      {pkg.trending ? <span className="hs-badge">TRENDING NOW</span> : null}
      <div className="hs-pkg-row">
        <div className="hs-pkg-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.image}
            alt={pkg.title}
            width={600}
            height={400}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="hs-pkg-body">
          <p className="hs-pkg-duration">{pkg.duration}</p>
          <div className="hs-pkg-route">
            {pkg.route.map((stop, i) => (
              <span key={`${stop}-${i}`}>
                {i > 0 ? <span className="sep">→</span> : null}
                <span>{stop}</span>
              </span>
            ))}
          </div>
          <h3>{pkg.title}</h3>
          <ul className="hs-pkg-incl">
            {PKG_INCLUSIONS.map((label) => (
              <li key={label}>
                <span className="ok">
                  <IconCheck />
                </span>
                <span>{label}</span>
              </li>
            ))}
            <li>
              <span className="no">
                <IconTimes />
              </span>
              <span>Flights</span>
              <span className="hs-addl">Additional</span>
            </li>
          </ul>
          <PackageAccordion pkg={pkg} />
          <div className="hs-pkg-actions">
            <a className="hs-pkg-btn hs-pkg-btn-wa" href={WA} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp size={15} />
              <span>WhatsApp</span>
            </a>
            <a className="hs-pkg-btn hs-pkg-btn-call" href={`tel:${PHONE}`}>
              <IconPhone size={14} />
              <span>Call Now</span>
            </a>
            <button
              type="button"
              className="hs-pkg-btn hs-pkg-btn-enquire"
              onClick={() => onEnquire(pkg.title)}
            >
              <IconSend />
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}