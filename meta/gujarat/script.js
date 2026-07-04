(function () {
  var form = document.getElementById("lead-form");
  var pkgInput = document.getElementById("form-package");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function countdown() {
    var end = new Date();
    end.setDate(end.getDate() + 3);
    end.setHours(23, 59, 59, 999);
    function tick() {
      var diff = Math.max(0, end - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var set = function (id, v) {
        var el = document.getElementById(id);
        if (el) el.textContent = pad(v);
      };
      set("cd-days", d);
      set("cd-hours", h);
      set("cd-mins", m);
      set("cd-secs", s);
    }
    tick();
    setInterval(tick, 1000);
  }

  document.querySelectorAll(".open-quote").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById("quote-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll(".pkg-quote-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (pkgInput) pkgInput.value = btn.getAttribute("data-package") || "";
      var el = document.getElementById("quote-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      var panel = btn.nextElementSibling;
      if (panel) panel.hidden = open;
    });
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var phone = (fd.get("phone") || "").toString().replace(/\D/g, "").slice(-10);
      if (phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }
      var payload = {
        _subject: "Gujarat Lead",
        source: "Gujarat Landing Page",
        name: fd.get("name"),
        phone: phone,
        email: fd.get("email") || "",
        package: fd.get("package") || "",
        message: "",
      };
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Submitting...";
      }
      fetch("./send_lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.success) window.location.href = "./thank-you.html";
          else throw new Error(data.message || "Failed");
        })
        .catch(function () {
          alert("Could not submit. Please call us directly.");
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Get FREE Customized Quote";
          }
        });
    });
  }

  countdown();
})();
