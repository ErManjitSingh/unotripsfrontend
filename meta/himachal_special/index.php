<?php

use PHPMailer\PHPMailer\PHPMailer;

require 'vendor/autoload.php';
require_once __DIR__ . '/mail_smtp.php';
require_once __DIR__ . '/crm_lead_push.php';

if (isset($_POST['submit'])) {




  $name = isset($_POST['namey']) ? trim($_POST['namey']) : '';
  $mobile = isset($_POST['phoney']) ? trim($_POST['phoney']) : '';
  $email = isset($_POST['emaily']) ? trim($_POST['emaily']) : '';
  $city = isset($_POST['cityy']) ? trim($_POST['cityy']) : '';
  $subject = isset($_POST['subjecty']) ? trim($_POST['subjecty']) : 'Himachal Tour Query';
  $packageTitle = isset($_POST['package-title']) ? trim($_POST['package-title']) : '';
  $pricingTier = isset($_POST['pricing-tier']) ? trim($_POST['pricing-tier']) : '';
  $destination = isset($_POST['destinationy']) ? trim($_POST['destinationy']) : 'Himachal';

  if (empty($name) || empty($mobile)) {
    echo "<script>alert('Please enter your name and phone number.');</script>";
    exit();
  }

  $message = $name . " wrote the following details:" . "\n" . "Name: " . $name . "\n" . "Mobile: " . $mobile . "\n";
  if (!empty($email)) {
    $message .= "Email: " . $email . "\n";
  }
  $message .= "Destination: " . $destination . "\n";
  $message .= "City: " . $city . "\n";
  if (!empty($pricingTier)) {
    $message .= "Pricing Tier: " . $pricingTier . "\n";
  }
  if (!empty($packageTitle)) {
    $message .= "Package: " . $packageTitle . "\n";
  }

  $crmResult = uno_crm_push_lead([
    'name' => $name,
    'phone' => $mobile,
    'email' => $email,
    'destination' => $destination !== '' ? $destination : 'Himachal',
    'city' => $city,
    'source' => 'Himachal Landing Page',
    'sourceLabel' => 'Himachal Landing Page',
    'package' => trim(($pricingTier !== '' ? '[' . ucfirst($pricingTier) . '] ' : '') . $packageTitle),
    'captureType' => 'form',
    'channel' => 'meta',
  ]);
  $crmOk = !empty($crmResult['success']);

  $mailOk = false;
  $mail = new PHPMailer(true);
  try {
    uno_trips_smtp_configure($mail);
    $mail->setFrom('query@ptwhotels.com', 'Uno Trips');
    $mail->addAddress('unotripsit@gmail.com');
    $mail->addAddress('manjitsingh012345@gmail.com');
    $mail->Subject = $subject;
    $mail->Body = $message;
    $mailOk = $mail->send();
  } catch (Exception $e) {
    error_log('[himachal form] mail failed: ' . $e->getMessage());
  }

  if ($crmOk || $mailOk) {
    echo "<script>window.location.href = 'thankyou.html';</script>";
    exit();
  }

  echo 'Could not save enquiry. Please call us or try WhatsApp.';
}

?>



<?php
$canonical_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? '');
$canonical_url = rtrim(preg_replace('/\?.*/', '', $canonical_url), '/') ?: '';

// Ad → page consistency: mirror Family / Honeymoon headlines from URL params
$ad_signal = strtolower(trim(implode(' ', array_filter([
  $_GET['theme'] ?? '',
  $_GET['utm_campaign'] ?? '',
  $_GET['utm_content'] ?? '',
  $_GET['utm_term'] ?? '',
  $_GET['utm_adgroup'] ?? '',
  $_GET['campaign'] ?? '',
]))));
$lp_theme = 'general';
if (preg_match('/honeymoon|romantic|couple/', $ad_signal)) {
  $lp_theme = 'honeymoon';
} elseif (preg_match('/family|kids|children/', $ad_signal)) {
  $lp_theme = 'family';
}

$hero_by_theme = [
  'honeymoon' => [
    'badge' => 'Himachal Honeymoon Specials 2026',
    'title' => 'Himachal Honeymoon Specials',
    'subtitle' => 'Romantic Shimla • Manali getaways for couples',
    'section' => 'Himachal Honeymoon Packages',
    'section_sub' => 'Curated romantic itineraries — transparent pricing from ₹5,000',
    'meta_title' => 'Himachal Honeymoon Packages | Shimla Manali Couples Tour - Uno Trips',
    'meta_desc' => 'Book Himachal honeymoon specials — romantic Shimla & Manali packages from ₹5,000. Free quote on WhatsApp. Verified traveler reviews.',
    'wa' => 'Hi Uno Trips, I want a free quote for Himachal Honeymoon package',
    'form_title' => 'Book Your Himachal Honeymoon',
  ],
  'family' => [
    'badge' => 'Himachal Family Specials 2026',
    'title' => 'Himachal Family Tour Packages',
    'subtitle' => 'Safe, kid-friendly Shimla • Manali • Dharamshala trips',
    'section' => 'Himachal Family Packages',
    'section_sub' => 'Premium family packages from ₹5,000 — budget & premium tiers',
    'meta_title' => 'Himachal Family Tour Packages | Shimla Manali Family Trip - Uno Trips',
    'meta_desc' => 'Book premium Himachal family packages from ₹5,000 — Shimla, Manali, Dharamshala. Free quote. Verified reviews & WhatsApp support.',
    'wa' => 'Hi Uno Trips, I want a free quote for Himachal Family package',
    'form_title' => 'Book Your Himachal Family Tour',
  ],
  'general' => [
    'badge' => 'Family & Honeymoon Specials 2026',
    'title' => 'Himachal Family & Honeymoon Packages',
    'subtitle' => 'Shimla • Manali • Dharamshala • Kullu — from ₹5,000',
    'section' => 'Best Himachal Tour Packages',
    'section_sub' => 'Premium family & honeymoon packages from ₹5,000',
    'meta_title' => 'Himachal Family & Honeymoon Packages | Shimla Manali - Uno Trips',
    'meta_desc' => 'Premium Himachal family & honeymoon packages from ₹5,000. Shimla, Manali, Dharamshala. Free quote on WhatsApp. Verified reviews.',
    'wa' => 'Hi Uno Trips, I want a free Himachal quote',
    'form_title' => 'Get a Free Himachal Quote',
  ],
];
$hero = $hero_by_theme[$lp_theme];
$wa_quote_url = 'https://wa.me/917876505119?text=' . rawurlencode($hero['wa']);

// Intent pre-qualification: informational (guide) vs transactional (book)
$intent_signal = strtolower(trim(implode(' ', array_filter([
  $_GET['intent'] ?? '',
  $_GET['utm_term'] ?? '',
  $_GET['utm_content'] ?? '',
  $_GET['q'] ?? '',
  $_GET['keyword'] ?? '',
]))));
$lp_intent = 'transactional';
if (preg_match('/\b(guide|tips|blog|itinerary ideas|what to do|places to visit|travel guide|how to|best time|informational|info)\b/', $intent_signal)
  || (isset($_GET['intent']) && preg_match('/^(guide|info|blog)$/i', $_GET['intent']))) {
  $lp_intent = 'informational';
}
if (preg_match('/\b(book|package|packages|price|cost|quote|enquire|enquiry|deal|offer|booking)\b/', $intent_signal)
  || (isset($_GET['intent']) && preg_match('/^(book|buy|quote)$/i', $_GET['intent']))) {
  $lp_intent = 'transactional';
}

$scarcity_text = 'Only 2 slots left for October Festival departures';
$scarcity_sub = 'Festival window fills fast — lock dates on WhatsApp today';

// TouristTrip packages for JSON-LD (price, destinations, duration)
$tourist_trips = [
  [
    '@type' => 'TouristTrip',
    'name' => 'Shimla Manali Tour Package - 5N/6D',
    'description' => '5 nights 6 days Himachal tour covering Shimla and Manali with stays, breakfast, sightseeing and private transfers.',
    'touristType' => ['Family', 'Couples'],
    'itinerary' => [
      '@type' => 'ItemList',
      'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Shimla', 'address' => ['@type' => 'PostalAddress', 'addressRegion' => 'Himachal Pradesh', 'addressCountry' => 'IN']]],
        ['@type' => 'ListItem', 'position' => 2, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Manali', 'address' => ['@type' => 'PostalAddress', 'addressRegion' => 'Himachal Pradesh', 'addressCountry' => 'IN']]],
      ],
    ],
    'offers' => [
      '@type' => 'Offer',
      'url' => $canonical_url !== '' ? $canonical_url . '#shimla-manali-tour-package-5n-6d' : '#shimla-manali-tour-package-5n-6d',
      'priceCurrency' => 'INR',
      'price' => '5000',
      'priceValidUntil' => '2026-12-31',
      'availability' => 'https://schema.org/LimitedAvailability',
      'category' => 'Budget',
    ],
  ],
  [
    '@type' => 'TouristTrip',
    'name' => 'Romantic Himachal Honeymoon - 5N/6D Shimla & Manali',
    'description' => 'Romantic 5 nights 6 days honeymoon package for couples in Shimla and Manali.',
    'touristType' => ['Honeymoon', 'Couples'],
    'itinerary' => [
      '@type' => 'ItemList',
      'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Shimla']],
        ['@type' => 'ListItem', 'position' => 2, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Manali']],
      ],
    ],
    'offers' => [
      '@type' => 'Offer',
      'url' => $canonical_url !== '' ? $canonical_url . '#romantic-himachal-honeymoon-shimla-manali-5n-6d' : '#romantic-himachal-honeymoon-shimla-manali-5n-6d',
      'priceCurrency' => 'INR',
      'price' => '32000',
      'priceValidUntil' => '2026-12-31',
      'availability' => 'https://schema.org/LimitedAvailability',
      'category' => 'Honeymoon',
    ],
  ],
  [
    '@type' => 'TouristTrip',
    'name' => 'Shimla Manali Dharamshala Tour - 6N/7D',
    'description' => '6 nights 7 days Himachal family tour covering Shimla, Manali and Dharamshala.',
    'touristType' => ['Family'],
    'itinerary' => [
      '@type' => 'ItemList',
      'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Shimla']],
        ['@type' => 'ListItem', 'position' => 2, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Manali']],
        ['@type' => 'ListItem', 'position' => 3, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Dharamshala']],
      ],
    ],
    'offers' => [
      '@type' => 'Offer',
      'url' => $canonical_url !== '' ? $canonical_url . '#shimla-manali-dharamshala-tour-6n-7d' : '#shimla-manali-dharamshala-tour-6n-7d',
      'priceCurrency' => 'INR',
      'price' => '35000',
      'priceValidUntil' => '2026-12-31',
      'availability' => 'https://schema.org/LimitedAvailability',
      'category' => 'Family',
    ],
  ],
  [
    '@type' => 'TouristTrip',
    'name' => 'Complete Himachal Tour - 8N/9D Shimla, Manali & Dharamshala',
    'description' => 'Premium 8 nights 9 days complete Himachal circuit for families.',
    'touristType' => ['Family', 'Group'],
    'itinerary' => [
      '@type' => 'ItemList',
      'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Shimla']],
        ['@type' => 'ListItem', 'position' => 2, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Manali']],
        ['@type' => 'ListItem', 'position' => 3, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Dharamshala']],
      ],
    ],
    'offers' => [
      '@type' => 'Offer',
      'url' => $canonical_url !== '' ? $canonical_url . '#complete-himachal-tour-shimla-manali-dharamshala-8n-9d' : '#complete-himachal-tour-shimla-manali-dharamshala-8n-9d',
      'priceCurrency' => 'INR',
      'price' => '15000',
      'priceValidUntil' => '2026-12-31',
      'availability' => 'https://schema.org/LimitedAvailability',
      'category' => 'Premium',
    ],
  ],
  [
    '@type' => 'TouristTrip',
    'name' => 'Manali Kullu Tour Package - 4N/5D',
    'description' => '4 nights 5 days Manali and Kullu tour — ideal short Himachal getaway.',
    'touristType' => ['Family', 'Couples'],
    'itinerary' => [
      '@type' => 'ItemList',
      'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Manali']],
        ['@type' => 'ListItem', 'position' => 2, 'item' => ['@type' => 'TouristAttraction', 'name' => 'Kullu']],
      ],
    ],
    'offers' => [
      '@type' => 'Offer',
      'url' => $canonical_url !== '' ? $canonical_url . '#manali-kullu-tour-package-4n-5d' : '#manali-kullu-tour-package-4n-5d',
      'priceCurrency' => 'INR',
      'price' => '5000',
      'priceValidUntil' => '2026-12-31',
      'availability' => 'https://schema.org/InStock',
      'category' => 'Budget',
    ],
  ],
];
$tourist_trip_graph = [
  '@context' => 'https://schema.org',
  '@graph' => array_merge(
    [[
      '@type' => 'ItemList',
      'name' => 'Himachal Tour Packages',
      'itemListOrder' => 'https://schema.org/ItemListUnordered',
      'numberOfItems' => count($tourist_trips),
      'itemListElement' => array_map(function ($trip, $i) {
        return [
          '@type' => 'ListItem',
          'position' => $i + 1,
          'item' => $trip,
        ];
      }, $tourist_trips, array_keys($tourist_trips)),
    ]],
    $tourist_trips
  ),
];
?>
<!DOCTYPE html>
<html lang="en" data-lp-theme="<?php echo htmlspecialchars($lp_theme); ?>" data-lp-intent="<?php echo htmlspecialchars($lp_intent); ?>">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo htmlspecialchars($hero['meta_title']); ?></title>
  <meta name="description" content="<?php echo htmlspecialchars($hero['meta_desc']); ?>" />
  <meta name="keywords" content="himachal tour packages, himachal family package, himachal honeymoon package, shimla manali tour, himachal holiday packages, himachal group tour, himachal tour price, book himachal tour, premium himachal packages from 5000" />
  <meta name="robots" content="index, follow" />
  <?php if (!empty($canonical_url)) {
    echo '<link rel="canonical" href="' . htmlspecialchars($canonical_url) . '" />';
  } ?>
  <meta name="theme-color" content="#1f2937" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="<?php echo htmlspecialchars($hero['meta_title']); ?>" />
  <meta property="og:description" content="<?php echo htmlspecialchars($hero['meta_desc']); ?>" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>
  <link rel="preload" href="img/hero.webp" as="image" fetchpriority="high" />
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
      "description": "Book Himachal tour packages - Shimla, Manali, Dharamshala, Kullu. Himachal honeymoon packages, group tours, custom itineraries. Packages from INR 5000.",
      "telephone": "+91-7876505119",
      "url": <?php echo json_encode($canonical_url !== '' ? $canonical_url : 'https://unotrips.in'); ?>,
      "areaServed": "Himachal Pradesh, India",
      "serviceType": ["Himachal Tour Packages", "Himachal Trip", "Shimla Manali Tour", "Himachal Honeymoon Package", "Himachal Group Tour", "5-day Himachal tour"],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "14001",
        "bestRating": "5",
        "worstRating": "1"
      },
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Himachal Pradesh",
        "addressCountry": "IN"
      }
    }
  </script>
  <script type="application/ld+json">
<?php echo json_encode($tourist_trip_graph, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); ?>
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
  <link rel="stylesheet" href="style.ads-fix.css" />
</head>

<body class="bg-white page-body intent-<?php echo htmlspecialchars($lp_intent); ?>">
  <!-- Mobile top CTA — WhatsApp primary -->
  <div class="mobile-top-cta md:hidden">
    <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="mobile-top-cta-wa mobile-top-cta-primary">
      <i class="fab fa-whatsapp"></i>
      <span>WhatsApp Quote</span>
    </a>
    <button type="button" class="mobile-top-cta-quote" onclick="openEnquiryModal()">
      <i class="fas fa-file-invoice"></i>
      <span>Free Quote Form</span>
    </button>
  </div>

  <!-- Scarcity nudge -->
  <div class="scarcity-bar" role="status">
    <i class="fas fa-bolt scarcity-icon" aria-hidden="true"></i>
    <div class="scarcity-copy">
      <strong><?php echo htmlspecialchars($scarcity_text); ?></strong>
      <span><?php echo htmlspecialchars($scarcity_sub); ?></span>
    </div>
    <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="scarcity-wa">Lock on WhatsApp</a>
  </div>

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
      <div class="flex items-center space-x-2 md:space-x-4">
        <a
          href="<?php echo htmlspecialchars($wa_quote_url); ?>"
          target="_blank"
          rel="noopener"
          class="hidden sm:inline-flex header-wa-btn px-3 py-2 rounded-xl text-white font-semibold text-sm items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>WhatsApp Quote</span>
        </a>
        <a
          href="tel:+917876505119"
          class="header-call-btn px-4 py-2 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
          <i class="fas fa-phone text-xs"></i>
          <span class="hidden xs:inline md:inline">+91-7876505119</span>
          <span class="md:hidden">Call</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section with Image -->
  <section class="hero-image relative hero-section">
    <img
      src="img/hero.webp"
      alt="<?php echo htmlspecialchars($hero['title']); ?> — Shimla Manali Dharamshala"
      class="hero-bg-img"
      width="1920"
      height="1080"
      fetchpriority="high"
      decoding="async" />
    <div class="hero-overlay"></div>
    <!-- Hero content -->
    <div class="hero-content absolute inset-0 flex flex-col items-center justify-center w-full px-4 z-10 text-center">
      <p class="hero-badge text-white/90 text-xs md:text-sm font-semibold tracking-widest uppercase mb-3"><?php echo htmlspecialchars($hero['badge']); ?></p>
      <h1 class="hero-title text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 drop-shadow-lg"><?php echo htmlspecialchars($hero['title']); ?></h1>
      <p class="hero-subtitle text-white/90 text-base md:text-lg lg:text-xl mb-3 md:mb-4 max-w-xl"><?php echo htmlspecialchars($hero['subtitle']); ?></p>
      <p class="hero-scarcity mb-4 md:mb-5"><i class="fas fa-fire"></i> <?php echo htmlspecialchars($scarcity_text); ?></p>
      <div class="hero-cta-row flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-lg">
        <a
          href="<?php echo htmlspecialchars($wa_quote_url); ?>"
          target="_blank"
          rel="noopener"
          class="whatsapp-btn hero-wa-btn cta-primary-wa text-white px-5 md:px-8 py-3.5 md:py-4 rounded-2xl text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 shadow-xl">
          <i class="fab fa-whatsapp text-lg"></i>
          <span>WhatsApp Quote — Instant Reply</span>
        </a>
        <button
          type="button"
          class="cta-secondary-form hero-cta-btn text-white px-5 md:px-8 py-3.5 md:py-4 rounded-2xl text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 shadow-xl"
          onclick="openEnquiryModal()">
          <i class="fas fa-file-invoice"></i>
          <span>Get a Free Himachal Quote</span>
        </button>
      </div>
    </div>
    <!-- Review Ratings Overlay + Trust -->
    <div
      class="review-overlay absolute bottom-0 left-0 right-0 py-3 px-4 md:px-6">
      <div class="container mx-auto">
        <p class="text-center text-gray-300 text-xs mb-2">No spam • Free consultation • Instant WhatsApp quote</p>
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
          <?php echo htmlspecialchars($hero['section']); ?>
        </h2>
        <p class="text-gray-500 text-sm md:text-base"><?php echo htmlspecialchars($hero['section_sub']); ?></p>
      </div>

      <!-- Tiered pricing: Budget vs Premium (intent gap fix) -->
      <div class="pricing-tiers grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button type="button" class="pricing-tier pricing-tier-budget text-left" onclick="selectPricingTier('budget')" data-tier="budget">
          <div class="pricing-tier-label">Budget</div>
          <div class="pricing-tier-name">Value Family / Couples</div>
          <div class="pricing-tier-price">From <strong>₹5,000</strong> <span>/ person</span></div>
          <ul class="pricing-tier-perks">
            <li>3★ stays • Private transfers</li>
            <li>Breakfast • Sightseeing</li>
            <li>Best for first-time visitors</li>
          </ul>
          <span class="pricing-tier-cta">Get Budget Quote →</span>
        </button>
        <button type="button" class="pricing-tier pricing-tier-premium text-left" onclick="selectPricingTier('premium')" data-tier="premium">
          <div class="pricing-tier-badge">Most booked</div>
          <div class="pricing-tier-label">Premium</div>
          <div class="pricing-tier-name">Premium Family Packages</div>
          <div class="pricing-tier-price">From <strong>₹15,000</strong> <span>/ person</span></div>
          <ul class="pricing-tier-perks">
            <li>4★ / boutique stays • Private cab</li>
            <li>Meals • Experiences • Trip captain</li>
            <li>Ideal for families & honeymoons</li>
          </ul>
          <span class="pricing-tier-cta">Get Premium Quote →</span>
        </button>
      </div>
      <p class="text-center text-xs text-gray-400 mb-6">Prices are indicative starting fares for popular 5–6 day circuits. Final quote depends on dates, hotel category & group size.</p>

      <!-- WhatsApp primary + form secondary -->
      <div class="flex flex-col items-center gap-4 mt-2">
        <a
          href="<?php echo htmlspecialchars($wa_quote_url); ?>"
          target="_blank"
          rel="noopener"
          class="whatsapp-btn cta-primary-wa text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-bold inline-flex items-center justify-center gap-2 w-full max-w-md">
          <i class="fab fa-whatsapp text-xl"></i>
          <span>WhatsApp Quote — Instant Reply</span>
        </a>
        <button
          type="button"
          class="cta-secondary-form text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl text-sm md:text-base font-semibold flex items-center justify-center gap-2 w-full max-w-md"
          onclick="openEnquiryModal()">
          <i class="fas fa-file-invoice"></i>
          <span>Or get a Free Quote form</span>
        </button>
        <div class="cta-trust text-center text-sm text-gray-500 mt-1">
          <p class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span><i class="fas fa-bolt text-orange-500"></i> <?php echo htmlspecialchars($scarcity_text); ?></span>
            <span><i class="fab fa-whatsapp text-green-500"></i> Instant human reply</span>
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Informational intent: quick travel guide (soft convert) -->
  <section id="himachal-guide" class="guide-section py-10 px-4 md:px-6 <?php echo $lp_intent === 'informational' ? 'guide-priority' : ''; ?>">
    <div class="container mx-auto max-w-4xl">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Himachal Travel Guide</h2>
      <p class="text-gray-500 text-sm md:text-base mb-6">Planning research? Start here — when you’re ready to book, WhatsApp us for a live quote.</p>
      <div class="guide-grid">
        <article class="guide-card">
          <h3>Best time to visit</h3>
          <p>Mar–Jun & Sep–Nov for pleasant weather. Dec–Feb for snow in Manali & Shimla. Perfect for a 5-day Himachal tour.</p>
        </article>
        <article class="guide-card">
          <h3>Classic 5–6 day circuit</h3>
          <p>Shimla (2N) → Manali (3N) covers Mall Road, Solang, and Kullu — the most booked family & honeymoon loop.</p>
        </article>
        <article class="guide-card">
          <h3>What budget to expect</h3>
          <p>Value packages from <strong>₹5,000</strong>/person. Premium family stays from <strong>₹15,000</strong>/person (ex-flights).</p>
        </article>
      </div>
      <div class="guide-cta-row">
        <a href="#packages" class="guide-link-packages">See packages ↓</a>
        <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="whatsapp-btn guide-wa">
          <i class="fab fa-whatsapp"></i> Ready to book? WhatsApp Quote
        </a>
      </div>
    </div>
  </section>

  <!-- Himachal Packages Section -->
  <section id="packages" class="packages-section py-10 px-4 md:px-6 <?php echo $lp_intent === 'transactional' ? 'packages-priority' : ''; ?>">
    <div class="container mx-auto">
      <h2 class="section-heading text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        <?php echo htmlspecialchars($hero['section']); ?>
      </h2>
      <p class="text-gray-500 mb-3 text-sm md:text-base">Handpicked itineraries — Budget from ₹5,000 • Premium from ₹15,000</p>
      <p class="scarcity-inline mb-8"><i class="fas fa-bolt"></i> <?php echo htmlspecialchars($scarcity_text); ?> — book via WhatsApp to reserve.</p>

      <!-- Package Card 1: Hill Station Special -->
      <div id="8-day-himachal-group-tour-hill-station-special-shimla-manali-dalhousie-dharamshala" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="scarcity-tag">Only 2 slots · Oct Festival</div>
        <div class="flex flex-col md:flex-row">
          <!-- Package Image -->
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/himachal-group-opt.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/solang.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
      <div id="shimla-manali-tour-package-5n-6d" class="package-card bg-white rounded-2xl shadow-card mb-6 overflow-hidden border border-gray-100 relative">
        <div class="scarcity-tag">Only 2 slots · Oct Festival</div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/shimla.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/dharamshala-opt.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/kullu.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/himachal-opt.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/hero.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
        <div class="scarcity-tag scarcity-tag-right">Only 2 slots · Oct Festival</div>
        <div class="flex flex-col md:flex-row">
          <div class="package-image md:w-1/2 h-64 md:h-auto relative">
            <img
              src="img/romantic-opt.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/dharamshala-opt.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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
              src="img/himachal-opt.webp"
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="package-card-btn package-card-btn-whatsapp">
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

  <!-- Mid-page CTA: WhatsApp primary -->
  <section class="mid-cta-section py-10 px-4 md:px-6 bg-white border-y border-gray-100">
    <div class="container mx-auto max-w-2xl text-center">
      <p class="scarcity-inline justify-center mb-3"><i class="fas fa-bolt"></i> <?php echo htmlspecialchars($scarcity_text); ?></p>
      <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">Talk to a Travel Expert on WhatsApp</h2>
      <p class="text-gray-500 text-sm md:text-base mb-6">89% of travelers want instant replies — get your Himachal quote in minutes</p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="<?php echo htmlspecialchars($wa_quote_url); ?>"
          target="_blank"
          rel="noopener"
          class="whatsapp-btn cta-primary-wa text-white px-8 py-4 rounded-2xl text-base font-bold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
          <i class="fab fa-whatsapp"></i>
          <span>WhatsApp Quote — Instant Reply</span>
        </a>
        <button
          type="button"
          class="cta-secondary-form text-white px-8 py-4 rounded-2xl text-base font-bold inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          onclick="openEnquiryModal()">
          <i class="fas fa-file-invoice"></i>
          <span>Free Quote Form</span>
        </button>
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
              <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" class="hover:text-white transition-colors">WhatsApp Us</a>
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
    <div class="enquiry-modal-shell">
      <div class="enquiry-trust-panel">
        <h4 class="enquiry-trust-title">Verified Traveler Memories</h4>
        <div class="enquiry-testimonial">
          <div class="enquiry-stars">★★★★★</div>
          <p>“Booked a Shimla–Manali honeymoon. Hotels were exactly as promised and WhatsApp support was instant.”</p>
          <span>— Priya & Rohan, Delhi</span>
        </div>
        <div class="enquiry-testimonial">
          <div class="enquiry-stars">★★★★★</div>
          <p>“Family of 5 — kids loved Solang. Transparent pricing, no last-minute surprises.”</p>
          <span>— Ankit Sharma, Chandigarh</span>
        </div>
        <div class="enquiry-certs">
          <div class="enquiry-cert"><i class="fas fa-certificate"></i> IATA Partner 2026</div>
          <div class="enquiry-cert"><i class="fas fa-shield-alt"></i> GST Registered</div>
          <div class="enquiry-cert"><i class="fas fa-award"></i> 10+ Years Trusted</div>
          <div class="enquiry-cert"><i class="fas fa-star"></i> 4.9 Google · 14k+ reviews</div>
        </div>
        <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="enquiry-wa-link">
          <i class="fab fa-whatsapp"></i> Prefer WhatsApp Quote?
        </a>
      </div>
      <div class="enquiry-modal-content">
        <div class="enquiry-modal-header">
          <h3 class="text-xl font-bold text-gray-800"><?php echo htmlspecialchars($hero['form_title']); ?></h3>
          <p class="text-sm text-gray-600 mt-1">Packages from ₹5,000 · <?php echo htmlspecialchars($scarcity_text); ?></p>
          <button class="enquiry-modal-close" onclick="closeEnquiryModal()" type="button" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="enquiry-wa-primary">
          <i class="fab fa-whatsapp"></i>
          <span>WhatsApp Quote — Instant Reply</span>
        </a>
        <p class="enquiry-or-divider"><span>or fill the form</span></p>
        <div class="enquiry-mobile-trust md:hidden">
          <div class="enquiry-stars">★★★★★ Verified reviews</div>
          <div class="enquiry-certs enquiry-certs-inline">
            <span>IATA 2026</span>
            <span>GST</span>
            <span>4.9★ Google</span>
          </div>
        </div>
        <form class="query-form" action="" method="POST">
          <input type="hidden" name="subjecty" value="Himachal Tour Query ">
          <input type="hidden" name="cityy" value="">
          <input type="hidden" name="destinationy" value="Himachal">
          <input type="hidden" id="pricing-tier" name="pricing-tier" value="">
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
            <span class="btn-text">Get Free Quote</span>
          </button>
          <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="enquiry-wa-btn-mobile">
            <i class="fab fa-whatsapp"></i> WhatsApp Quote instead
          </a>
        </form>
      </div>
    </div>
  </div>

  <!-- Mobile sticky: WhatsApp primary -->
  <div class="mobile-sticky-footer fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 py-2 flex gap-2">
    <a href="<?php echo htmlspecialchars($wa_quote_url); ?>" target="_blank" rel="noopener" class="cta-whatsapp flex-[1.4] text-white font-bold text-sm py-3 rounded-xl inline-flex items-center justify-center gap-2">
      <i class="fab fa-whatsapp"></i>
      <span>WhatsApp Quote</span>
    </a>
    <button type="button" class="cta-secondary-form flex-1 text-white font-bold text-sm py-3 rounded-xl inline-flex items-center justify-center gap-2" onclick="openEnquiryModal()">
      <i class="fas fa-file-invoice"></i>
      <span>Form</span>
    </button>
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

  <script>
    window.HIMACHAL_WA_QUOTE = <?php echo json_encode($wa_quote_url); ?>;
  </script>
  <script src="script.js"></script>
  <script src="https://cdn.tailwindcss.com" defer></script>
</body>

</html>