import { createWriteStream, existsSync, mkdirSync, copyFileSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "meta", "gujarat");
const imgDir = join(outDir, "img");
const assamDir = join(root, "meta", "assam");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; UNOTripsBot/1.0)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchText(new URL(res.headers.location, url).href).then(resolve, reject);
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);
    lib
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          return download(new URL(res.headers.location, url).href, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", (err) => {
        file.close();
        reject(err);
      });
  });
}

function absUrl(src, base) {
  if (!src || src.startsWith("data:")) return null;
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

function safeName(url, i) {
  try {
    const u = new URL(url);
    let name = basename(u.pathname).replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!name || name === "_" || name.length < 3) name = `img_${i}.jpg`;
    if (!extname(name)) name += ".jpg";
    return name.slice(0, 80);
  } catch {
    return `img_${i}.jpg`;
  }
}

const packages = [
  {
    title: "Dwarka Somnath Tour Package",
    route: "Ahmedabad → Dwarka → Beyt Dwarka → Porbandar",
    duration: "5D / 4N",
    price: "10,500",
    oldPrice: "12,075",
    badge: "Most Popular",
    badgeClass: "badge-popular",
    seats: "Only 8 left!",
    highlights: ["Dwarkadhish Temple", "Beyt Dwarka", "Porbandar visit", "AC cab & 3-star stay"],
  },
  {
    title: "Statue of Unity Tour Package",
    route: "Ekta Nagar → Statue of Unity → Vadodara → Kevadiya",
    duration: "3D / 2N",
    price: "8,000",
    oldPrice: "9,200",
    badge: "Best Value",
    badgeClass: "badge-value",
    seats: "Only 12 left!",
    highlights: ["World's tallest statue", "Valley of Flowers", "Laser show", "AC cab & hotel"],
  },
  {
    title: "Rann Utsav Tour Package",
    route: "Bhuj → Rann Utsav → Mandvi → Bhuj",
    duration: "2D / 1N",
    price: "13,000",
    oldPrice: "14,950",
    badge: "Seasonal",
    badgeClass: "badge-unique",
    seats: "Only 6 left!",
    highlights: ["White salt desert", "Cultural evenings", "Mandvi beach", "Tent stay options"],
  },
  {
    title: "Gujarat Temple Tour Package",
    route: "Ahmedabad → Dwarka → Porbandar → Somnath → Diu → Gir",
    duration: "8D / 7N",
    price: "17,500",
    oldPrice: "20,125",
    badge: "Pilgrimage",
    badgeClass: "badge-romantic",
    seats: "Only 10 left!",
    highlights: ["Dwarka & Somnath", "Porbandar & Diu", "Sasan Gir", "Full spiritual circuit"],
  },
  {
    title: "Somnath Porbandar Dwarka Tour",
    route: "Ahmedabad → Dwarka → Porbandar → Somnath",
    duration: "5D / 4N",
    price: "11,500",
    oldPrice: "13,225",
    badge: "Classic",
    badgeClass: "badge-value",
    seats: "Only 9 left!",
    highlights: ["Somnath Jyotirlinga", "Dwarkadhish Temple", "Porbandar heritage", "Comfortable hotels"],
  },
  {
    title: "Gujarat With Diu Tour Package",
    route: "Ahmedabad → Dwarka → Somnath → Diu → Gir → Gondal",
    duration: "8D / 7N",
    price: "17,500",
    oldPrice: "20,125",
    badge: "Beach + Temple",
    badgeClass: "badge-unique",
    seats: "Only 7 left!",
    highlights: ["Diu beaches", "Temple circuit", "Gir wildlife", "Gondal heritage"],
  },
  {
    title: "Gujarat Panch Dwarka Package",
    route: "Ahmedabad → Dakor → Lothal → Somnath → Virpur → Gondal",
    duration: "9D / 8N",
    price: "22,000",
    oldPrice: "25,300",
    badge: "Premium",
    badgeClass: "badge-premium",
    seats: "Only 5 left!",
    highlights: ["Panch Dwarka circuit", "Lothal heritage", "Somnath darshan", "Extended itinerary"],
  },
  {
    title: "Saurashtra Tour Package",
    route: "Ahmedabad → Statue of Unity → Somnath → Diu → Gir",
    duration: "6D / 5N",
    price: "13,500",
    oldPrice: "15,525",
    badge: "Best Seller",
    badgeClass: "badge-popular",
    seats: "Only 11 left!",
    highlights: ["Statue of Unity", "Somnath & Diu", "Sasan Gir", "Junagadh"],
  },
  {
    title: "Wildlife And Beach Of Gujarat",
    route: "Ahmedabad → Sasan Gir → Diu → Ahmedabad",
    duration: "5D / 4N",
    price: "14,000",
    oldPrice: "16,100",
    badge: "Wildlife Special",
    badgeClass: "badge-wildlife",
    seats: "Only 8 left!",
    highlights: ["Asiatic lion safari", "Diu beaches", "Nature trails", "Resort stays"],
  },
  {
    title: "Sizzling Kutch Tour Package",
    route: "Ahmedabad → Little Rann of Kutch → Bhuj",
    duration: "8D / 7N",
    price: "22,500",
    oldPrice: "25,875",
    badge: "Desert",
    badgeClass: "badge-unique",
    seats: "Only 4 left!",
    highlights: ["Little Rann safari", "Bhuj markets", "Kutchi villages", "Handicrafts"],
  },
  {
    title: "Gujarat Triangle Tour",
    route: "Ahmedabad → Dwarka → Bet Dwarka → Somnath",
    duration: "5D / 4N",
    price: "11,500",
    oldPrice: "13,225",
    badge: "Quick Trip",
    badgeClass: "badge-value",
    seats: "Only 14 left!",
    highlights: ["Dwarka darshan", "Bet Dwarka", "Somnath Temple", "Ideal short circuit"],
  },
  {
    title: "Dwarka Somnath Gir Diu Tour",
    route: "Ahmedabad → Dwarka → Somnath → Diu → Gir → Junagadh",
    duration: "8D / 7N",
    price: "18,500",
    oldPrice: "21,275",
    badge: "Complete",
    badgeClass: "badge-premium",
    seats: "Only 6 left!",
    highlights: ["Full Saurashtra loop", "Temples + beach", "Gir safari", "Junagadh forts"],
  },
];

async function main() {
  mkdirSync(imgDir, { recursive: true });

  // Copy shared assets from assam
  copyFileSync(join(assamDir, "style.css"), join(outDir, "style.css"));
  copyFileSync(join(assamDir, "mail_smtp.php"), join(outDir, "mail_smtp.php"));
  if (existsSync(join(assamDir, "img", "logo.png"))) {
    copyFileSync(join(assamDir, "img", "logo.png"), join(imgDir, "logo.png"));
  }
  if (existsSync(join(assamDir, "vendor"))) {
    cpSync(join(assamDir, "vendor"), join(outDir, "vendor"), { recursive: true });
  }

  console.log("Fetching gujarattrips.com ...");
  const html = await fetchText("https://www.gujarattrips.com/");
  const srcs = [...html.matchAll(/(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)].map((m) => m[1]);
  const bgUrls = [...html.matchAll(/url\((['"]?)([^'")]+)\1\)/gi)].map((m) => m[2]);
  const all = [...srcs, ...bgUrls]
    .map((s) => absUrl(s, "https://www.gujarattrips.com/"))
    .filter((u) => u && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u) && !/logo|icon|sprite|favicon|flag|payment|whatsapp|facebook|instagram|twitter|youtube|linkedin/i.test(u));

  const unique = [...new Set(all)];
  console.log(`Found ${unique.length} images`);

  const localImgs = [];
  for (let i = 0; i < unique.length && localImgs.length < 20; i++) {
    const url = unique[i];
    const name = `gt_${String(localImgs.length + 1).padStart(2, "0")}_${safeName(url, i)}`;
    const dest = join(imgDir, name);
    try {
      await download(url, dest);
      localImgs.push(`img/${name}`);
      console.log("  ok", name);
    } catch (e) {
      console.log("  skip", url, e.message);
    }
  }

  // Fallback hero/highlight images if scrape fails
  const fallbacks = [
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&q=80",
    "https://images.unsplash.com/photo-1524492412937-280b9d78d25d?w=800&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  ];
  while (localImgs.length < 8) {
    const url = fallbacks[localImgs.length % fallbacks.length];
    const name = `fallback_${localImgs.length + 1}.jpg`;
    const dest = join(imgDir, name);
    try {
      await download(url, dest);
      localImgs.push(`img/${name}`);
    } catch {
      localImgs.push(url);
      break;
    }
  }

  const heroImg = localImgs[0];
  const highlightImgs = localImgs.slice(1, 5);
  const pkgImgs = packages.map((_, i) => localImgs[i % localImgs.length]);

  // Append price styles
  let css = readFileSync(join(outDir, "style.css"), "utf8");
  if (!css.includes(".pkg-price")) {
    css += `
.pkg-price { display: flex; align-items: baseline; gap: 8px; margin: 10px 0 12px; flex-wrap: wrap; }
.pkg-price .now { font-size: 1.35rem; font-weight: 800; color: var(--orange-dark); }
.pkg-price .old { font-size: 0.95rem; color: var(--muted); text-decoration: line-through; }
.pkg-price .unit { font-size: 0.8rem; color: var(--muted); }
.pkg-route { font-size: 0.85rem; color: var(--muted); margin: 0 0 8px; line-height: 1.4; }
.pkg-off { display: inline-block; background: #dc2626; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-bottom: 6px; }
`;
    writeFileSync(join(outDir, "style.css"), css);
  }

  const pkgCards = packages
    .map((p, i) => {
      const img = pkgImgs[i];
      const highlights = p.highlights.map((h) => `<li>${h}</li>`).join("");
      return `        <article class="pkg-card">
          <div class="pkg-img-wrap">
            <img src="${img}" alt="${p.title}" loading="lazy" />
            <span class="pkg-badge ${p.badgeClass}">${p.badge}</span><span class="pkg-seats">${p.seats}</span>
          </div>
          <div class="pkg-body">
            <span class="pkg-off">15% Off</span>
            <p class="pkg-duration">${p.duration} · AC Cab · 3-Star Hotel</p>
            <h3 class="pkg-title">${p.title}</h3>
            <p class="pkg-route">${p.route}</p>
            <ul class="pkg-highlights">${highlights}</ul>
            <div class="pkg-price"><span class="now">₹${p.price}</span><span class="old">₹${p.oldPrice}</span><span class="unit">/ Person</span></div>
            <div class="pkg-includes"><span>3 Stars</span><span>Sightseeing</span><span>Breakfast</span><span>Transfers</span><span>Stay</span></div>
            <button type="button" class="btn-primary pkg-quote-btn" data-package="${p.title}">Get Customized Quote</button>
          </div>
        </article>`;
    })
    .join("\n");

  const indexHtml = `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gujarat Tour Packages 2026 | Dwarka, Somnath, Gir & Rann — UNO Trips</title>
  <meta name="description" content="Book Gujarat tour packages — Dwarka Somnath, Statue of Unity, Gir safari, Rann of Kutch. Up to 15% OFF. Free quote in 30 mins." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://unotrips.com/meta/gujarat/" />
  <meta property="og:title" content="Gujarat Tour Packages 2026 | UNO Trips" />
  <meta property="og:description" content="Explore Dwarka, Somnath, Gir & Rann of Kutch. Summer deals up to 15% OFF." />
  <meta property="og:url" content="https://unotrips.com/meta/gujarat/" />
  <meta property="og:image" content="https://unotrips.com/meta/gujarat/${heroImg}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17928878008"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-17928878008');</script>
</head>
<body>
  <div class="flash-ticker">
    <span class="flash-dot"></span>
    FLASH SALE ENDS SOON! Call Now — Up to 15% OFF Gujarat Packages
    <a href="tel:+917876505119">Call Now</a>
  </div>

  <div class="trust-bar">
    <span>4.7/5 Rated</span><span class="sep">|</span>
    <span>5,000+ Happy Travelers</span><span class="sep">|</span>
    <span>10+ Years Experience</span>
  </div>

  <header class="site-header">
    <div class="container header-inner">
      <a href="https://unotrips.com/meta/gujarat/" class="logo-link">
        <img src="img/logo.png" alt="UNO Trips" class="logo" />
      </a>
      <nav class="header-nav hide-mobile">
        <a href="#packages">Packages</a>
        <a href="#about">About</a>
        <a href="#reviews">Reviews</a>
      </nav>
      <div class="header-badges hide-mobile">
        <span>Best Price Guarantee</span>
        <span>24/7 Support</span>
        <span>Free Cancellation</span>
      </div>
      <button type="button" class="btn-primary btn-sm open-quote">Get Free Quote</button>
    </div>
  </header>

  <section class="hero" id="top">
    <div class="hero-bg">
      <img src="${heroImg}" alt="Gujarat tour — Dwarka Somnath and Rann of Kutch" fetchpriority="high" />
      <div class="hero-overlay"></div>
    </div>
    <div class="container hero-grid">
      <div class="hero-content">
        <span class="hero-sale-badge">FLASH SALE — UP TO 15% OFF!</span>
        <h1>Explore Incredible Gujarat<br /><span>Dwarka, Somnath, Gir &amp; Rann of Kutch</span></h1>
        <p class="hero-lead">Spiritual circuits, Asiatic lions, white salt desert, and heritage cities — <strong>Gujarat is calling you!</strong> Let our experts craft your perfect tour.</p>
        <div class="hero-tags hide-mobile">
          <span>Dwarka Somnath</span><span>Statue of Unity</span><span>Gir Safari</span><span>Rann Utsav</span><span>Diu Beaches</span>
        </div>
        <div class="review-row">
          <div class="review-pill"><strong>4.7</strong><span>213+ · Reviews</span></div>
          <div class="review-pill"><strong>4.9</strong><span>2,100+ · Google</span></div>
          <div class="review-pill"><strong>4.8</strong><span>1,800+ · TripAdvisor</span></div>
        </div>
        <p class="seats-alert">Only <strong>12 Seats Left</strong> for this season!</p>
      </div>
      <div class="hero-form-card" id="quote-form">
        <h2>Get Your FREE Quote</h2>
        <p class="form-sub">Expert callback within 30 minutes!</p>
        <p class="credit-line"><strong>Redeem credits</strong> — Get up to <strong>₹8,000 OFF</strong>!</p>
        <form id="lead-form" class="lead-form">
          <label>Full Name *<input type="text" name="name" required placeholder="Your full name" /></label>
          <label>WhatsApp / Mobile Number *<input type="tel" name="phone" required placeholder="10-digit mobile" /></label>
          <label>Email Address<input type="email" name="email" placeholder="you@email.com" /></label>
          <label>Travellers
            <select name="travellers">
              <option value="">Select</option>
              <option>1 Person</option><option>2 People</option><option>3 People</option>
              <option>4 People</option><option>5 People</option><option>6–10 People</option><option>10+ People</option>
            </select>
          </label>
          <label>Travel Date<input type="date" name="travel_date" /></label>
          <fieldset class="ticket-fieldset">
            <legend>Flight / Train Ticket Booked?</legend>
            <label class="radio-label"><input type="radio" name="ticket" value="Yes" /> Yes</label>
            <label class="radio-label"><input type="radio" name="ticket" value="No" checked /> No</label>
          </fieldset>
          <input type="hidden" name="package" id="form-package" value="" />
          <button type="submit" class="btn-primary btn-block">Get FREE Customized Quote</button>
          <p class="form-foot">No Spam · 100% Free · Expert Callback in 30 mins</p>
        </form>
      </div>
    </div>
  </section>

  <section class="stats-section">
    <div class="container stats-grid">
      <div><strong>5,000+</strong><span>Happy Travelers</span></div>
      <div><strong>150+</strong><span>Ground Team Members</span></div>
      <div><strong>500+</strong><span>Trusted Suppliers</span></div>
      <div><strong>10+</strong><span>Years of Excellence</span></div>
    </div>
  </section>

  <section class="about-section" id="about">
    <div class="container">
      <p class="section-label">Discover</p>
      <h2 class="section-title">Your Gateway to Spiritual &amp; Cultural Gujarat</h2>
      <p class="section-text">Gujarat is a large state — covering <strong>Dwarka, Somnath, Gir National Park</strong>, and the <strong>Rann of Kutch</strong> needs proper route planning and timing. We design itineraries that balance travel distance, sightseeing, and comfort.</p>
      <p class="section-text">From short 3-day trips to detailed 8–9 day circuits, you get private transport, hotel stays, and complete on-ground support — practical plans, not rushed ones.</p>
      <div class="highlight-grid">
        <div class="highlight-card"><img src="${highlightImgs[0] || heroImg}" alt="Rann of Kutch" /><h3>Desert Experience</h3><p>White salt desert &amp; Rann Utsav</p></div>
        <div class="highlight-card"><img src="${highlightImgs[1] || heroImg}" alt="Dwarka Somnath" /><h3>Spiritual Circuit</h3><p>Dwarka, Somnath &amp; Jyotirlingas</p></div>
        <div class="highlight-card"><img src="${highlightImgs[2] || heroImg}" alt="Gir National Park" /><h3>Wildlife &amp; Nature</h3><p>Asiatic lions at Gir</p></div>
        <div class="highlight-card"><img src="${highlightImgs[3] || heroImg}" alt="Gujarat heritage" /><h3>Heritage</h3><p>Rani ki Vav &amp; Modhera Sun Temple</p></div>
      </div>
    </div>
  </section>

  <section class="packages-section" id="packages">
    <div class="container">
      <p class="section-label">Exclusive Deals</p>
      <h2 class="section-title">Best Gujarat Tour Packages</h2>
      <p class="sale-line">SUMMER HOLIDAYS — UP TO 15% OFF!</p>
      <div class="pkg-grid">
${pkgCards}
      </div>
    </div>
  </section>

  <section class="group-cta">
    <div class="container group-cta-inner">
      <div>
        <h2>Bigger Group? Exclusive Discounts Up to 65% OFF!</h2>
        <p>Planning for 10+ people? We specialize in corporate retreats, family reunions, and pilgrimage groups with unbeatable discounts!</p>
      </div>
      <a class="btn-whatsapp" href="https://wa.me/917876505119?text=Hi%20UNO%20Trips%2C%20I%20need%20a%20group%20quote%20for%20Gujarat%20tour." target="_blank" rel="noopener">Chat on WhatsApp for Group Deals</a>
    </div>
  </section>

  <section class="reviews-section" id="reviews">
    <div class="container">
      <p class="section-label">Real Stories</p>
      <h2 class="section-title">See What Our Happy Travelers Say!</h2>
      <p class="section-text center">Real experiences — discover why thousands love our Gujarat packages!</p>
      <div class="testimonial-grid">
        <div class="testimonial-card"><div class="t-avatar">RS</div><h3>Ravi Shah</h3><p>Ahmedabad · Verified</p><p class="t-quote">"Dwarka Somnath trip was seamless. Hotels, cab, and darshan timings — all perfect."</p></div>
        <div class="testimonial-card"><div class="t-avatar">PM</div><h3>Priya Mehta</h3><p>Mumbai · Verified</p><p class="t-quote">"Gir safari and Diu beaches in one package. Kids loved it. Highly recommend UNO Trips!"</p></div>
        <div class="testimonial-card"><div class="t-avatar">AK</div><h3>Ankit &amp; Family</h3><p>Delhi · Verified</p><p class="t-quote">"Rann Utsav was magical. White desert at night is unforgettable."</p></div>
      </div>
      <div class="review-scores">
        <div><strong>4.7/5</strong><span>Package reviews · 213+</span></div>
        <div><strong>4.9/5</strong><span>Google · 2,100+ reviews</span></div>
        <div><strong>4.8/5</strong><span>TripAdvisor · 1,800+ reviews</span></div>
      </div>
    </div>
  </section>

  <section class="why-section">
    <div class="container">
      <h2 class="section-title center">Why Travelers Trust UNO Trips for Gujarat?</h2>
      <div class="why-grid">
        <div class="why-card"><h3>Customized Itineraries</h3><p>From 3-day Statue of Unity trips to 9-day Panch Dwarka circuits — tailored to your budget and dates.</p></div>
        <div class="why-card"><h3>Temple Timing Experts</h3><p>We plan around darshan timings, long routes, and local logistics so you never rush.</p></div>
        <div class="why-card"><h3>Comfortable Stays</h3><p>Handpicked 3-star hotels and resorts near major attractions for a relaxing stay.</p></div>
        <div class="why-card"><h3>Private AC Cab</h3><p>Door-to-door transfers across Saurashtra, Kutch, and Central Gujarat.</p></div>
        <div class="why-card"><h3>Best Price Guaranteed</h3><p>Competitive packages with transparent pricing — no hidden charges.</p></div>
        <div class="why-card"><h3>24/7 Travel Support</h3><p>Our team is available round the clock during your Gujarat trip.</p></div>
      </div>
    </div>
  </section>

  <section class="faq-section" id="faq">
    <div class="container">
      <h2 class="section-title center">Frequently Asked Questions</h2>
      <div class="faq-list">
        <div class="faq-item">
          <button type="button" class="faq-q" aria-expanded="false"><span>What is the best time to visit Gujarat?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="faq-a" hidden><p>October to March is ideal for temples, Gir safari, and Rann of Kutch. Rann Utsav typically runs from November to February.</p></div>
        </div>
        <div class="faq-item">
          <button type="button" class="faq-q" aria-expanded="false"><span>How many days are needed for a Gujarat trip?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="faq-a" hidden><p>A 5-day Dwarka–Somnath circuit covers the essentials. Add days for Gir, Diu, Statue of Unity, or Rann of Kutch for a fuller experience.</p></div>
        </div>
        <div class="faq-item">
          <button type="button" class="faq-q" aria-expanded="false"><span>Do you offer customized Gujarat tour packages?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="faq-a" hidden><p>Yes — every package is customizable: hotels, transport, sightseeing, and activities. Share your dates for a free tailored itinerary within 30 minutes.</p></div>
        </div>
        <div class="faq-item">
          <button type="button" class="faq-q" aria-expanded="false"><span>Is Gir safari included in packages?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="faq-a" hidden><p>Wildlife packages include Gir jeep safari permits (subject to availability). We book early to secure morning slots.</p></div>
        </div>
        <div class="faq-item">
          <button type="button" class="faq-q" aria-expanded="false"><span>What's included in the package price?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="faq-a" hidden><p>Typically: accommodation, breakfast, sightseeing, AC cab transfers, and guide support. Flights and personal expenses are quoted separately.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="final-cta">
    <div class="container final-cta-inner">
      <h2>Ready to Discover Incredible Gujarat?</h2>
      <p>Don't miss our FLASH SALE — Up to 15% OFF on all Gujarat tour packages!</p>
      <div class="countdown" id="countdown">
        <div><span id="cd-days">00</span><small>days</small></div>
        <div><span id="cd-hours">00</span><small>hours</small></div>
        <div><span id="cd-mins">00</span><small>minutes</small></div>
        <div><span id="cd-secs">00</span><small>seconds</small></div>
      </div>
      <p class="seats-alert center">Only <strong>12 seats</strong> remaining this season!</p>
      <button type="button" class="btn-primary btn-lg open-quote">Get FREE Custom Quote Now</button>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <img src="img/logo.png" alt="UNO Trips" class="logo footer-logo" />
        <p>India's most trusted tour operator with 150+ ground team members, 500+ suppliers, and 5,000+ happy travelers.</p>
        <p><a href="tel:+917876505119">+91-7876505119</a> · <a href="mailto:unotripsit@gmail.com">unotripsit@gmail.com</a></p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#packages">Gujarat Tour Packages</a></li>
          <li><a href="#about">About Gujarat</a></li>
          <li><a href="#reviews">Traveler Reviews</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h4>Popular Packages</h4>
        <ul>
          <li><a href="#packages">Dwarka Somnath Tour</a></li>
          <li><a href="#packages">Statue of Unity</a></li>
          <li><a href="#packages">Rann Utsav Package</a></li>
          <li><a href="#packages">Gir &amp; Diu Tour</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-copy">© 2026 UNO Trips. All rights reserved.</div>
  </footer>

  <div class="mobile-sticky">
    <a href="tel:+917876505119" class="sticky-call">Call Now</a>
    <button type="button" class="sticky-quote open-quote">Get Free Quote</button>
  </div>

  <script src="script.js"></script>
</body>
</html>
`;

  writeFileSync(join(outDir, "index.html"), indexHtml);

  writeFileSync(
    join(outDir, "script.js"),
    readFileSync(join(assamDir, "script.js"), "utf8")
      .replace("Assam & Meghalaya Lead", "Gujarat Lead")
      .replace("Assam Landing Page", "Gujarat Landing Page"),
  );

  writeFileSync(
    join(outDir, "send_lead.php"),
    readFileSync(join(assamDir, "send_lead.php"), "utf8")
      .replace(/Assam Lead/g, "Gujarat Lead")
      .replace(/Assam Landing Page/g, "Gujarat Landing Page"),
  );

  writeFileSync(
    join(outDir, "thank-you.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, follow" />
  <title>Thank You — UNO Trips Gujarat</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body style="padding: 40px 16px; text-align: center">
  <div class="hero-form-card" style="max-width: 480px; margin: 40px auto">
    <h2>Thank You!</h2>
    <p>Your Gujarat tour enquiry has been received. Our expert will call you within 30 minutes.</p>
    <a class="btn-primary" href="tel:+917876505119" style="display: inline-block; margin: 16px 8px; text-decoration: none">Call +91-7876505119</a>
    <a class="btn-primary" href="index.html" style="display: inline-block; margin: 16px 8px; text-decoration: none; background: #111">Back to Packages</a>
  </div>
</body>
</html>
`,
  );

  writeFileSync(
    join(outDir, "privacy.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Privacy — UNO Trips</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body style="padding: 24px; max-width: 720px; margin: 0 auto">
  <h1>Privacy Policy</h1>
  <p>We collect contact details only to respond to tour enquiries. We do not sell your data.</p>
  <p><a href="index.html">Back to Gujarat packages</a></p>
</body>
</html>
`,
  );

  console.log(`\nDone. Gujarat landing at meta/gujarat/ with ${localImgs.length} images and ${packages.length} packages.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
