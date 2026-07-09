<?php

use PHPMailer\PHPMailer\PHPMailer;

require 'vendor/autoload.php';
require_once __DIR__ . '/mail_smtp.php';

if (isset($_POST['submit'])) {




  $name = isset($_POST['namey']) ? trim($_POST['namey']) : '';
  $mobile = isset($_POST['phoney']) ? trim($_POST['phoney']) : '';
  $email = isset($_POST['emaily']) ? trim($_POST['emaily']) : '';
  $city = isset($_POST['cityy']) ? trim($_POST['cityy']) : '';
  $subject = isset($_POST['subjecty']) ? trim($_POST['subjecty']) : 'Kerala Tour Query';
  $packageTitle = isset($_POST['package-title']) ? trim($_POST['package-title']) : '';

  if (empty($name) || empty($mobile)) {
    echo "<script>alert('Please enter your name and phone number.');</script>";
    exit();
  }

  $message = $name . " wrote the following details:" . "\n" . "Name: " . $name . "\n" . "Mobile: " . $mobile . "\n";
  if (!empty($email)) {
    $message .= "Email: " . $email . "\n";
  }
  $message .= "City: " . $city . "\n";
  if (!empty($packageTitle)) {
    $message .= "Package: " . $packageTitle . "\n";
  }

  $mail = new PHPMailer(true);

  try {
    uno_trips_smtp_configure($mail);
    $mail->setFrom('query@ptwhotels.com', 'Uno Trips');

    $mail->addAddress('unotripsit@gmail.com');
    $mail->addAddress('manjitsingh012345@gmail.com');
    $mail->Subject = $subject;
    $mail->Body = $message;

    if (!$mail->send()) {
      echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
      echo "<script>window.location.href = 'thankyou.html';</script>";
      exit();
    }
  } catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
  }
}

?>



<?php
$canonical_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? '');
$canonical_url = rtrim(preg_replace('/\?.*/', '', $canonical_url), '/') ?: '';
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kerala Tour Packages | Munnar Alleppey Backwaters Tour - Uno Trips</title>
  <meta name="description" content="Book best Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon & houseboat tours. Get free quote. Best price guaranteed." />
  <meta name="keywords" content="kerala tour packages, kerala trip, kerala travel package, munnar alleppey tour, kerala holiday packages, kerala honeymoon package, kerala houseboat package, kerala backwaters tour, book kerala tour, kerala vacation package, best kerala packages" />
  <meta name="robots" content="index, follow" />
  <?php if (!empty($canonical_url)) {
    echo '<link rel="canonical" href="' . htmlspecialchars($canonical_url) . '" />';
  } ?>
  <meta name="theme-color" content="#1f2937" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Kerala Tour Packages | Munnar Alleppey Backwaters - Uno Trips" />
  <meta property="og:description" content="Book best Kerala tour packages - Munnar, Alleppey, Kovalam. Get free quote. Best price guaranteed." />
  <meta name="application-name" content="Uno Trips" />
  <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
  <meta property="og:url" content="https://unotrips.com/meta/kerala/" />
  <meta property="og:site_name" content="Uno Trips" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:image" content="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" />
  <meta property="og:image:alt" content="Kerala tour packages - Munnar Alleppey backwaters" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Kerala Tour Packages | Munnar Alleppey Backwaters - Uno Trips" />
  <meta name="twitter:description" content="Book Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Free quote." />
  <meta name="twitter:image" content="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>
  <link rel="preload" href="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" as="image" fetchpriority="high" />
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"></noscript>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="print" onload="this.media='all'" />

  <!-- Google Ads: Required - do not remove/defer/delay. -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17928878008"></script>
  <script>
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'AW-17928878008');
  </script>

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "@id": "https://unotrips.com/meta/kerala/#travel-agency",
      "name": "Uno Trips - Kerala Tour Packages",
      "url": "https://unotrips.com/meta/kerala/",
      "logo": "https://unotrips.com/images/logo.png",
      "image": "https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg",
      "description": "Book Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon packages, houseboat tours, custom itineraries.",
      "telephone": "+91-7876505119",
      "email": "unotripsit@gmail.com",
      "priceRange": "₹₹",
      "areaServed": "Kerala, India",
      "serviceType": ["Kerala Tour Packages", "Kerala Trip", "Munnar Alleppey Tour", "Kerala Honeymoon Package", "Kerala Group Tour", "Kerala Houseboat Package"],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-7876505119",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "India",
        "addressRegion": "Kerala",
        "addressCountry": "IN"
      }
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
          "@type": "Question",
          "name": "What is included in a Kerala tour package?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our Kerala tour packages generally include accommodation, sightseeing, daily breakfast, private transfers, and local assistance. Inclusions may vary based on the selected package."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best time to visit Kerala?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best time to visit Kerala is from October to March for pleasant weather. Monsoon (June-September) is lush and ideal for Ayurveda. Houseboat season peaks Oct-Feb."
          }
        },
        {
          "@type": "Question",
          "name": "How many days are ideal for a Kerala tour?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A 5 to 7 days Kerala tour is ideal to explore popular destinations like Munnar, Alleppey, Thekkady, Kovalam, and local attractions comfortably."
          }
        },
        {
          "@type": "Question",
          "name": "Are Kerala tour packages suitable for families and honeymoon couples?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Kerala tour packages are perfect for families, honeymoon couples, and adventure seekers, with customized itineraries to match different travel needs."
          }
        },
        {
          "@type": "Question",
          "name": "Can the Kerala tour package be customized?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Our Kerala tour packages are fully customizable. You can choose destinations, hotels, transport, and activities as per your preferences and budget."
          }
        }
      ]
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://unotrips.com/meta/kerala/",
      "url": "https://unotrips.com/meta/kerala/",
      "name": "Kerala Tour Packages | Munnar Alleppey Backwaters Tour - Uno Trips",
      "description": "Book best Kerala tour packages - Munnar, Alleppey, Thekkady, Kovalam. Kerala honeymoon & houseboat tours. Get free quote.",
      "inLanguage": "en-IN",
      "isPartOf": { "@type": "WebSite", "name": "Uno Trips", "url": "https://unotrips.com" },
      "about": { "@type": "Place", "name": "Kerala", "address": { "@type": "PostalAddress", "addressRegion": "Kerala", "addressCountry": "IN" } },
      "primaryImageOfPage": "https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg",
      "publisher": { "@type": "Organization", "name": "Uno Trips", "url": "https://unotrips.com" }
    }
  </script>

  <link rel="stylesheet" href="style.critical.min.css" />
  <link rel="preload" href="style.deferred.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="style.deferred.min.css"></noscript>
</head>

<body class="bg-white page-body">
  <!-- Page Loader -->
  <div id="page-loader" class="page-loader">
    <div class="loader-backdrop">
      <div class="loader-mountains"></div>
      <div class="loader-gradient-overlay"></div>
    </div>
    <div class="loader-particles">
      <span></span><span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <div class="loader-content">
      <div class="loader-rings">
        <div class="loader-ring loader-ring-1"></div>
        <div class="loader-ring loader-ring-2"></div>
        <div class="loader-ring loader-ring-3"></div>
        <div class="loader-core">
          <img src="img/logo.png" alt="Uno Trips" class="loader-logo" width="80" height="27" decoding="async" />
        </div>
      </div>
      <p class="loader-text">
        <span class="loader-text-word">Uno</span>
        <span class="loader-text-word">Trips</span>
      </p>
      <p class="loader-tagline">Loading your journey to Kerala</p>
      <div class="loader-bar">
        <div class="loader-bar-track"></div>
        <div class="loader-bar-fill"></div>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header class="site-header text-white py-3 px-4 md:px-6 shadow-lg">
    <div class="container mx-auto flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <img
          src="img/logo.png"
          alt="Uno Trips Logo"
          class="h-8 md:h-10 w-auto"
          width="120"
          height="40"
          decoding="async" />
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-3 md:space-x-4">
        <a
          href="tel:+917876505119"
          class="header-call-btn px-4 py-2 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
          <i class="fas fa-phone text-xs"></i>
          <span>+91-7876505119</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section with Image -->
  <section class="hero-image relative hero-section">
    <img
      src="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg"
      alt="Kerala - Munnar Alleppey Backwaters"
      class="hero-bg-img"
      width="1920"
      height="1080"
      fetchpriority="high"
      decoding="async" />
    <div class="hero-overlay"></div>
    <!-- Hero content -->
    <div class="hero-content absolute inset-0 flex flex-col items-center justify-center w-full px-4 z-10 text-center">
      <p class="hero-badge text-white/90 text-xs md:text-sm font-semibold tracking-widest uppercase mb-3">Best Kerala Tour Packages</p>
      <h1 class="hero-title text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-lg">Explore God's Own Country</h1>
      <p class="hero-subtitle text-white/90 text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-xl">Munnar • Alleppey • Thekkady • Kovalam</p>
      <button
        type="button"
        class="cta-primary gradient-btn hero-cta-btn text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-bold inline-flex items-center justify-center gap-2 shadow-xl"
        onclick="openEnquiryModal()">
        <i class="fas fa-calendar-check"></i>
        <span>Book Now</span>
        <i class="fas fa-arrow-right text-sm"></i>
      </button>
    </div>
    <!-- Review Ratings Overlay + Trust -->
    <div
      class="review-overlay absolute bottom-0 left-0 right-0 py-3 px-4 md:px-6">
      <div class="container mx-auto">
        <p class="text-center text-gray-300 text-xs mb-2">No spam • Free consultation • Instant response on WhatsApp</p>
        <div
          class="flex flex-nowrap items-center justify-center md:justify-start gap-2 md:gap-6 overflow-x-auto">
          <!-- Google Review -->
          <div class="flex items-center space-x-1.5 md:space-x-2 text-white flex-shrink-0">
            <div
              class="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-600 font-bold text-xs md:text-sm">G</span>
            </div>
            <div class="flex-shrink-0">
              <div class="flex items-center space-x-0.5 md:space-x-1">
                <span class="text-yellow-400 text-xs md:text-sm">★</span>
                <span class="font-bold text-sm md:text-base">4.9</span>
              </div>
              <div class="text-[10px] md:text-xs text-gray-300">(14,001 reviews)</div>
            </div>
          </div>

          <!-- TripAdvisor Review -->
          <div class="flex items-center space-x-1.5 md:space-x-2 text-white flex-shrink-0">
            <div
              class="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-owl text-green-600 text-xs md:text-sm"></i>
            </div>
            <div class="flex-shrink-0">
              <div class="flex items-center space-x-0.5 md:space-x-1">
                <span class="text-yellow-400 text-xs md:text-sm">★</span>
                <span class="font-bold text-sm md:text-base">5.0</span>
              </div>
              <div class="text-[10px] md:text-xs text-gray-300">(3,850 reviews)</div>
            </div>
          </div>

          <!-- Facebook Review -->
          <div class="flex items-center space-x-1.5 md:space-x-2 text-white flex-shrink-0">
            <div
              class="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fab fa-facebook-f text-blue-600 text-xs md:text-sm"></i>
            </div>
            <div class="flex-shrink-0">
              <div class="flex items-center space-x-0.5 md:space-x-1">
                <span class="text-yellow-400 text-xs md:text-sm">★</span>
                <span class="font-bold text-sm md:text-base">4.9</span>
              </div>
              <div class="text-[10px] md:text-xs text-gray-300">(1,031 reviews)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing and CTA Section -->
  <section class="pricing-cta-section py-8 px-4 md:px-6">
    <div class="container mx-auto max-w-4xl">
      <!-- Destination Title -->
      <div class="text-center mb-5">
        <h2 class="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
          Best Kerala Tour Packages
        </h2>
        <p class="text-gray-500 text-sm md:text-base">Explore backwaters, beaches and misty hill stations</p>
      </div>

      <!-- ONE Primary CTA + Secondary WhatsApp -->
      <div class="flex flex-col items-center gap-4 mt-6">
        <button
          type="button"
          class="cta-primary gradient-btn text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-bold flex items-center justify-center gap-2 w-full max-w-md"
          onclick="openEnquiryModal()">
          <i class="fas fa-calendar-check"></i>
          <span>Book Now</span>
          <i class="fas fa-arrow-right"></i>
        </button>
        <a
          href="https://wa.me/917876505119"
          target="_blank"
          class="whatsapp-btn text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl text-sm md:text-base font-semibold inline-flex items-center justify-center gap-2 w-full max-w-md">
          <i class="fab fa-whatsapp text-lg"></i>
          <span>Chat on WhatsApp</span>
        </a>
        <!-- Trust below CTA -->
        <div class="cta-trust text-center text-sm text-gray-500 mt-1">
          <p class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span><i class="fas fa-shield-alt text-green-500"></i> No spam, free consultation</span>
            <span><i class="fas fa-star text-yellow-500"></i> 10+ years experience</span>
            <span><i class="fab fa-whatsapp text-green-500"></i> Instant response</span>
          </p>
        </div>
      </div>
    </div>
  </section>

    <!-- Kerala Packages Section -->
  <section id="packages" class="packages-section py-10 px-4 md:px-6">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">Kerala Tour Packages</h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Handpicked itineraries for every traveller</p>

      <div id="8-day-kerala-group-tour-best-of-kerala" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" alt="Kerala Best of Kerala Group Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">7 NIGHTS 8 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Thekkady</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span> <i class="fas fa-arrow-right mx-1"></i> <span>Kovalam</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Kerala Group Tour Package - 8 Days Best of Kerala</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Captain</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin & Fort Kochi walk</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Travel to Munnar & tea estate visit</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar sightseeing - Eravikulam & Mattupetty</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Thekkady - Periyar Wildlife Sanctuary</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Alleppey houseboat cruise</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Kovalam beach leisure</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Trivandrum Padmanabhaswamy Temple</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 8: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Fort Kochi & Chinese Fishing Nets</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Munnar tea gardens & Echo Point</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Periyar Lake boat safari</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey backwaters houseboat</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kovalam Lighthouse Beach</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Padmanabhaswamy Temple</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Kerala Group Tour Package - 8 Days Best of Kerala"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="9-day-kerala-adventure-special-wayanad-munnar" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800"><i class="fas fa-arrow-trend-up"></i><span>TRENDING NOW</span></div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" alt="Kerala Adventure Special" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">8 NIGHTS 9 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Wayanad</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Thekkady</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Kerala Group Tour - 9 Days Adventure Special Edition</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Captain</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Wayanad - Edakkal Caves & Soochipara Falls</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Wayanad wildlife & spice plantation</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Munnar hill station arrival</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Munnar adventure & tea trails</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Thekkady spice gardens</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Alleppey houseboat overnight</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 8: Kumarakom village experience</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 9: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Edakkal Caves</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Soochipara & Meenmutty Falls</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Munnar Top Station</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Periyar Tiger Reserve</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey backwater canals</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kumarakom bird sanctuary</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Kerala Group Tour - 9 Days Adventure Special Edition"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="munnar-alleppey-tour-package-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHRx6Ltw14TcKatDT_1w5ityVE6mN80cbBug&s" alt="Munnar Alleppey Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">5 NIGHTS 6 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Munnar Alleppey Tour Package - 5N/6D</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Cochin to Munnar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar local sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Munnar to Alleppey houseboat</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Alleppey to Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Mattupetty Dam</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Eravikulam National Park</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tea Museum Munnar</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey houseboat cruise</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Marari beach (optional)</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Munnar Alleppey Tour Package - 5N/6D"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="munnar-alleppey-kovalam-tour-6n-7d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://cf-images.assettype.com/thequint/2017-06/514821aa-c3cc-4ebb-82f4-c832cc095c7a/4b667f98-1b66-4a4f-874a-207a38d5a64f.jpg?auto=format,compress&fmt=webp&format=webp&w=1200&h=900&dpr=1.0" alt="Munnar Alleppey Kovalam Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">6 NIGHTS 7 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span> <i class="fas fa-arrow-right mx-1"></i> <span>Kovalam</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Munnar Alleppey Kovalam Tour - 6N/7D</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Cochin to Munnar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Munnar to Alleppey houseboat</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Alleppey to Kovalam</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Kovalam beach day</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Munnar tea valleys</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey backwaters</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kovalam Lighthouse Beach</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Hawa Beach & shacks</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Vizhinjam fishing harbour</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Munnar Alleppey Kovalam Tour - 6N/7D"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="alleppey-houseboat-tour-package-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://keralatourism.travel/images/v2/packages/destinations-alleppey-tourism.jpg" alt="Alleppey Houseboat Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span> <i class="fas fa-arrow-right mx-1"></i> <span>Kumarakom</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Alleppey Houseboat Tour Package - 4N/5D</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Cochin to Alleppey houseboat check-in</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Kumarakom backwater village</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Alleppey beach & coir museum</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Overnight houseboat cruise</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Punnamada Lake</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kumarakom bird sanctuary</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey beach</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Traditional Kerala cuisine on boat</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Alleppey Houseboat Tour Package - 4N/5D"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>
      <!-- Kerala intro: after first 5 packages -->
      <div id="about-kerala-tours" class="my-8 py-8 px-4 md:px-6 bg-gray-50 rounded-2xl border border-gray-100">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Book Kerala Tour Packages with Uno Trips</h2>
          <p class="text-gray-600 text-sm md:text-base leading-relaxed">
            Plan your Kerala trip with expert-curated packages covering Munnar tea hills, Alleppey backwater houseboat stays,
            Thekkady wildlife, and Kovalam beaches. Get a free customised quote with clear inclusions and dedicated travel assistance.
            Perfect for family holidays, honeymoon couples, and group tours across God's Own Country.
          </p>
          <p class="text-gray-500 text-sm mt-3">Customised to your dates &amp; budget • Transparent pricing • No spam • Best price guarantee</p>
        </div>
      </div>

      <div id="munnar-thekkady-tour-package-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" alt="Munnar Thekkady Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Thekkady</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Munnar Thekkady Tour Package - 4N/5D</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Cochin to Munnar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar to Thekkady</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Thekkady spice plantation & safari</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Munnar Echo Point</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tea factory visit</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Periyar Wildlife Sanctuary</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Spice garden tour</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kathakali show (optional)</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Munnar Thekkady Tour Package - 4N/5D"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="munnar-alleppey-tour-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://static.toiimg.com/thumb/msid-94248825,width-748,height-499,resizemode=4,imgsize-90508/.jpg" alt="Short Munnar Alleppey Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Munnar Alleppey Tour - 4N/5D</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Cochin</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Munnar sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar to Alleppey</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Houseboat & departure</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Photo Point Munnar</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Rose Garden</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey canals</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Houseboat lunch cruise</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Munnar Alleppey Tour - 4N/5D"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="complete-kerala-tour-8n-9d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://media.worldnomads.com/social-share-images/india/see-and-do-kerala-social.jpg" alt="Complete Kerala Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">8 NIGHTS 9 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Thekkady</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span> <i class="fas fa-arrow-right mx-1"></i> <span>Kovalam</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Complete Kerala Tour - 8N/9D Cochin, Munnar & Backwaters</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Cochin arrival</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Fort Kochi & Mattancherry</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar transfer & sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Munnar leisure & tea trails</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Thekkady Periyar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Alleppey houseboat</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Kovalam beaches</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 8: Trivandrum city tour</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 9: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Jew Town & Dutch Palace</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Munnar hill views</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Periyar Lake</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Alleppey backwaters</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kovalam sunset</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Complete Kerala Tour - 8N/9D Cochin, Munnar & Backwaters"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="romantic-kerala-honeymoon-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://static.toiimg.com/thumb/msid-94248825,width-748,height-499,resizemode=4,imgsize-90508/.jpg" alt="Kerala Honeymoon Package" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">5 NIGHTS 6 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Munnar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Alleppey</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Romantic Kerala Honeymoon - 5N/6D Munnar & Houseboat</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Cochin arrival with flower welcome</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Cochin to Munnar - romantic resort stay</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Munnar couples photoshoot points</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Private houseboat Alleppey</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Kumarakom couple spa (optional)</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Private candlelight dinner</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Munnar misty viewpoints</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Couple houseboat deck</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Sunset at Marari beach</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Ayurveda spa session</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Romantic Kerala Honeymoon - 5N/6D Munnar & Houseboat"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Wayanad, Kovalam & Beach – Niche Packages -->
  <section id="kerala-beach-hill-packages" class="packages-section py-10 px-4 md:px-6 bg-gray-50">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">Wayanad, Kovalam & Beach Tours</h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Dedicated packages for hills, waterfalls and Kerala beaches</p>

      <div id="wayanad-athirapally-tour-package-3n-4d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHRx6Ltw14TcKatDT_1w5ityVE6mN80cbBug&s" alt="Wayanad Athirapally Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">3 NIGHTS 4 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Cochin</span> <i class="fas fa-arrow-right mx-1"></i> <span>Athirapally</span> <i class="fas fa-arrow-right mx-1"></i> <span>Wayanad</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Wayanad & Athirapally Tour Package - 3N/4D</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Cochin to Athirapally Falls</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Athirapally to Wayanad</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Wayanad caves & waterfalls</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Athirapally Falls</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Vazhachal Falls</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Edakkal Caves</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Banasura Sagar Dam</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Chembra Peak viewpoint</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Wayanad & Athirapally Tour Package - 3N/4D"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <div id="kovalam-beach-tour-package-3n-4d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="https://cf-images.assettype.com/thequint/2017-06/514821aa-c3cc-4ebb-82f4-c832cc095c7a/4b667f98-1b66-4a4f-874a-207a38d5a64f.jpg?auto=format,compress&fmt=webp&format=webp&w=1200&h=900&dpr=1.0" alt="Kovalam Beach Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">3 NIGHTS 4 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Trivandrum</span> <i class="fas fa-arrow-right mx-1"></i> <span>Kovalam</span> <i class="fas fa-arrow-right mx-1"></i> <span>Varkala</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Kovalam Beach Tour Package - 3N/4D Kovalam & Varkala</h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Stay</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Meals</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Sightseeing & Activities</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Local Transport</span></div>
                <div class="flex items-center gap-1"><i class="fas fa-check-circle text-green-600"></i><span>Trip Assistance</span></div>
                
                <div class="flex items-center gap-1"><i class="fas fa-times-circle text-red-500"></i><span>Flights</span><span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span></div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>BRIEF ITINERARY</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="itinerary-list"><li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Trivandrum & Kovalam</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Kovalam beach & water sports</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Day trip to Varkala cliff beach</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Departure</span></li></ul></div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4"><ul class="attractions-list"><li><i class="fas fa-star text-yellow-500"></i><span>Lighthouse Beach Kovalam</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Hawa Beach</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Varkala cliff & Papanasam beach</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Padmanabhaswamy Temple</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Sunset catamaran ride</span></li></ul></div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Kovalam Beach Tour Package - 3N/4D Kovalam & Varkala"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Mid-page CTA: Talk to Travel Expert -->
  <section class="mid-cta-section py-10 px-4 md:px-6 bg-white border-y border-gray-100">
    <div class="container mx-auto max-w-2xl text-center">
      <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">Talk to a Travel Expert</h2>
      <p class="text-gray-500 text-sm md:text-base mb-6">10+ years experience • Custom itineraries • No spam</p>
      <button
        type="button"
        class="cta-primary gradient-btn text-white px-8 py-4 rounded-2xl text-base font-bold inline-flex items-center justify-center gap-2"
        onclick="openEnquiryModal()">
        <i class="fas fa-calendar-check"></i>
        <span>Book Now</span>
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="faq-section faq-section-design py-12 px-4 md:px-6">
    <div class="container mx-auto max-w-4xl">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
        Frequently Asked Questions (FAQs)
      </h2>
      <div class="space-y-4">
        <!-- FAQ 1 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>What is included in a Kerala tour package?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Our Kerala tour packages generally include accommodation, sightseeing, daily breakfast, private transfers, and local assistance. Inclusions may vary based on the selected package.</p>
          </div>
        </div>

        <!-- FAQ 2 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>What is the best time to visit Kerala?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>The best time to visit Kerala is from October to March for pleasant weather. Monsoon (June-September) is lush and ideal for Ayurveda. Houseboat season peaks Oct-Feb. Monsoon brings heavy rains in hills but Ayurveda retreats are popular year-round.</p>
          </div>
        </div>

        <!-- FAQ 3 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>How many days are ideal for a Kerala tour?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>A 5 to 7 days Kerala tour is ideal to explore popular destinations like Munnar, Alleppey, Thekkady, Kovalam, and local attractions comfortably.</p>
          </div>
        </div>

        <!-- FAQ 4 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>Are Kerala tour packages suitable for families and honeymoon couples?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Yes, Kerala tour packages are perfect for families, honeymoon couples, and adventure seekers, with customized itineraries to match different travel needs.</p>
          </div>
        </div>

        <!-- FAQ 5 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>Can the Kerala tour package be customized?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Absolutely! Our Kerala tour packages are fully customizable. You can choose destinations, hotels, transport, and activities as per your preferences and budget.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Desktop Footer -->
  <footer class="desktop-footer bg-gray-800 text-white py-8 px-4 md:px-6 mt-6">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <!-- Company Info -->
        <div>
          <h3 class="text-lg font-bold mb-4">Uno Trips</h3>
          <p class="text-sm text-gray-300 mb-4">
            Your trusted travel partner for amazing Kerala tours. Experience backwaters, beaches and lush green hills with our curated packages.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li><a href="#packages" class="hover:text-white transition-colors">Tour Packages</a></li>
            <li><a href="#faq" class="hover:text-white transition-colors">FAQs</a></li>
            <li><a href="https://unotrips.com" class="hover:text-white transition-colors" rel="noopener">About Uno Trips</a></li>
            <li><a href="tel:+917876505119" class="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="text-lg font-bold mb-4">Contact Us</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li class="flex items-center gap-2">
              <i class="fas fa-phone text-blue-400"></i>
              <a href="tel:+917876505119" class="hover:text-white transition-colors">+91-7876505119</a>
            </li>
            <li class="flex items-center gap-2">
              <i class="fab fa-whatsapp text-green-400"></i>
              <a href="https://wa.me/917876505119" target="_blank" class="hover:text-white transition-colors">WhatsApp Us</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-700 pt-6 text-center">
        <p class="text-sm text-gray-300">&copy; 2026 Uno Trips. All rights reserved. | <a href="privacy.html" class="hover:text-white underline">Privacy Policy</a></p>
      </div>
    </div>
  </footer>

  <!-- Enquiry Popup Modal -->
  <div id="enquiryModal" class="enquiry-modal">
    <div class="enquiry-modal-overlay"></div>
    <div class="enquiry-modal-content">
      <div class="enquiry-modal-header">
        <h3 class="text-xl font-bold text-gray-800">Book Your Kerala Tour</h3>
        <p class="text-sm text-gray-600 mt-1">No spam • Free consultation • We'll call you back</p>
        <button class="enquiry-modal-close" onclick="closeEnquiryModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form class="query-form" action="" method="POST">
        <input type="hidden" name="subjecty" value="Kerala Tour Query ">
        <input type="hidden" name="cityy" value="">
        <input type="hidden" name="destinationy" value="Kerala">
        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input
              type="text"
              name="namey"
              placeholder="Your name *"
              required
              class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-phone input-icon"></i>
            <input
              type="tel"
              name="phoney"
              placeholder="Phone number *"
              required
              class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <div class="input-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input
              type="email"
              name="emaily"
              placeholder="Email (optional)"
              class="form-input" />
          </div>
        </div>
        <input type="hidden" id="package-title" name="package-title" value="">
        <p class="form-privacy text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
          By submitting, you agree to our <a href="privacy.html" target="_blank" rel="noopener" class="text-blue-600 underline">Privacy Policy</a>.
          We use your details only to contact you about Kerala tour packages. No spam.
        </p>

        <button type="submit" name="submit" class="enquiry-submit-btn" id="btnSubmit">
          <i class="fas fa-spinner btn-spinner" aria-hidden="true"></i>
          <span class="btn-text">Book Now</span>
        </button>

      </form>
    </div>
  </div>

  <!-- Chatbot Widget (WhatsApp style) -->
  <div id="chatbot-widget" class="chatbot-widget">
    <div id="chatbot-panel" class="chatbot-panel">
      <div class="chatbot-header chatbot-header-wa">
        <div class="chatbot-header-info">
          <span class="chatbot-title">Kerala Tour</span>
          <span class="chatbot-subtitle">Typically replies instantly</span>
        </div>
        <button type="button" class="chatbot-close" id="chatbotClose" aria-label="Close"><i class="fas fa-times"></i></button>
      </div>
      <div id="chatbot-messages" class="chatbot-messages"></div>
      <div id="chatbot-quick-replies" class="chatbot-quick-replies"></div>
      <div class="chatbot-input-wrap" id="chatbotInputWrap" style="display:none;">
        <input type="text" id="chatbotUserInput" class="chatbot-input" placeholder="Type your answer..." maxlength="200" />
        <button type="button" id="chatbotSend" class="chatbot-send"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
    <button type="button" id="chatbotToggle" class="chatbot-toggle" aria-label="Open chat">
      <i class="fas fa-comments"></i>
      <span class="chatbot-toggle-badge">1</span>
    </button>
  </div>

  <script src="script.js"></script>
  <script src="https://cdn.tailwindcss.com" defer></script>
</body>

</html>