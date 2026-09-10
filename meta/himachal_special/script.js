// Run DOM-dependent code when ready
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".whatsapp-btn").forEach((btn) => {
    if (btn.tagName === "BUTTON") {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(window.HIMACHAL_WA_QUOTE || "https://wa.me/917876505119", "_blank");
      });
    }
  });

  // Chatbot: load script only when user first clicks the toggle
  (function () {
    var toggle = document.getElementById("chatbotToggle");
    if (!toggle) return;
    var loaded = false;
    function loadChatbotAndOpen() {
      if (loaded) return;
      loaded = true;
      var s = document.createElement("script");
      s.src = "chatbot.js";
      s.async = true;
      s.onload = function () {
        toggle.click();
      };
      document.body.appendChild(s);
    }
    toggle.addEventListener(
      "click",
      function (e) {
        if (!loaded) {
          e.preventDefault();
          e.stopImmediatePropagation();
          loadChatbotAndOpen();
        }
      },
      true
    );
  })();
});

function openEnquiryModal() {
  const modal = document.getElementById("enquiryModal");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeEnquiryModal() {
  const modal = document.getElementById("enquiryModal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function selectPricingTier(tier) {
  var field = document.getElementById("pricing-tier");
  if (field) field.value = tier || "";
  var pkg = document.getElementById("package-title");
  if (pkg) {
    pkg.value =
      tier === "premium"
        ? "Premium Himachal Family Package (from ₹15,000)"
        : "Budget Himachal Package (from ₹5,000)";
  }
  document.querySelectorAll(".pricing-tier").forEach(function (el) {
    el.classList.toggle("is-selected", el.getAttribute("data-tier") === tier);
  });
  openEnquiryModal();
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("enquiryModal");
  if (!modal) return;
  const overlay = modal.querySelector(".enquiry-modal-overlay");
  if (overlay) overlay.addEventListener("click", closeEnquiryModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeEnquiryModal();
    }
  });
});

document.querySelectorAll(".package-enquire-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const packageTitle = btn.getAttribute("data-package-title") || "";
    const packageTitleField = document.getElementById("package-title");
    if (packageTitleField) packageTitleField.value = packageTitle;
    openEnquiryModal();
  });
});

document.querySelectorAll(".customize-package-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const card = link.closest(".package-card");
    const enquireBtn = card ? card.querySelector(".package-enquire-btn") : null;
    const packageTitle = enquireBtn
      ? enquireBtn.getAttribute("data-package-title") || ""
      : "";
    const packageTitleField = document.getElementById("package-title");
    if (packageTitleField) packageTitleField.value = packageTitle;
    openEnquiryModal();
  });
});

function nativeFormSubmit(form) {
  var sub = document.createElement("input");
  sub.type = "hidden";
  sub.name = "submit";
  sub.value = "1";
  form.appendChild(sub);
  HTMLFormElement.prototype.submit.call(form);
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector(".query-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = document.getElementById("btnSubmit");
    function setLoading(loading) {
      if (!btn) return;
      btn.disabled = loading;
      btn.classList.toggle("loading", loading);
      var text = btn.querySelector(".btn-text");
      if (text) text.textContent = loading ? "Submitting..." : "Get Free Quote";
    }
    setLoading(true);
    nativeFormSubmit(form);
  });
});

function toggleCollapsible(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector("i");

  button.classList.toggle("active");
  content.classList.toggle("active");
  content.classList.toggle("hidden");

  if (content.classList.contains("active")) {
    icon.style.transform = "rotate(180deg)";
  } else {
    icon.style.transform = "rotate(0deg)";
  }
}

function toggleFaq(button) {
  const faqItem = button.closest(".faq-item");
  const answer = faqItem.querySelector(".faq-answer");
  const icon = button.querySelector("i");

  document.querySelectorAll(".faq-item").forEach((item) => {
    if (item !== faqItem) {
      item.querySelector(".faq-answer").classList.add("hidden");
      item.querySelector(".faq-question").classList.remove("active");
      item.querySelector(".faq-question i").style.transform = "rotate(0deg)";
    }
  });

  answer.classList.toggle("hidden");
  button.classList.toggle("active");

  if (answer.classList.contains("hidden")) {
    icon.style.transform = "rotate(0deg)";
  } else {
    icon.style.transform = "rotate(180deg)";
  }
}

// Deep-link hashes → matching package cards (e.g. #HoneymoonTour)
document.addEventListener("DOMContentLoaded", function () {
  var HASH_ALIASES = {
    McLeodganjTourPackage: "DharamshalaTourPackage",
    McLeodGanjTourPackage: "DharamshalaTourPackage",
    Dharamshala: "DharamshalaTourPackage",
    Honeymoon: "HoneymoonTour",
    HimachalGroup: "HimachalGroupTour",
    CompleteHimachal: "CompleteHimachalTour",
    "romantic-himachal-honeymoon-shimla-manali-5n-6d": "HoneymoonTour",
    "complete-himachal-tour-shimla-manali-dharamshala-8n-9d": "CompleteHimachalTour",
    "dharamshala-mcleodganj-tour-package-3n-4d": "DharamshalaTourPackage",
    "8-day-himachal-group-tour-hill-station-special-shimla-manali-dalhousie-dharamshala": "HimachalGroupTour",
  };

  function packageCardFor(el) {
    if (!el) return null;
    return el.classList.contains("package-card")
      ? el
      : el.closest(".package-card");
  }

  function scrollToPackageHash() {
    var raw = (window.location.hash || "").replace(/^#/, "").trim();
    if (!raw) return false;
    if (raw === "book-now" || raw === "BookNow" || raw === "packages" || raw === "himachal-guide") {
      return false;
    }
    var targetId = HASH_ALIASES[raw] || raw;
    var el = document.getElementById(targetId) || document.getElementById(raw);
    var card = packageCardFor(el);
    if (!card) return false;

    document.querySelectorAll(".package-card.is-hash-target").forEach(function (c) {
      c.classList.remove("is-hash-target");
    });
    card.classList.add("is-hash-target");

    var headerOffset = 90;
    var top = card.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return true;
  }

  var scrolledToHash = scrollToPackageHash();
  window.addEventListener("hashchange", scrollToPackageHash);

  // Intent routing: informational → guide; transactional → packages/form
  // Skip when a package hash is present so deep-links win.
  if (scrolledToHash) return;

  var intent = document.documentElement.getAttribute("data-lp-intent") || "transactional";
  if (intent === "informational") {
    var guide = document.getElementById("himachal-guide");
    if (guide && window.location.hash === "") {
      setTimeout(function () {
        guide.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  } else if (intent === "transactional" && /[?&](intent|utm_term)=(book|package|quote)/i.test(window.location.search)) {
    var pkgs = document.getElementById("packages");
    if (pkgs && window.location.hash === "") {
      setTimeout(function () {
        pkgs.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }
});
