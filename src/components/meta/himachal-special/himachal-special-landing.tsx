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

type Props = {
  h1: string;
};

const PHONE = HIMACHAL_ADS.phoneTel;
const WA = `https://wa.me/${HIMACHAL_ADS.whatsapp}?text=${encodeURIComponent("Hi, I want a Himachal tour quote.")}`;

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

function ItineraryAccordion({ pkg }: { pkg: HimachalPackage }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="hs-acc">
      <button
        type="button"
        className="hs-acc-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Day-wise itinerary</span>
        <span className={`hs-chevron${open ? " open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      <div id={panelId} className={`hs-acc-panel${open ? " open" : ""}`} hidden={!open}>
        <ol>
          {pkg.itinerary.map((day) => (
            <li key={day}>{day}</li>
          ))}
        </ol>
      </div>
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
      <label>
        Name *
        <input name="name" required autoComplete="name" placeholder="Your name" />
      </label>
      <label>
        Phone *
        <input
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="10-digit mobile"
          pattern="[0-9+\-\s]{10,15}"
        />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" placeholder="Optional" />
      </label>
      {error ? <p className="hs-form-error">{error}</p> : null}
      <button type="submit" className="hs-btn hs-btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Get FREE Quote"}
      </button>
      <p className="hs-form-note">No spam · Callback in ~30 mins</p>
      {onClose ? (
        <button type="button" className="hs-form-close" onClick={onClose}>
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
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

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
  const shimlaPkgs = HIMACHAL_PACKAGES.filter((p) => p.focus.includes("shimla") && !p.focus.includes("honeymoon"));

  return (
    <div className="hs-root">
      <header className="hs-header">
        <a href={HIMACHAL_ADS.path} className="hs-logo" aria-label="Uno Trips">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${HIMACHAL_ADS.img}/logo.png`}
            alt="Uno Trips"
            width={120}
            height={36}
            decoding="async"
          />
        </a>
        <a className="hs-header-call" href={`tel:${PHONE}`}>
          Call {HIMACHAL_ADS.phoneDisplay}
        </a>
      </header>

      <section className="hs-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hs-hero-img"
          src={`${HIMACHAL_ADS.img}/hero.webp`}
          alt="Himachal Pradesh mountains — Shimla Manali Jibhi"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hs-hero-scrim" />
        <div className="hs-hero-inner">
          <p className="hs-brand">Uno Trips</p>
          <h1 className="hs-h1">{h1}</h1>
          <p className="hs-hero-sub">
            Shimla · Manali · Jibhi — hotels, breakfast, transfers & day-wise plans. Free customised quote.
          </p>
          <div className="hs-hero-cta">
            <button type="button" className="hs-btn hs-btn-primary" onClick={() => setModalPkg(h1)}>
              Get FREE Quote
            </button>
            <a className="hs-btn hs-btn-ghost" href={`tel:${PHONE}`}>
              Call Now
            </a>
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

      <section className="hs-trust" aria-label="Ratings">
        <div>
          <strong>4.9</strong>
          <span>Google</span>
        </div>
        <div>
          <strong>5.0</strong>
          <span>TripAdvisor</span>
        </div>
        <div>
          <strong>4.9</strong>
          <span>Facebook</span>
        </div>
      </section>

      <section id="inclusions" className="hs-section">
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
      </section>

      <PackageBlock
        id="Honeymoon"
        title="Honeymoon packages"
        subtitle="Couples love these — high CTR ads land here."
        packages={honeymoonPkgs}
        onEnquire={setModalPkg}
      />
      <PackageBlock
        id="ManaliTour"
        title="Manali tour packages"
        subtitle="Solang, snow days & Kullu valley — dedicated Manali details."
        packages={manaliPkgs}
        onEnquire={setModalPkg}
      />
      <PackageBlock
        id="JibhiTour"
        title="Jibhi & Tirthan packages"
        subtitle="Quiet valley escapes — built for Jibhi keyword relevance."
        packages={jibhiPkgs}
        onEnquire={setModalPkg}
      />
      <PackageBlock
        id="ShimlaTour"
        title="Shimla tour packages"
        subtitle="Mall Road, Kufri & classic hill-station itineraries."
        packages={shimlaPkgs}
        onEnquire={setModalPkg}
      />

      <section id="packages" className="hs-section hs-muted">
        <h2>All Himachal packages</h2>
        <p className="hs-lead">Group tours, Dharamshala & Dalhousie options too.</p>
        <div className="hs-pkg-list">
          {HIMACHAL_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} onEnquire={setModalPkg} />
          ))}
        </div>
      </section>

      <section id="reviews" className="hs-section">
        <h2>Honeymooners & travellers love us</h2>
        <p className="hs-lead">Specific social proof — not generic star spam.</p>
        <div className="hs-reviews">
          {HIMACHAL_TESTIMONIALS.map((t) => (
            <figure key={t.name} className="hs-review">
              <div className="hs-review-avatar" aria-hidden>
                {t.name
                  .split("&")[0]
                  .trim()
                  .slice(0, 1)}
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
      </section>

      <section className="hs-section hs-muted" id="faq">
        <h2>FAQs</h2>
        <div className="hs-faq">
          {HIMACHAL_FAQS.map((f, i) => (
            <div key={f.q} className="hs-faq-item">
              <button
                type="button"
                className="hs-faq-btn"
                aria-expanded={faqOpen === i}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                {f.q}
                <span aria-hidden>{faqOpen === i ? "−" : "+"}</span>
              </button>
              {faqOpen === i ? <p className="hs-faq-a">{f.a}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <footer className="hs-footer">
        <p>
          <strong>Uno Trips</strong> · Himachal tour packages
        </p>
        <p>
          <a href={`tel:${PHONE}`}>{HIMACHAL_ADS.phoneDisplay}</a>
          {" · "}
          <a href={WA} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </p>
      </footer>

      <div className="hs-sticky" role="region" aria-label="Quick actions">
        <a className="hs-sticky-call" href={`tel:${PHONE}`}>
          Call Now
        </a>
        <button type="button" className="hs-sticky-quote" onClick={() => setModalPkg(h1)}>
          Get a Quote
        </button>
      </div>

      {modalPkg ? (
        <div className="hs-modal" role="dialog" aria-modal="true" aria-label="Get a quote">
          <div className="hs-modal-backdrop" onClick={() => setModalPkg(null)} />
          <div className="hs-modal-card">
            <h2>Get your free Himachal quote</h2>
            <p className="hs-modal-pkg">{modalPkg}</p>
            <LeadForm packageTitle={modalPkg} onClose={() => setModalPkg(null)} />
          </div>
        </div>
      ) : null}
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
  subtitle: string;
  packages: HimachalPackage[];
  onEnquire: (title: string) => void;
}) {
  if (!packages.length) return null;
  return (
    <section id={id} className="hs-section">
      <h2>{title}</h2>
      <p className="hs-lead">{subtitle}</p>
      <div className="hs-pkg-list">
        {packages.map((pkg) => (
          <PackageCard key={`${id}-${pkg.id}`} pkg={pkg} onEnquire={onEnquire} />
        ))}
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
  return (
    <article className="hs-pkg">
      <div className="hs-pkg-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image}
          alt={pkg.title}
          width={640}
          height={420}
          loading="lazy"
          decoding="async"
        />
        {pkg.trending ? <span className="hs-badge">Trending</span> : null}
      </div>
      <div className="hs-pkg-body">
        <p className="hs-pkg-meta">
          {pkg.duration} · {pkg.route.join(" → ")}
        </p>
        <h3>{pkg.title}</h3>
        <ul className="hs-pkg-incl">
          <li>Stay</li>
          <li>Breakfast</li>
          <li>Transfers</li>
          <li>Sightseeing</li>
        </ul>
        <ItineraryAccordion pkg={pkg} />
        <div className="hs-pkg-actions">
          <a className="hs-btn hs-btn-wa" href={WA} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a className="hs-btn hs-btn-ghost" href={`tel:${PHONE}`}>
            Call
          </a>
          <button type="button" className="hs-btn hs-btn-primary" onClick={() => onEnquire(pkg.title)}>
            Enquire
          </button>
        </div>
      </div>
    </article>
  );
}
