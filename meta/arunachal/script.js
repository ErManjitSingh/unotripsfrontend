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

// WhatsApp Button Click (only for buttons; links use href)
document.querySelectorAll(".whatsapp-btn").forEach((btn) => {
  if (btn.tagName === "BUTTON") {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://wa.me/917876505119", "_blank");
    });
  }
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
    const packageTitle = enquireBtn
      ? enquireBtn.getAttribute("data-package-title") || ""
      : "";
    const packageTitleField = document.getElementById("package-title");
    if (packageTitleField) packageTitleField.value = packageTitle;
    openEnquiryModal();
  });
});

// Form submit: show loading and allow normal submit (full page POST then redirect to thankyou)
document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector(".query-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    var btn = document.getElementById("btnSubmit");
    var btnText = btn ? btn.querySelector(".btn-text") : null;
    var spinner = btn ? btn.querySelector(".enquiry-submit-spinner") : null;
    if (btn) {
      btn.disabled = true;
      btn.classList.add("loading");
      if (spinner) spinner.style.display = "inline-block";
      if (btnText) btnText.textContent = "Submitting...";
    }
    // Do not prevent default - form submits to same page, PHP sends mail and redirects to thankyou.html
  });
});

// Lazy-load chatbot only on first open (saves initial JS work)
document.addEventListener("DOMContentLoaded", function () {
  var toggleBtn = document.getElementById("chatbotToggle");
  if (!toggleBtn) return;

  var loaded = false;
  toggleBtn.addEventListener(
    "click",
    function (e) {
      if (loaded) return;
      loaded = true;
      e.preventDefault();
      e.stopPropagation();

      var s = document.createElement("script");
      s.src = "chatbot.js";
      s.defer = true;
      s.onload = function () {
        // chatbot.js attaches its own click handler to open/start chat
        setTimeout(function () {
          try {
            toggleBtn.click();
          } catch (_) {}
        }, 0);
      };
      document.body.appendChild(s);
    },
    { capture: true }
  );
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

// About section: Read more/less
function toggleAboutReadMore() {
  const more = document.getElementById("aboutMore");
  const toggleBtn = document.getElementById("aboutToggle");
  if (!more || !toggleBtn) return;

  const textEl = toggleBtn.querySelector(".about-toggle-text");
  const iconEl = toggleBtn.querySelector(".about-toggle-icon");

  const isHidden = more.classList.contains("hidden");
  more.classList.toggle("hidden");

  if (textEl) textEl.textContent = isHidden ? "Read Less" : "Read More";
  if (iconEl) iconEl.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
}
