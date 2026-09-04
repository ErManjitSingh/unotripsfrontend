// Page Loader - hide ASAP (ads: sub-2s mobile; avoid forced 1s wait)
(function () {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  document.body.style.overflow = "hidden";
  const minLoadTime = 200;
  const startTime = Date.now();
  let hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadTime - elapsed);
    setTimeout(() => {
      loader.classList.add("loader-hidden");
      document.body.style.overflow = "";
    }, remaining);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }
  // Fallback: never block past 1.2s even if assets hang
  setTimeout(hideLoader, 1200);
})();

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

// Intent routing: informational → guide; transactional → packages/form
document.addEventListener("DOMContentLoaded", function () {
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
