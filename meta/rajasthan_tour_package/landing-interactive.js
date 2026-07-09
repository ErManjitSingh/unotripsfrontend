(function () {
  "use strict";

  var SEND = "./send_lead.php";
  var THANK = "./thank-you.html";
  var PHONE_TEL = "tel:+917876505119";

  var TRUST_BADGES = [
    { brand: "TRIP\nADVISOR", score: "4.2/5", dot: "#00aa6c" },
    { brand: "REVIEWS.IO", score: "4.6/5", dot: "#111827" },
    { brand: "GOOGLE", score: "4.4/5", dot: "#4285f4" },
    { brand: "SMART\nCUSTOMER", score: "4.5/5", dot: "#42a5f5" },
  ];

  var overlay;
  var phoneInput;
  var errEl;
  var submitBtn;
  var packageTitle = "";

  function digits(v) {
    return (v || "").replace(/\D/g, "").replace(/^91/, "").slice(-10);
  }

  function trustHtml() {
    return TRUST_BADGES.map(function (b) {
      return (
        '<div class="uno-trust-item">' +
        '<span class="uno-trust-dot" style="background:' + b.dot + '">★</span>' +
        '<span class="uno-trust-score">' + b.score + "</span>" +
        '<span class="uno-trust-brand">' + b.brand + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function ensureModal() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "uno-callback-overlay";
    overlay.hidden = true;
    overlay.innerHTML =
      '<button type="button" id="uno-callback-backdrop" aria-label="Close dialog"></button>' +
      '<div id="uno-callback-dialog" role="dialog" aria-modal="true" aria-labelledby="uno-cb-title">' +
      '<button type="button" id="uno-callback-close" aria-label="Close">×</button>' +
      '<div id="uno-callback-body">' +
      '<h2 id="uno-cb-title">Connect with a Travel Expert</h2>' +
      '<p id="uno-cb-subtitle">Verify Your Phone Number to Continue</p>' +
      '<form id="uno-callback-form">' +
      '<div class="uno-phone-row">' +
      '<div class="uno-phone-prefix" aria-hidden="true">' +
      '<span>🇮🇳</span><span>+91</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
      "</div>" +
      '<input type="tel" id="uno-callback-phone" inputmode="numeric" autocomplete="tel-national" placeholder="Your Phone*" maxlength="15" />' +
      "</div>" +
      '<p id="uno-callback-error"></p>' +
      '<button type="submit" id="uno-callback-submit">Connect With An Expert</button>' +
      "</form>" +
      '<div class="uno-trust-divider"><span>Trusted by Travellers</span></div>' +
      '<div class="uno-trust-grid">' +
      trustHtml() +
      "</div>" +
      '<p id="uno-callback-footer">Prefer to dial directly? <a href="' +
      PHONE_TEL +
      '">Call UNO Trips</a></p>' +
      "</div></div>";

    document.body.appendChild(overlay);
    phoneInput = document.getElementById("uno-callback-phone");
    errEl = document.getElementById("uno-callback-error");
    submitBtn = document.getElementById("uno-callback-submit");

    document.getElementById("uno-callback-close").onclick = closeModal;
    document.getElementById("uno-callback-backdrop").onclick = closeModal;
    document.getElementById("uno-callback-form").onsubmit = function (e) {
      e.preventDefault();
      submitCallback();
    };
    phoneInput.oninput = function () {
      errEl.textContent = "";
    };
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeModal();
    });
  }

  function openModal(title) {
    ensureModal();
    packageTitle = title || "";
    errEl.textContent = "";
    phoneInput.value = "";
    submitBtn.disabled = false;
    submitBtn.textContent = "Connect With An Expert";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      phoneInput.focus();
    }, 50);
  }

  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function submitCallback() {
    var d = digits(phoneInput.value);
    if (!/^[6-9]\d{9}$/.test(d)) {
      errEl.textContent = "Please enter a valid 10-digit mobile number.";
      return;
    }
    errEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    var msg = "Callback request from landing page.\nPhone: +91" + d;
    if (packageTitle) msg += "\nPackage: " + packageTitle;

    fetch(SEND, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "New Callback Request - Rajasthan Landing",
        source: "Callback Modal",
        phone: "+91" + d,
        message: msg,
      }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("fail");
        window.location.assign(THANK);
      })
      .catch(function () {
        errEl.textContent = "Could not send. Please call us or try WhatsApp.";
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Connect With An Expert";
      });
  }

  function hideReactChat() {
    document.querySelectorAll("button[aria-label]").forEach(function (btn) {
      if (btn.id === "chatbotToggle") return;
      var label = (btn.getAttribute("aria-label") || "").toLowerCase();
      if (label.indexOf("chat") === -1) return;
      var box = btn.closest(".fixed");
      if (box) box.style.setProperty("display", "none", "important");
    });
  }

  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.closest("#uno-callback-overlay")) return;
      var text = (btn.textContent || "").replace(/\s+/g, " ").trim();
      if (text.indexOf("Request Callback") === -1) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var card = btn.closest("article") || btn.closest("[class*='rounded']");
      var h3 = card && card.querySelector("h3");
      openModal(h3 ? h3.textContent.trim() : "");
    },
    true,
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideReactChat);
  } else {
    hideReactChat();
  }
  setTimeout(hideReactChat, 2000);
})();
