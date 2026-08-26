(function () {
  "use strict";

  /* Active nav link — matches current page filename against nav hrefs */
  var path = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href) return;
    var file = href.split("/").pop().split("#")[0] || "index.html";
    if (file === path) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* Footer year */
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Mobile nav toggle */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Language toggle placeholder — EN / ʻŌlelo Hawaiʻi
     Content translation is not yet available site-wide; this records the
     visitor's preference and lets pages that do have bilingual content
     (see data-lang blocks) respond to it. */
  var KEY = "khpa_lang";
  var langButtons = document.querySelectorAll("[data-lang-btn]");

  function applyLang(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}

    document.documentElement.setAttribute("lang", lang === "haw" ? "haw" : "en");

    langButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-lang-btn") === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll("[data-lang-section]").forEach(function (section) {
      section.hidden = section.getAttribute("data-lang-section") !== lang;
    });
  }

  if (langButtons.length) {
    var saved = "en";
    try { saved = localStorage.getItem(KEY) || "en"; } catch (e) {}

    langButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang-btn"));
      });
    });

    applyLang(saved);
  }

  /* Dark mode toggle. The theme itself is applied synchronously by a tiny
     inline script in <head> (before first paint) so there's no flash of
     the wrong theme; this just keeps the toggle button in sync and lets
     the visitor override the system preference either way. */
  var THEME_KEY = "khpa_theme";
  var themeToggle = document.getElementById("themeToggle");

  function effectiveTheme() {
    var stored = document.documentElement.getAttribute("data-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function syncThemeButton() {
    if (!themeToggle) return;
    var dark = effectiveTheme() === "dark";
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.querySelector(".icon").textContent = dark ? "☀️" : "🌙";
    themeToggle.querySelector(".label").textContent = dark ? "Light Mode" : "Dark Mode";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncThemeButton();
    });
    syncThemeButton();
  }
})();
