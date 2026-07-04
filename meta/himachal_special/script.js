// Page Loader - hide when page is ready (with minimum display time)
(function () {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  document.body.style.overflow = "hidden";
  const minLoadTime = 1000;
  const startTime = Date.now();

  function hideLoader() {
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
})();

// Run DOM-dependent code when ready (script has defer, so DOM is ready; this groups init)
document.addEventListener("DOMContentLoaded", function() {

// WhatsApp Button Click (only for buttons; links use href)
document.querySelectorAll(".whatsapp-btn").forEach((btn) => {
  if (btn.tagName === "BUTTON") {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://wa.me/917876505119", "_blank");
    });
  }
});

// Chatbot: load script only when user first clicks the toggle (defer non-critical JS)
(function() {
  var toggle = document.getElementById("chatbotToggle");
  if (!toggle) return;
  var loaded = false;
  function loadChatbotAndOpen() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.src = "chatbot.js";
    s.async = true;
    s.onload = function() {
      toggle.click();
    };
    document.body.appendChild(s);
  }
  toggle.addEventListener("click", function(e) {
    if (!loaded) {
      e.preventDefault();
      e.stopImmediatePropagation();
      loadChatbotAndOpen();
    }
  }, true);
})();

});

// Enquiry Modal Functions
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

// Close modal when clicking overlay
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("enquiryModal");
  const overlay = modal.querySelector(".enquiry-modal-overlay");

  overlay.addEventListener("click", closeEnquiryModal);

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeEnquiryModal();
    }
  });
});

// Primary CTA - Book Now (hero, pricing, mid-page)
document.querySelectorAll(".cta-primary, .gradient-btn").forEach((btn) => {
  if (btn.tagName === "BUTTON") {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openEnquiryModal();
    });
  }
});

// Package Enquire Now Button Click - Handle all package enquiry buttons
document.querySelectorAll(".package-enquire-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const packageTitle = btn.getAttribute("data-package-title") || "";
    const packageTitleField = document.getElementById("package-title");
    if (packageTitleField) packageTitleField.value = packageTitle;
    openEnquiryModal();
  });
});

// Customize Package link - same as enquiry: set package title and open modal
document.querySelectorAll(".customize-package-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const card = link.closest(".package-card");
    const enquireBtn = card ? card.querySelector(".package-enquire-btn") : null;
    const packageTitle = enquireBtn ? (enquireBtn.getAttribute("data-package-title") || "") : "";
    const packageTitleField = document.getElementById("package-title");
    if (packageTitleField) packageTitleField.value = packageTitle;
    openEnquiryModal();
  });
});

// Form submit (native submit - button name="submit" overrides form.submit)
function nativeFormSubmit(form) {
  var sub = document.createElement("input");
  sub.type = "hidden";
  sub.name = "submit";
  sub.value = "1";
  form.appendChild(sub);
  HTMLFormElement.prototype.submit.call(form);
}

document.addEventListener("DOMContentLoaded", function() {
  var form = document.querySelector(".query-form");
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var btn = document.getElementById("btnSubmit");
    function setLoading(loading) {
      if (!btn) return;
      btn.disabled = loading;
      btn.classList.toggle("loading", loading);
      var text = btn.querySelector(".btn-text");
      if (text) text.textContent = loading ? "Submitting..." : "Book Now";
    }
    setLoading(true);
    nativeFormSubmit(form);
  });
});

// Mobile sticky: Call + WhatsApp are direct links (no modal)

// Collapsible Sections Toggle
function toggleCollapsible(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector("i");

  // Toggle active class
  button.classList.toggle("active");
  content.classList.toggle("active");
  content.classList.toggle("hidden");

  // Rotate icon
  if (content.classList.contains("active")) {
    icon.style.transform = "rotate(180deg)";
  } else {
    icon.style.transform = "rotate(0deg)";
  }
}

// FAQ Toggle Function
function toggleFaq(button) {
  const faqItem = button.closest(".faq-item");
  const answer = faqItem.querySelector(".faq-answer");
  const icon = button.querySelector("i");

  // Close other FAQ items
  document.querySelectorAll(".faq-item").forEach((item) => {
    if (item !== faqItem) {
      item.querySelector(".faq-answer").classList.add("hidden");
      item.querySelector(".faq-question").classList.remove("active");
      item.querySelector(".faq-question i").style.transform = "rotate(0deg)";
    }
  });

  // Toggle current FAQ
  answer.classList.toggle("hidden");
  button.classList.toggle("active");

  // Rotate icon
  if (answer.classList.contains("hidden")) {
    icon.style.transform = "rotate(0deg)";
  } else {
    icon.style.transform = "rotate(180deg)";
  }
}
