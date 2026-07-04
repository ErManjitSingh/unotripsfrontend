<?php

use PHPMailer\PHPMailer\PHPMailer;

require 'vendor/autoload.php';
require_once __DIR__ . '/mail_smtp.php';

if (isset($_POST['submit'])) {




  $name = isset($_POST['namey']) ? trim($_POST['namey']) : '';
  $mobile = isset($_POST['phoney']) ? trim($_POST['phoney']) : '';
  $email = isset($_POST['emaily']) ? trim($_POST['emaily']) : '';
  $city = isset($_POST['cityy']) ? trim($_POST['cityy']) : '';
  $subject = isset($_POST['subjecty']) ? trim($_POST['subjecty']) : 'Himachal Tour Query';
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
  <title>Himachal Tour Packages | Shimla Manali Dharamshala Tour - Uno Trips</title>
  <meta name="description" content="Book best Himachal tour packages - Shimla, Manali, Dharamshala, Kullu. Himachal honeymoon & group tours. Get free quote. Best price guaranteed." />
  <meta name="keywords" content="himachal tour packages, himachal trip, himachal travel package, shimla manali tour, himachal holiday packages, himachal honeymoon package, himachal group tour, himachal tour price, book himachal tour, himachal vacation package, himachal trip cost, best himachal packages" />
  <meta name="robots" content="index, follow" />
  <?php if (!empty($canonical_url)) {
    echo '<link rel="canonical" href="' . htmlspecialchars($canonical_url) . '" />';
  } ?>
  <meta name="theme-color" content="#1f2937" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Himachal Tour Packages | Shimla Manali Dharamshala - Uno Trips" />
  <meta property="og:description" content="Book best Himachal tour packages - Shimla, Manali, Dharamshala. Get free quote. Best price guaranteed." />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>
  <link rel="preload" href="img/full_himachal.webp" as="image" fetchpriority="high" />
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

  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1749891646008468');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1749891646008468&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Uno Trips - Himachal Tour Packages",
      "description": "Book Himachal tour packages - Shimla, Manali, Dharamshala, Kullu. Himachal honeymoon packages, group tours, custom itineraries.",
      "telephone": "+91-7876505119",
      "areaServed": "Himachal Pradesh, India",
      "serviceType": ["Himachal Tour Packages", "Himachal Trip", "Shimla Manali Tour", "Himachal Honeymoon Package", "Himachal Group Tour"],
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Himachal Pradesh",
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
          "name": "What is included in a Himachal tour package?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our Himachal tour packages generally include accommodation, sightseeing, daily breakfast, private transfers, and local assistance. Inclusions may vary based on the selected package."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best time to visit Himachal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best time to visit Himachal is from March to June and September to November for pleasant weather. December to February is ideal for snow and winter activities in Manali and Shimla."
          }
        },
        {
          "@type": "Question",
          "name": "How many days are ideal for a Himachal tour?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A 5 to 7 days Himachal tour is ideal to explore popular destinations like Shimla, Manali, Dharamshala, Kullu, and local attractions comfortably."
          }
        },
        {
          "@type": "Question",
          "name": "Are Himachal tour packages suitable for families and honeymoon couples?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Himachal tour packages are perfect for families, honeymoon couples, and adventure seekers, with customized itineraries to match different travel needs."
          }
        },
        {
          "@type": "Question",
          "name": "Can the Himachal tour package be customized?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Our Himachal tour packages are fully customizable. You can choose destinations, hotels, transport, and activities as per your preferences and budget."
          }
        }
      ]
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
      <p class="loader-tagline">Loading your journey to the mountains</p>
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
      src="img/full_himachal.webp"
      alt="Himachal Pradesh - Shimla Manali Dharamshala"
      class="hero-bg-img"
      width="1920"
      height="1080"
      fetchpriority="high"
      decoding="async" />
    <div class="hero-overlay"></div>
    <!-- Hero content -->
    <div class="hero-content absolute inset-0 flex flex-col items-center justify-center w-full px-4 z-10 text-center">
      <p class="hero-badge text-white/90 text-xs md:text-sm font-semibold tracking-widest uppercase mb-3">Best Himachal Tour Packages</p>
      <h1 class="hero-title text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-lg">Explore the Mountains</h1>
      <p class="hero-subtitle text-white/90 text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-xl">Shimla • Manali • Dharamshala • Kullu</p>
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
        <h1 class="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
          Best Himachal Tour Packages
        </h1>
        <p class="text-gray-500 text-sm md:text-base">Explore the land of snow-clad peaks and valleys</p>
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

  <!-- Himachal Packages Section -->
  <section id="packages" class="packages-section py-10 px-4 md:px-6">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Himachal Tour Packages
      </h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Handpicked itineraries for every traveller</p>

      <!-- Package Card 1: Hill Station Special -->
      <div id="8-day-himachal-group-tour-hill-station-special-shimla-manali-dalhousie-dharamshala" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <!-- Package Image -->
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/himachal%20grop.webp"
              alt="Himachal Hill Station Special"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>

          <!-- Package Details -->
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">7 NIGHTS 8 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Manali</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Kullu</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Dalhousie</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Dharamshala</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Himachal Group Tour Package - 8 Days Hill Station Special
            </h3>

            <!-- Inclusions -->
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span
                    class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>

            <!-- Collapsible Sections -->
            <div class="mb-4 space-y-2">
              <button
                class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700"
                onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 1: Arrival in Shimla</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 2: Shimla city tour & Mall Road</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 3: Travel to Manali</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 4: Manali sightseeing & Solang Valley</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 5: Kullu & Manikaran</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 6: Travel to Dalhousie</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 7: Dharamshala & McLeod Ganj</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 8: Departure</span>
                  </li>
                </ul>
              </div>

              <button
                class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700"
                onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li>
                    <i class="fas fa-star text-yellow-500"></i>
                    <span>Shimla Ridge & Mall Road</span>
                  </li>
                  <li>
                    <i class="fas fa-star text-yellow-500"></i>
                    <span>Manali Rohtang Pass & Solang Valley</span>
                  </li>
                  <li>
                    <i class="fas fa-star text-yellow-500"></i>
                    <span>Kullu Valley & Manikaran</span>
                  </li>
                  <li>
                    <i class="fas fa-star text-yellow-500"></i>
                    <span>Dalhousie Khajjiar</span>
                  </li>
                  <li>
                    <i class="fas fa-star text-yellow-500"></i>
                    <span>Dharamshala Dalai Lama Temple</span>
                  </li>
                  <li>
                    <i class="fas fa-star text-yellow-500"></i>
                    <span>McLeod Ganj & Triund</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Himachal Group Tour Package - 8 Days Hill Station Special">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 2: Adventure Special Edition -->
      <div id="9-days-himachal-group-tour-adventure-special-shimla-manali-dharamshala-bir-dalhousie" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <!-- Trending Tag -->
        <div
          class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800">
          <i class="fas fa-arrow-trend-up"></i>
          <span>TRENDING NOW</span>
        </div>

        <div class="flex flex-col md:flex-row">
          <!-- Package Image -->
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/solang.jpg"
              alt="Himachal Adventure Special"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>

          <!-- Package Details -->
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-4">
              <span class="text-sm font-semibold text-gray-600">9 NIGHTS 10 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> - <span>Manali</span> - <span>Dharamshala</span> -
              <span>Bir Billing</span> - <span>Dalhousie</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Himachal Group Tour - 9 Days Adventure Special Edition
            </h3>

            <!-- Inclusions -->
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span
                    class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>

            <!-- Collapsible Sections -->
            <div class="mb-4 space-y-2">
              <button
                class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700"
                onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 1: Arrival in Shimla</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 2: Shimla sightseeing</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 3: Travel to Manali</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 4: Manali & Solang Valley</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 5: Travel to Dharamshala</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 6: Dharamshala & McLeod Ganj</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 7: Bir Billing paragliding</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 8: Dalhousie & Khajjiar</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 9: Adventure activities</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-day text-blue-500"></i>
                    <span>Day 10: Departure</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Himachal Group Tour - 9 Days Adventure Special Edition">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 3: Shimla Manali Tour Package -->
      <div id="shimla-manali-tour-package-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/shimla.jpg"
              alt="Shimla Manali Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">5 NIGHTS 6 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Manali</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Shimla Manali Tour Package - 5N/6D
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Shimla</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Shimla sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Travel to Manali</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Manali exploration</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Solang Valley & Rohtang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Shimla Mall Road & Ridge</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Manali Hadimba Temple</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Solang Valley</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Shimla Manali Tour Package - 5N/6D">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 4: Shimla Manali Dharamshala Tour -->
      <div id="shimla-manali-dharamshala-tour-6n-7d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/dharamshala.webp"
              alt="Shimla Manali Dharamshala Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">6 NIGHTS 7 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Manali</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Dharamshala</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Shimla Manali Dharamshala Tour - 6N/7D
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Shimla</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Shimla city tour</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Travel to Manali</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Manali sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Travel to Dharamshala</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Dharamshala & McLeod Ganj</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Shimla Ridge & Mall Road</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Manali Solang Valley</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Dharamshala Dalai Lama Temple</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Shimla Manali Dharamshala Tour - 6N/7D">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 5: Manali Kullu Tour Package -->
      <div id="manali-kullu-tour-package-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/kullu.jpg"
              alt="Manali Kullu Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Manali</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Kullu</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Manali Kullu Tour Package - 4N/5D
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Manali</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Manali Solang Valley visit</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Travel to Kullu</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Kullu & Manikaran</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Manali Rohtang Pass</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kullu Valley & Manikaran</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Solang Valley</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Manali Kullu Tour Package - 4N/5D">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 6: Shimla Manali Tour - 4N/5D -->
      <div id="shimla-manali-tour-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/himachal.webp"
              alt="Shimla Manali Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Manali</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Shimla Manali Tour - 4N/5D
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Shimla</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Shimla city tour</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Manali adventure</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Solang Valley visit</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Shimla Mall Road</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Manali Solang Valley</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kufri & Naldehra</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Shimla Manali Tour - 4N/5D">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 7: Complete Himachal Tour -->
      <div id="complete-himachal-tour-shimla-manali-dharamshala-8n-9d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/full_himachal.webp"
              alt="Complete Himachal Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">8 NIGHTS 9 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Manali</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Dharamshala</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Complete Himachal Tour - 8N/9D Shimla, Manali & Dharamshala
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Shimla</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Shimla sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Travel to Manali</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4-5: Manali exploration</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Travel to Dharamshala</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7-8: Dharamshala & McLeod Ganj</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 9: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Shimla Ridge & Mall Road</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Manali Solang Valley</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Dharamshala Dalai Lama Temple</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Complete Himachal Tour - 8N/9D Shimla, Manali & Dharamshala">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 8: Romantic Himachal Honeymoon -->
      <div id="romantic-himachal-honeymoon-shimla-manali-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800">
          <i class="fas fa-arrow-trend-up"></i>
          <span>TRENDING NOW</span>
        </div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/romatic.webp"
              alt="Romantic Himachal Honeymoon"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">5 NIGHTS 6 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Shimla</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Manali</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Romantic Himachal Honeymoon - 5N/6D Shimla & Manali
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Captain</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Shimla</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Romantic Shimla tour</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Travel to Manali</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Manali romantic spots</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Solang Valley & activities</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Shimla Kufri</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Manali Solang Valley</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Romantic sunset points</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Romantic Himachal Honeymoon - 5N/6D Shimla & Manali">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Dharamshala, McLeodganj & Dalhousie – Niche Packages (separate section) -->
  <section id="dharamshala-dalhousie-packages" class="packages-section py-10 px-4 md:px-6 bg-gray-50">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Dharamshala, McLeodganj & Dalhousie Tours
      </h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Dedicated packages for Dharamshala, McLeod Ganj and Dalhousie</p>

      <!-- Dharamshala & McLeodganj Tour -->
      <div id="dharamshala-mcleodganj-tour-package-3n-4d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/dharamshala.webp"
              alt="Dharamshala McLeodganj Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">3 NIGHTS 4 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Dharamshala</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>McLeod Ganj</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Triund</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Dharamshala & McLeodganj Tour Package - 3N/4D
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Dharamshala</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: McLeod Ganj, Dalai Lama Temple & Norbulingka</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Triund trek or Bhagsu Nag Temple</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tsuglagkhang Complex (Dalai Lama Temple)</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>McLeod Ganj Main Square & Cafes</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Triund Trek & Snow Line</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Bhagsu Nag Temple & Waterfall</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Norbulingka Institute</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Dharamshala & McLeodganj Tour Package - 3N/4D">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dalhousie Tour -->
      <div id="dalhousie-tour-package-3n-4d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/himachal.webp"
              alt="Dalhousie Tour"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async"
              fetchpriority="low" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">3 NIGHTS 4 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Dalhousie</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Khajjiar</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Kalatop</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              Dalhousie Tour Package - 3N/4D Khajjiar & Kalatop
            </h3>
            <div class="mb-4">
              <div class="flex flex-wrap gap-3 inclusions-text">
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Stay</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Meals</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Sightseeing & Activities</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Local Transport</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-check-circle text-green-600"></i>
                  <span>Trip Assistance</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-times-circle text-red-500"></i>
                  <span>Flights</span>
                  <span class="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Additional</span>
                </div>
              </div>
            </div>
            <div class="mb-4 space-y-2">
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>BRIEF ITINERARY</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Dalhousie</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Dalhousie sightseeing – Subhash Baoli, Panchpula</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Khajjiar – Mini Switzerland & Kalatop Wildlife Sanctuary</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)">
                <span>KEY ATTRACTIONS</span>
                <i class="fas fa-chevron-down transition-transform"></i>
              </button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Khajjiar – Mini Switzerland of India</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Kalatop Wildlife Sanctuary</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Subhash Baoli & Panchpula</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Dainkund Peak</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>St. John’s Church & Mall Road</span></li>
                </ul>
              </div>
            </div>
            <!-- Card actions: WhatsApp, Call Now, Enquire Now -->
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call">
                <i class="fas fa-phone"></i>
                <span>Call Now</span>
              </a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Dalhousie Tour Package - 3N/4D Khajjiar & Kalatop">
                <i class="fas fa-paper-plane"></i>
                <span>Enquire Now</span>
              </button>
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
            <span>What is included in a Himachal tour package?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Our Himachal tour packages generally include accommodation, sightseeing, daily breakfast, private transfers, and local assistance. Inclusions may vary based on the selected package.</p>
          </div>
        </div>

        <!-- FAQ 2 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>What is the best time to visit Himachal?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>The best time to visit Himachal is from March to June and September to November for pleasant weather. December to February is ideal for snow and winter activities in Manali and Shimla. Monsoon (July-August) can be avoided in lower regions but is fine for Spiti and Lahaul.</p>
          </div>
        </div>

        <!-- FAQ 3 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>How many days are ideal for a Himachal tour?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>A 5 to 7 days Himachal tour is ideal to explore popular destinations like Shimla, Manali, Dharamshala, Kullu, and local attractions comfortably.</p>
          </div>
        </div>

        <!-- FAQ 4 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>Are Himachal tour packages suitable for families and honeymoon couples?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Yes, Himachal tour packages are perfect for families, honeymoon couples, and adventure seekers, with customized itineraries to match different travel needs.</p>
          </div>
        </div>

        <!-- FAQ 5 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>Can the Himachal tour package be customized?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Absolutely! Our Himachal tour packages are fully customizable. You can choose destinations, hotels, transport, and activities as per your preferences and budget.</p>
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
            Your trusted travel partner for amazing Himachal tours. Experience the beauty of snow-clad peaks and valleys with our curated packages.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li><a href="#packages" class="hover:text-white transition-colors">Tour Packages</a></li>
            <li><a href="#faq" class="hover:text-white transition-colors">FAQs</a></li>
            <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>
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
        <p class="text-sm text-gray-300">&copy; 2025 Uno Trips. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Enquiry Popup Modal -->
  <div id="enquiryModal" class="enquiry-modal">
    <div class="enquiry-modal-overlay"></div>
    <div class="enquiry-modal-content">
      <div class="enquiry-modal-header">
        <h3 class="text-xl font-bold text-gray-800">Book Your Himachal Tour</h3>
        <p class="text-sm text-gray-600 mt-1">No spam • Free consultation • We'll call you back</p>
        <button class="enquiry-modal-close" onclick="closeEnquiryModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form class="query-form" action="" method="POST">
        <input type="hidden" name="subjecty" value="Himachal Tour Query ">
        <input type="hidden" name="cityy" value="">
        <input type="hidden" name="destinationy" value="Himachal">
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
          <span class="chatbot-title">Himachal Tour</span>
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