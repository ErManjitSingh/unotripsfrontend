<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

require 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {




  $name = isset($_POST['namey']) ? trim($_POST['namey']) : '';
  $mobile = isset($_POST['phoney']) ? trim($_POST['phoney']) : '';
  $city = isset($_POST['cityy']) ? trim($_POST['cityy']) : '';
  $subject = isset($_POST['subjecty']) ? trim($_POST['subjecty']) : 'Arunachal Tour Query';
  $packageTitle = isset($_POST['package-title']) ? trim($_POST['package-title']) : '';

  if (empty($name) || empty($mobile)) {
    echo "<script>alert('Please enter your name and phone number.');</script>";
    exit();
  }

  $lines = [];
  $lines[] = "New Arunachal Enquiry";
  if (!empty($packageTitle)) {
    $lines[] = "Package: " . $packageTitle;
  }
  $lines[] = "Name: " . $name;
  $lines[] = "Mobile: " . $mobile;
  if (!empty($city)) {
    $lines[] = "City: " . $city;
  }
  $message = implode("\n", $lines) . "\n";

  $mail = new PHPMailer(true);

  try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'unotripsit@gmail.com';
    $mail->Password = 'srwg qxtj izrw kcmw';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->setFrom('query@ptwhotels.com', 'Uno Trips');

    $mail->addAddress('unotripsit@gmail.com');
    $mail->addAddress('manjitsingh012345@gmail.com');
    $mail->Subject = !empty($packageTitle) ? ($subject . " - " . $packageTitle) : $subject;
    $mail->Body = $message;

    if (!$mail->send()) {
      echo 'Mailer Error: ' . $mail->ErrorInfo;
      exit();
    }
    header('Location: thankyou.html');
    exit();
  } catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: " . $e->getMessage();
    exit();
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
  <title>Arunachal Pradesh Tour Packages | Tawang Ziro Bomdila Tour - Uno Trips</title>
  <meta name="description" content="Book best Arunachal Pradesh tour packages - Tawang, Ziro Valley, Bomdila, Dirang. Arunachal honeymoon & group tours. Get free quote. Best price guaranteed." />
  <meta name="keywords" content="arunachal tour packages, arunachal trip, arunachal travel package, tawang ziro tour, arunachal holiday packages, arunachal honeymoon package, arunachal group tour, arunachal tour price, book arunachal tour, arunachal vacation package, arunachal trip cost, best arunachal packages" />
  <meta name="robots" content="index, follow" />
  <?php if (!empty($canonical_url)) {
    echo '<link rel="canonical" href="' . htmlspecialchars($canonical_url) . '" />';
  } ?>
  <meta name="theme-color" content="#1f2937" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Arunachal Pradesh Tour Packages | Tawang Ziro Bomdila - Uno Trips" />
  <meta property="og:description" content="Book best Arunachal Pradesh tour packages - Tawang, Ziro, Bomdila. Get free quote. Best price guaranteed." />

  <link rel="dns-prefetch" href="//cdn.tailwindcss.com">
  <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="//www.googletagmanager.com">
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="img/sela-pass-oddessemania.jpg" as="image" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
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
      "name": "Uno Trips - Arunachal Pradesh Tour Packages",
      "description": "Book Arunachal Pradesh tour packages - Tawang, Ziro Valley, Bomdila, Dirang. Arunachal honeymoon packages, group tours, custom itineraries.",
      "telephone": "+91-7876505119",
      "areaServed": "Arunachal Pradesh, India",
      "serviceType": ["Arunachal Tour Packages", "Arunachal Trip", "Tawang Ziro Tour", "Arunachal Honeymoon Package", "Arunachal Group Tour"],
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Arunachal Pradesh",
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
          "name": "What is included in an Arunachal Pradesh tour package?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our Arunachal Pradesh tour packages generally include accommodation, sightseeing, daily breakfast, private transfers, permits (ILP/PAP), and local assistance. Inclusions may vary based on the selected package."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best time to visit Arunachal Pradesh?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best time to visit Arunachal Pradesh is from October to April for pleasant weather. March to May offers blooming rhododendrons and clear views, while October to November provides the clearest Himalayan vistas. Monsoon (June-September) should be avoided due to landslides."
          }
        },
        {
          "@type": "Question",
          "name": "How many days are ideal for an Arunachal Pradesh tour?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A 7 to 10 days Arunachal Pradesh tour is ideal to explore popular destinations like Tawang, Ziro Valley, Bomdila, Dirang, Itanagar, and local attractions comfortably."
          }
        },
        {
          "@type": "Question",
          "name": "Are Arunachal Pradesh tour packages suitable for families and honeymoon couples?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Arunachal Pradesh tour packages are perfect for families, honeymoon couples, and adventure seekers, with customized itineraries to match different travel needs."
          }
        },
        {
          "@type": "Question",
          "name": "Can the Arunachal Pradesh tour package be customized?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Our Arunachal Pradesh tour packages are fully customizable. You can choose destinations, hotels, transport, and activities as per your preferences and budget."
          }
        }
      ]
    }
  </script>

  <link rel="stylesheet" href="style.css" />
</head>

<body class="bg-white page-body">
  <!-- Page Loader -->
  <div id="page-loader" class="page-loader">
    <div class="loader-backdrop"></div>
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
      <p class="loader-tagline">Explore Arunachal Pradesh</p>
      <div class="loader-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="loader-bar">
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
    <div class="hero-overlay"></div>
    <!-- Hero content -->
    <div class="hero-content absolute inset-0 flex flex-col items-center justify-center w-full px-4 z-10 text-center">
      <p class="hero-badge text-white/90 text-xs md:text-sm font-semibold tracking-widest uppercase mb-3">Best Arunachal Pradesh Tour Packages</p>
      <h1 class="hero-title text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-lg">ARUNACHAL PRADESH</h1>
      <p class="hero-subtitle text-white/90 text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-xl">Explore the land of rising sun and pristine valleys</p>
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
          Arunachal Tour Package
        </h1>
        <p class="text-gray-500 text-sm md:text-base">No spam • Free consultation • Instant response on WhatsApp</p>
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
          <span>Arunachal Tour Package</span>
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

  <!-- Arunachal Pradesh Packages Section -->
  <section id="packages" class="packages-section py-10 px-4 md:px-6">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Arunachal Pradesh Tour Packages
      </h2>
      <p class="text-gray-500 mb-8 text-sm md:text-base">Handpicked itineraries for every traveller</p>

      <!-- Package Card 1: Arunachal Tawang Special -->
      <div id="8-day-arunachal-group-tour-tawang-special-bomdila-dirang" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/sela-pass-oddessemania.jpg"
              alt="Arunachal Tawang Special"
              class="w-full h-full object-cover"
              width="600"
              height="400"
              loading="lazy"
              decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2">
              <span class="text-sm font-semibold text-gray-600">7 NIGHTS 8 DAYS</span>
            </div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Guwahati</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Tawang</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Bomdila</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Dirang</span> <i class="fas fa-arrow-right mx-1"></i>
              <span>Bhalukpong</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              8-Day Arunachal Pradesh Group Tour Package - Tawang Special
            </h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati, drive to Bhalukpong</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Bhalukpong to Dirang via Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Dirang to Tawang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Tawang Monastery & local sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Bumla Pass & Madhuri Lake excursion</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Tawang to Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Bomdila sightseeing & drive to Guwahati</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 8: Departure from Guwahati</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tawang Monastery - Largest in India</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Bumla Pass & Madhuri Lake</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Sela Pass - 13,700 ft high</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Bomdila Monastery</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Dirang Valley & Hot Springs</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>War Memorial & Jaswant Garh</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="8-Day Arunachal Pradesh Group Tour - Tawang Special"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 2: Arunachal Adventure & Culture Special -->
      <div id="9-days-arunachal-group-tour-adventure-special-ziro-tawang-mechuka" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800">
          <i class="fas fa-arrow-trend-up"></i>
          <span>TRENDING NOW</span>
        </div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/1523337870_ziro.jpg.webp" alt="Arunachal Adventure Culture Special" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">9 NIGHTS 10 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600">
              <span>Itanagar</span> - <span>Ziro Valley</span> - <span>Tawang</span> - <span>Bomdila</span> - <span>Dirang</span>
            </div>
            <h3 class="package-title font-bold text-gray-800 mb-4">
              9 Days Arunachal Pradesh Tour - Adventure & Culture Special
            </h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati to Itanagar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Itanagar sightseeing & tribal culture</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Travel to Ziro Valley</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Ziro Valley & Apatani tribe visit</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Ziro to Dirang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Dirang to Tawang via Sela Pass</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Tawang Monastery & Bumla Pass</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 8: Tawang to Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 9: Bomdila sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 10: Drive to Guwahati & Departure</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="9 Days Arunachal Pradesh Tour - Adventure & Culture Special"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 3: Tawang Bomdila Tour Package -->
      <div id="tawang-bomdila-tour-package-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/Tawang_Monestry2.jpg" alt="Tawang Bomdila Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">5 NIGHTS 6 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Tawang</span> <i class="fas fa-arrow-right mx-1"></i> <span>Bomdila</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Tawang Bomdila Tour Package (5N/6D)</h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati to Bhalukpong</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Bhalukpong to Dirang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Dirang to Tawang via Sela Pass</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Tawang Monastery & local sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Tawang to Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Bomdila to Guwahati & Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tawang Monastery</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Sela Pass & Sela Lake</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Bomdila Monastery</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Tawang Bomdila Tour Package (5N/6D)"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 4: Tawang Ziro Valley Tour -->
      <div id="tawang-ziro-valley-tour-6n-7d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/1523337870_ziro.jpg.webp" alt="Tawang Ziro Valley Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">6 NIGHTS 7 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Tawang</span> <i class="fas fa-arrow-right mx-1"></i> <span>Bomdila</span> <i class="fas fa-arrow-right mx-1"></i> <span>Ziro Valley</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Tawang Ziro Valley Tour (6N/7D)</h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati to Dirang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Dirang to Tawang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Tawang sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Tawang to Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Bomdila to Ziro Valley</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Ziro Valley exploration</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Ziro to Guwahati & Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tawang Monastery & Bumla Pass</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Bomdila View & Monasteries</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Ziro Valley & Apatani Tribe</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Tawang Ziro Valley Tour (6N/7D)"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 5: Ziro Valley Dirang Tour -->
      <div id="ziro-valley-dirang-tour-package-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/1523337870_ziro.jpg.webp" alt="Ziro Valley Dirang Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Ziro Valley</span> <i class="fas fa-arrow-right mx-1"></i> <span>Dirang</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Ziro Valley Dirang Tour Package (4N/5D)</h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati to Itanagar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Itanagar to Ziro Valley</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Ziro Valley & Apatani village visit</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Ziro to Dirang via Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Dirang to Guwahati & Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Ziro Valley Rice Fields</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Apatani Tribal Village</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Dirang Hot Springs</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Ziro Valley Dirang Tour Package (4N/5D)"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 6: Itanagar Tawang Tour -->
      <div id="itanagar-tawang-tour-4n-5d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100">
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/Arunachal-Pradesh-Dirang.jpg" alt="Itanagar Tawang Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">4 NIGHTS 5 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Itanagar</span> <i class="fas fa-arrow-right mx-1"></i> <span>Tawang</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Itanagar Tawang Tour (4N/5D)</h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Itanagar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Itanagar sightseeing</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Itanagar to Dirang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Dirang to Tawang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Tawang sightseeing & Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Itanagar Fort & Museum</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tawang Monastery</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Sela Pass</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Itanagar Tawang Tour (4N/5D)"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 7: Complete Arunachal Pradesh Tour -->
      <div id="complete-arunachal-tour-tawang-ziro-itanagar-8n-9d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800">
          <i class="fas fa-arrow-trend-up"></i><span>TRENDING NOW</span>
        </div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/giant-budhha-statue-tawang-arunachal-pradesh-2-attr-hero.jpg" alt="Complete Arunachal Tour" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">8 NIGHTS 9 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Tawang</span> <i class="fas fa-arrow-right mx-1"></i> <span>Ziro Valley</span> <i class="fas fa-arrow-right mx-1"></i> <span>Itanagar</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Complete Arunachal Pradesh Tour – Tawang, Ziro & Itanagar (8N/9D)</h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati to Bhalukpong</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Bhalukpong to Dirang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Dirang to Tawang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4-5: Tawang exploration</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Tawang to Bomdila</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 7: Bomdila to Ziro Valley</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 8: Ziro to Itanagar</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 9: Itanagar to Guwahati & Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tawang Monastery & Bumla Pass</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Ziro Valley & Apatani Culture</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Itanagar Fort & Museum</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Complete Arunachal Pradesh Tour – Tawang, Ziro & Itanagar (8N/9D)"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Card 8: Romantic Arunachal Pradesh Honeymoon -->
      <div id="romantic-arunachal-honeymoon-tawang-dirang-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="trending-tag absolute top-4 left-4 z-10 bg-yellow-400 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold text-gray-800">
          <i class="fas fa-arrow-trend-up"></i><span>TRENDING NOW</span>
        </div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img src="img/Arunachal-Pradesh-Dirang.jpg" alt="Romantic Arunachal Honeymoon" class="w-full h-full object-cover" width="600" height="400" loading="lazy" decoding="async" />
          </div>
          <div class="package-details md:w-1/2 p-6">
            <div class="mb-2"><span class="text-sm font-semibold text-gray-600">5 NIGHTS 6 DAYS</span></div>
            <div class="mb-3 text-sm text-gray-600"><span>Tawang</span> <i class="fas fa-arrow-right mx-1"></i> <span>Dirang</span></div>
            <h3 class="package-title font-bold text-gray-800 mb-4">Romantic Arunachal Pradesh Honeymoon – Tawang & Dirang (5N/6D)</h3>
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
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="itinerary-list">
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 1: Arrival in Guwahati to Bhalukpong</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 2: Bhalukpong to Dirang</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 3: Dirang romantic tour & hot springs</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 4: Dirang to Tawang via Sela Pass</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 5: Tawang romantic spots & Madhuri Lake</span></li>
                  <li><i class="fas fa-calendar-day text-blue-500"></i><span>Day 6: Tawang to Guwahati & Departure</span></li>
                </ul>
              </div>
              <button class="collapsible-btn w-full text-left flex items-center justify-between py-2 text-sm font-semibold text-gray-700" onclick="toggleCollapsible(this)"><span>KEY ATTRACTIONS</span><i class="fas fa-chevron-down transition-transform"></i></button>
              <div class="collapsible-content hidden text-sm text-gray-600 pl-4">
                <ul class="attractions-list">
                  <li><i class="fas fa-star text-yellow-500"></i><span>Dirang Hot Springs</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Sela Pass & Madhuri Lake</span></li>
                  <li><i class="fas fa-star text-yellow-500"></i><span>Tawang Monastery</span></li>
                </ul>
              </div>
            </div>
            <div class="package-card-actions mt-4 flex flex-wrap items-center gap-3">
              <a href="https://wa.me/917876505119" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></a>
              <a href="tel:+917876505119" class="package-card-btn package-card-btn-call"><i class="fas fa-phone"></i><span>Call Now</span></a>
              <button type="button" class="package-card-btn package-card-btn-enquire package-enquire-btn" data-package-title="Romantic Arunachal Pradesh Honeymoon – Tawang & Dirang (5N/6D)"><i class="fas fa-paper-plane"></i><span>Enquire Now</span></button>
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

  <!-- Why Arunachal — reasons to visit -->
  <section id="why-arunachal" class="why-arunachal-section py-12 md:py-16 px-4 md:px-6 bg-slate-50">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-10 md:mb-12">
        <p class="text-blue-600 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-3">Why Arunachal</p>
        <h2 class="text-2xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight px-2">
          5 Reasons Arunachal Will Change You
        </h2>
        <div class="why-arunachal-accent mx-auto w-12 h-1 rounded-full bg-orange-500" aria-hidden="true"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <article class="why-arunachal-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-shadow hover:shadow-md">
          <div class="text-amber-500 text-2xl mb-4" aria-hidden="true"><i class="fas fa-place-of-worship"></i></div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Ancient Monasteries</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Tawang Gompa, one of India's largest and most revered Buddhist monasteries, stands as a spiritual beacon at 3,048m. Walk through centuries of living Buddhist heritage.
          </p>
        </article>
        <article class="why-arunachal-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-shadow hover:shadow-md">
          <div class="text-amber-500 text-2xl mb-4" aria-hidden="true"><i class="fas fa-mountain"></i></div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Majestic Mountain Passes</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Sela Pass at 4,170m offers breathtaking Himalayan panoramas and snowfields that exist even in peak summer. Bumla Pass takes you to the Indo-China border.
          </p>
        </article>
        <article class="why-arunachal-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-shadow hover:shadow-md">
          <div class="text-amber-500 text-2xl mb-4" aria-hidden="true"><i class="fas fa-users"></i></div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Living Tribal Cultures</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Meet the Apatani, Nyishi, Adi, and Monpa tribes. Their festivals, architecture, and way of life are a window into a pre-modern world rarely seen by outsiders.
          </p>
        </article>
        <article class="why-arunachal-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-shadow hover:shadow-md">
          <div class="text-amber-500 text-2xl mb-4" aria-hidden="true"><i class="fas fa-camera"></i></div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Lakes &amp; Waterfalls</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Madhuri Lake, Shungester Lake, and Nuranang Falls are pure visual spectacles. These are the kinds of places that make every shot look like a professional photo.
          </p>
        </article>
        <article class="why-arunachal-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-shadow hover:shadow-md">
          <div class="text-amber-500 text-2xl mb-4" aria-hidden="true"><i class="fas fa-leaf"></i></div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Peaceful, Uncrowded Travel</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Unlike popular Himalayan circuits, Arunachal is blissfully crowd-free. You get the entire mountain to yourself — no tourist rush, just raw, authentic nature.
          </p>
        </article>
        <article class="why-arunachal-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-shadow hover:shadow-md">
          <div class="text-amber-500 text-2xl mb-4" aria-hidden="true"><i class="fas fa-shield-alt"></i></div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Safe with Expert Guides</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Uno Trips manages ILP permits, road logistics, and safety protocols with trusted local partners so your journey through Arunachal stays smooth and worry-free.
          </p>
        </article>
      </div>
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
            <p>Our Arunachal Pradesh tour packages generally include accommodation, sightseeing, daily breakfast, private transfers, permits (ILP/PAP), and local assistance. Inclusions may vary based on the selected package.</p>
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
            <p>The best time to visit Arunachal Pradesh is from October to April for pleasant weather. March to May offers blooming rhododendrons and clear views, while October to November provides the clearest Himalayan vistas. Monsoon (June-September) should be avoided due to landslides.</p>
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
            <p>A 7 to 10 days Arunachal Pradesh tour is ideal to explore popular destinations like Tawang, Ziro Valley, Bomdila, Dirang, Itanagar, and local attractions comfortably.</p>
          </div>
        </div>

        <!-- FAQ 4 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>Are Arunachal Pradesh tour packages suitable for families and honeymoon couples?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Yes, Arunachal Pradesh tour packages are perfect for families, honeymoon couples, and adventure seekers, with customized itineraries to match different travel needs.</p>
          </div>
        </div>

        <!-- FAQ 5 -->
        <div class="faq-item bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="faq-question w-full text-left flex items-center justify-between p-5 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            onclick="toggleFaq(this)">
            <span>Can the Arunachal Pradesh tour package be customized?</span>
            <i class="fas fa-chevron-down transition-transform text-blue-600"></i>
          </button>
          <div class="faq-answer hidden p-5 pt-0 text-gray-600">
            <p>Absolutely! Our Arunachal Pradesh tour packages are fully customizable. You can choose destinations, hotels, transport, and activities as per your preferences and budget.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Arunachal Pradesh Tour Packages -->
  <section id="about" class="about-section py-12 px-4 md:px-6 bg-white">
    <div class="container mx-auto max-w-3xl">
      <h2 class="text-lg md:text-xl font-bold text-center text-gray-800 mb-4">
        About Arunachal Pradesh Tour Packages
      </h2>
      <div class="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
        <p>
          <strong>Arunachal Pradesh</strong> — the <strong>Land of the Rising Sun</strong> — is one of India’s most extraordinary travel destinations and still one of the most uncrowded. With <strong>snowy mountain passes</strong>, <strong>serene lakes</strong>, dramatic valleys, and <strong>living tribal traditions</strong>, an <strong>Arunachal Pradesh tour package</strong> feels like a new discovery every day.
        </p>
        <p>
          <strong>Tawang</strong> is often the highlight of an <strong>Arunachal tour</strong> — home to the iconic <strong>Tawang Monastery</strong> and breathtaking high‑altitude scenery. Scenic routes via <strong>Sela Pass</strong> and <strong>Bumla Pass</strong> add unforgettable Himalayan views, making <strong>Tawang tour packages</strong> perfect for families, couples, and first‑time travellers.
        </p>

        <div id="aboutMore" class="hidden">
          <p>
            <strong>Ziro Valley</strong> (a UNESCO World Heritage contender) is famous for the <strong>Apatani tribe</strong>, pine forests, and peaceful rice fields — ideal for culture lovers and slow travel. <strong>Dirang</strong> and <strong>Bomdila</strong> are charming stopovers with apple orchards, hot springs, monasteries, and panoramic viewpoints, and they fit beautifully into many <strong>Arunachal tour packages</strong>.
          </p>
          <p>
            Most travellers require an <strong>Inner Line Permit (ILP)</strong> for <strong>Arunachal Pradesh</strong>. We help with <strong>ILP permits</strong>, route planning, hotel stays, transport, and local support so your <strong>Arunachal Pradesh tour</strong> is comfortable, safe, and smooth.
          </p>
          <p>
            Whether you’re planning an <strong>Arunachal honeymoon package</strong>, a family holiday, or an adventure circuit, our <strong>Arunachal Pradesh tour packages</strong> are <strong>customizable</strong> to match your time, budget, and preferred destinations — including <strong>Tawang</strong>, <strong>Ziro</strong>, <strong>Bomdila</strong>, and <strong>Dirang</strong>.
          </p>
        </div>

        <button
          type="button"
          id="aboutToggle"
          class="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-2"
          onclick="toggleAboutReadMore()">
          <span class="about-toggle-text">Read More</span>
          <i class="fas fa-chevron-down transition-transform text-blue-600 about-toggle-icon"></i>
        </button>
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
            Your trusted travel partner for amazing Arunachal Pradesh tours. Experience the beauty of pristine mountains, monasteries, and tribal culture with our curated packages.
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
        <p class="text-sm text-gray-300">&copy; 2026 Uno Trips. All rights reserved.</p>
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
        <input type="hidden" name="subjecty" value="Arunachal Tour Query ">
        <input type="hidden" name="cityy" value="">
        <input type="hidden" name="destinationy" value="Arunachal">
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
        <input type="hidden" id="package-title" name="package-title" value="">

        <button type="submit" name="submit" class="enquiry-submit-btn" id="btnSubmit">
          <i class="fas fa-spinner enquiry-submit-spinner" style="display:none;"></i>
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
          <span class="chatbot-title">Arunachal Tour</span>
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
      <span class="chatbot-badge">1</span>
      <i class="fas fa-comments"></i>
    </button>
  </div>

  <script src="script.js" defer></script>
</body>

</html>