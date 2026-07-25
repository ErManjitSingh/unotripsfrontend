"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LEH_ADS, LEH_TESTIMONIALS, resolveLehAdsH1 } from "@/lib/meta/leh-tour-data";
import {
  LEH_CRO, LEH_TRUST_STRIP, LEH_TRUST_CARDS, LEH_PACKAGES_ENRICHED,
  LEH_SAMPLE_ITINERARY, LEH_HOTELS, LEH_CABS, LEH_INCLUDED, LEH_EXCLUDED,
  LEH_WHY, LEH_GALLERY, LEH_FAQS,
} from "@/lib/meta/leh-ads-content";
import { trackHimachalAdsConversion } from "@/lib/meta/himachal-ads-conversion";
import { LehDeferredChatbot } from "./leh-deferred-chatbot";

type FormProps = { packageTitle?: string; onSuccess?: () => void };
const WA = `https://wa.me/${LEH_ADS.whatsapp}?text=${encodeURIComponent("Hi, I would like a free quote for a Leh Ladakh trip.")}`;
const HERO = "/meta/leh_tour_package/hero";
const PKG_VISIBLE = 4;

function LeadForm({ packageTitle = "Leh Ladakh Tour Package", onSuccess }: FormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const id = useId();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").replace(/\D/g, "").slice(-10);
    if (!name) return setError("Please enter your name.");
    if (phone.length !== 10) return setError("Enter a valid 10-digit phone number.");
    setError("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/meta/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name, phone, destination: "Leh Ladakh", package: packageTitle,
            travelMonth: String(form.get("month") || ""), travellers: String(form.get("travellers") || ""),
            landingPage: LEH_ADS.landingPage, captureType: "form",
            message: "Leh Ladakh Google Ads CRO enquiry",
          }),
        });
        const data = (await response.json()) as { success?: boolean; message?: string };
        if (!response.ok || !data.success) return setError(data.message || "We could not send your enquiry. Please call us.");
        trackHimachalAdsConversion({ phone });
        onSuccess?.();
        router.push(`${LEH_ADS.path}/thank-you`);
      } catch {
        setError("Network error. Please call or WhatsApp us.");
      }
    });
  };

  return (
    <form className="leh-form" onSubmit={submit} noValidate>
      <label htmlFor={`${id}-name`} className="sr-only">Name</label>
      <input id={`${id}-name`} name="name" required autoComplete="name" placeholder="Your name *" />
      <label htmlFor={`${id}-phone`} className="sr-only">Phone number</label>
      <input id={`${id}-phone`} name="phone" required inputMode="numeric" autoComplete="tel" placeholder="10-digit phone number *" />
      <select name="month" aria-label="Travel month" defaultValue="">
        <option value="" disabled>Travel month</option>
        <option>May - June</option><option>July - August</option><option>September - October</option><option>Not decided yet</option>
      </select>
      <select name="travellers" aria-label="Number of travellers" defaultValue="">
        <option value="" disabled>Travellers</option>
        <option>1 Traveller</option><option>2 Travellers</option><option>3 - 5 Travellers</option><option>6+ Travellers</option>
      </select>
      {error ? <p className="leh-form-error" role="alert">{error}</p> : null}
      <button className="leh-btn leh-btn-primary" disabled={pending} type="submit">{pending ? "Sending..." : "Get Free Quote"}</button>
      <p className="leh-form-note">Free consultation · No spam · Quick WhatsApp response</p>
    </form>
  );
}

function PackageCard({ pkg, quote, eager }: { pkg: (typeof LEH_PACKAGES_ENRICHED)[number]; quote: (title: string) => void; eager?: boolean }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <article className="leh-card leh-package" id={pkg.anchor}>
      <div className="leh-package-media">
        <img src={pkg.image} alt={pkg.title} width={640} height={360} loading={eager ? "eager" : "lazy"} decoding="async" />
        <span className="leh-discount">Save {pkg.discountPct}%</span>
        <span className="leh-seats">Only {pkg.seatsLeft} seats left</span>
      </div>
      <div className="leh-package-body">
        <p className="leh-meta">{pkg.duration} · {pkg.locationLine}</p>
        <h3>{pkg.title}</h3>
        <div className="leh-tags">
          {pkg.route.map((route) => <span className="leh-tag" key={route}>{route}</span>)}
          {pkg.focus.map((tag) => <span className="leh-tag" key={tag}>{tag}</span>)}
        </div>
        <div className="leh-specs"><span>🏨 {pkg.hotelLabel}</span><span>☕ {pkg.breakfastLabel}</span><span>🚕 {pkg.transferLabel}</span></div>
        <div className="leh-package-price"><strong>{pkg.priceFrom}</strong><del>{pkg.wasPrice}</del><small>/ person</small></div>
        <div className="leh-card-actions">
          <button className="leh-btn leh-btn-primary" type="button" onClick={() => quote(pkg.title)}>Book Now</button>
          <button className="leh-btn" type="button" onClick={() => quote(pkg.title)}>Get Quote</button>
        </div>
        <div className="leh-details">
          <button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
            {open ? "Hide" : "View"} sample itinerary ↓
          </button>
          {open ? <ul id={panel}>{pkg.itinerary.map((day) => <li key={day}>{day}</li>)}</ul> : null}
        </div>
      </div>
    </article>
  );
}

export function LehTourLanding() {
  const searchParams = useSearchParams();
  const h1 = resolveLehAdsH1(searchParams.get("h1") || undefined, searchParams.get("headline") || undefined, searchParams.get("kw") || undefined);
  const [quoteFor, setQuoteFor] = useState<string | null>(null);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showExit, setShowExit] = useState(false);
  const [viewing, setViewing] = useState(14);
  const [remaining, setRemaining] = useState("--:--:--");
  const [pkgCount, setPkgCount] = useState(PKG_VISIBLE);
  const progressRef = useRef<HTMLDivElement>(null);

  const openQuote = (title = "Leh Ladakh Tour Package") => {
    setQuoteFor(title);
    window.setTimeout(() => document.getElementById("leh-quote")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max ? (window.scrollY / max) * 100 : 0;
        if (progressRef.current) progressRef.current.style.width = `${pct}%`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      let ms = end.getTime() - now.getTime();
      if (ms > 6 * 3600000) ms = 6 * 3600000;
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setViewing(8 + Math.floor(Math.random() * 17)), 9000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("leh-exit")) {
        sessionStorage.setItem("leh-exit", "1");
        setShowExit(true);
      }
    };
    document.addEventListener("mouseout", handleLeave);
    return () => document.removeEventListener("mouseout", handleLeave);
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightbox || showExit ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox, showExit]);

  const visiblePackages = LEH_PACKAGES_ENRICHED.slice(0, pkgCount);

  return (
    <main className="leh-root">
      <div className="leh-progress" ref={progressRef} aria-hidden />
      <header className="leh-header">
        <div className="leh-container leh-header-in">
          <a href={LEH_ADS.path} className="leh-logo" aria-label="Uno Trips home">UNO <b>TRIPS</b></a>
          <a className="leh-call" href={`tel:${LEH_ADS.phoneTel}`}>☎ Call {LEH_ADS.phoneDisplay}</a>
        </div>
      </header>

      <section className="leh-hero">
        <picture>
          <source srcSet={`${HERO}.webp`} type="image/webp" />
          <img className="leh-hero-bg" src={`${HERO}.jpg`} alt="Leh Ladakh mountains" width={1600} height={942} fetchPriority="high" decoding="async" />
        </picture>
        <div className="leh-hero-overlay" />
        <div className="leh-container leh-hero-in">
          <div>
            <span className="leh-kicker">Leh Ladakh 2026 · Local Himalayan Experts</span>
            <h1>{LEH_CRO.heroH1}</h1>
            <p className="leh-sub">{LEH_CRO.heroSub}</p>
            {h1 !== LEH_CRO.heroH1 ? <p className="leh-sub" style={{ opacity: 0.85, fontSize: "0.95rem" }}>{h1}</p> : null}
            <div className="leh-price">
              <div><small>Starting from</small><strong>{LEH_CRO.startingFrom}</strong></div>
              <small>per person · twin sharing</small>
            </div>
            <div className="leh-offers">
              <span className="leh-badge">{LEH_CRO.saveBadge}</span>
              <span className="leh-badge">{LEH_CRO.offerBadge}</span>
            </div>
            <p className="leh-countdown">Offer ends in {remaining} · {viewing} people viewing this page</p>
            <div className="leh-trust-row">
              {LEH_TRUST_STRIP.map((item) => <span key={item.label}><b>{item.label}</b>{item.sub}</span>)}
            </div>
            <div className="leh-actions">
              <button type="button" className="leh-btn leh-btn-primary" onClick={() => openQuote()}>Get Free Quote</button>
              <a className="leh-btn leh-btn-wa" href={WA} target="_blank" rel="noreferrer">WhatsApp Expert</a>
              <a className="leh-btn leh-btn-outline" href={`tel:${LEH_ADS.phoneTel}`}>Call Now</a>
            </div>
          </div>
          <aside className="leh-form-card" id="leh-quote">
            <h2>Plan your Ladakh escape</h2>
            <p>Get a tailored itinerary and exact quote in minutes.</p>
            <LeadForm packageTitle={quoteFor || "Leh Ladakh Tour Package"} />
          </aside>
        </div>
      </section>

      <section className="leh-section leh-section-trust">
        <div className="leh-trust-scroll" aria-label="Trust highlights">
          <div className="leh-trust-cards">
            {LEH_TRUST_CARDS.map((item) => (
              <div className="leh-card leh-trust-card" key={item.label}>
                <i>{item.icon === "star" ? "★" : item.icon === "shield" ? "◈" : "✦"}</i>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="leh-section leh-cv" id="packages">
        <div className="leh-container">
          <div className="leh-heading">
            <h2>Choose your Leh Ladakh package</h2>
            <p>Transparent prices, handpicked stays and routes designed around acclimatisation.</p>
          </div>
          <div className="leh-packages">
            {visiblePackages.map((pkg, i) => (
              <PackageCard pkg={pkg} quote={openQuote} key={pkg.id} eager={i === 0} />
            ))}
          </div>
          {pkgCount < LEH_PACKAGES_ENRICHED.length ? (
            <button className="leh-btn leh-btn-outline leh-show-more" type="button" onClick={() => setPkgCount(LEH_PACKAGES_ENRICHED.length)}>
              Show all {LEH_PACKAGES_ENRICHED.length} packages
            </button>
          ) : null}
        </div>
      </section>

      <section className="leh-section leh-section-dark leh-cv" id="itinerary">
        <div className="leh-container">
          <div className="leh-heading">
            <h2>Your Ladakh journey, day by day</h2>
            <p>A sample 6-day route. We adapt it to your pace, dates and group.</p>
          </div>
          <div className="leh-timeline">
            {LEH_SAMPLE_ITINERARY.slice(0, itineraryOpen ? undefined : 3).map((day) => (
              <div className="leh-day" key={day.day}>
                <div className="leh-day-num">{day.day}</div>
                <article><h3>{day.title}</h3><p>{day.detail}</p></article>
              </div>
            ))}
          </div>
          <button className="leh-btn leh-btn-outline leh-show-more" type="button" onClick={() => setItineraryOpen(!itineraryOpen)}>
            {itineraryOpen ? "Show less" : "View full itinerary"}
          </button>
        </div>
      </section>

      <section className="leh-section leh-cv">
        <div className="leh-container">
          <div className="leh-heading"><h2>Stays selected for comfort</h2><p>Quality hotels, camps and cottages — or similar, based on your chosen plan.</p></div>
          <div className="leh-hotel-grid">
            {LEH_HOTELS.map((hotel) => (
              <article className="leh-card leh-photo-card" key={hotel.name}>
                <img src={hotel.image} alt={hotel.name} width={480} height={270} loading="lazy" decoding="async" />
                <div><h3>{hotel.name}</h3><p>★ {hotel.rating} · {hotel.room}</p><p>{hotel.amenities.join(" · ")}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="leh-section leh-cv">
        <div className="leh-container">
          <div className="leh-heading"><h2>Private cabs for every group</h2><p>Experienced high-pass drivers and vehicles matched to your group size.</p></div>
          <div className="leh-cab-grid">
            {LEH_CABS.map((cab) => (
              <article className="leh-card leh-photo-card" key={cab.name}>
                <img src={cab.image} alt={cab.name} width={480} height={270} loading="lazy" decoding="async" />
                <div><h3>{cab.name}</h3><p>{cab.type} · {cab.seats} seats</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="leh-section leh-cv">
        <div className="leh-container leh-split">
          <article className="leh-card leh-list-card"><h2>Included in your trip</h2><ul className="leh-check-list leh-included">{LEH_INCLUDED.map((x) => <li key={x.label}>{x.label}</li>)}</ul></article>
          <article className="leh-card leh-list-card"><h2>Not included</h2><ul className="leh-check-list leh-excluded">{LEH_EXCLUDED.map((x) => <li key={x}>{x}</li>)}</ul></article>
        </div>
      </section>

      <section className="leh-section leh-cv">
        <div className="leh-container">
          <div className="leh-heading"><h2>Why travel with Uno Trips</h2><p>Expert planning before you leave and calm support while you are on the road.</p></div>
          <div className="leh-why-grid">
            {LEH_WHY.map((item, i) => (
              <article className="leh-card leh-why" key={item.title}><span>0{i + 1}</span><h3>{item.title}</h3><p>{item.desc}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="leh-section leh-section-dark leh-cv">
        <div className="leh-container">
          <div className="leh-heading"><h2>Rated 4.9 by travellers</h2><p>Real trip stories from family and adventure guests.</p></div>
          <div className="leh-review-grid">
            {LEH_TESTIMONIALS.map((review) => (
              <article className="leh-card leh-review" key={review.name}>
                <div className="leh-stars" aria-label={`${review.rating} stars`}>★★★★★</div>
                <blockquote>“{review.quote}”</blockquote>
                <cite><b>{review.name}</b> · {review.tag}</cite>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="leh-section leh-cv">
        <div className="leh-container">
          <div className="leh-heading"><h2>See Ladakh before you go</h2><p>Tap a photograph to view it closer.</p></div>
          <div className="leh-gallery">
            {LEH_GALLERY.map((image, i) => (
              <button type="button" key={image} onClick={() => setLightbox(image)} aria-label={`View Ladakh photo ${i + 1}`}>
                <img src={image} alt={`Leh Ladakh travel experience ${i + 1}`} width={400} height={280} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="leh-section leh-cv" id="faq">
        <div className="leh-container">
          <div className="leh-heading"><h2>Leh Ladakh trip FAQs</h2><p>Answers before you request your itinerary.</p></div>
          <div className="leh-faq">
            {LEH_FAQS.map((item, i) => (
              <div className="leh-faq-item" key={item.q}>
                <button type="button" aria-expanded={faq === i} aria-controls={`leh-faq-${i}`} onClick={() => setFaq(faq === i ? null : i)}>
                  {item.q}<span>{faq === i ? "−" : "+"}</span>
                </button>
                {faq === i ? <p id={`leh-faq-${i}`}>{item.a}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="leh-footer">
        <div className="leh-container">
          <h2>Ready for your Ladakh story?</h2>
          <p>Get a clear, custom quote from a local trip expert today.</p>
          <div className="leh-actions">
            <button className="leh-btn leh-btn-primary" type="button" onClick={() => openQuote()}>Get My Free Quote</button>
            <a className="leh-btn leh-btn-outline" href={`tel:${LEH_ADS.phoneTel}`}>Call {LEH_ADS.phoneDisplay}</a>
          </div>
          <p className="leh-reg">Tourism Registration: {LEH_ADS.tourismReg} · GSTIN: {LEH_ADS.gstin}</p>
          <p className="leh-reg">© {new Date().getFullYear()} Uno Trips. All prices subject to availability.</p>
        </div>
      </footer>

      <div className="leh-mobile-bar" role="navigation" aria-label="Quick actions">
        <a href={`tel:${LEH_ADS.phoneTel}`}>Call</a>
        <a href={WA} target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" onClick={() => openQuote()}>Get Quote</button>
      </div>
      <div className="leh-float">
        <a href={WA} target="_blank" rel="noreferrer">WhatsApp Expert</a>
        <a href={`tel:${LEH_ADS.phoneTel}`}>Call Now</a>
      </div>

      {lightbox ? (
        <div className="leh-modal leh-lightbox" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Leh Ladakh enlarged travel view" />
        </div>
      ) : null}

      {showExit ? (
        <div className="leh-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div className="leh-modal-panel">
            <button type="button" className="leh-close" onClick={() => setShowExit(false)} aria-label="Close">×</button>
            <h2 id="exit-title">Before you go — get today&apos;s offer</h2>
            <p>Leave your details and a Ladakh expert will send a tailored quote.</p>
            <LeadForm packageTitle="Exit offer — Leh Ladakh" onSuccess={() => setShowExit(false)} />
          </div>
        </div>
      ) : null}

      <LehDeferredChatbot />
    </main>
  );
}
