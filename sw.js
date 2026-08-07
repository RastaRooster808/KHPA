/*
 * KHPA.io service worker
 *
 * Three caches, versioned together:
 *  - shell:   HTML pages, CSS, JS, core images — precached on install,
 *             served network-first so edits show up quickly, falling
 *             back to cache (and finally offline.html) when offline.
 *  - archive: the Government Documents library PDFs — precached on
 *             install so the historical record stays readable offline.
 *  - runtime: everything else (registration PDFs, form-application
 *             PDFs, Emporium images, etc.) — cached the first time a
 *             visitor requests it, served cache-first after that.
 *
 * Bump CACHE_VERSION on any app-shell change so old caches are dropped.
 */
"use strict";

const CACHE_VERSION = "khpa-2026.02";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ARCHIVE_CACHE = `${CACHE_VERSION}-archive`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const CURRENT_CACHES = [SHELL_CACHE, ARCHIVE_CACHE, RUNTIME_CACHE];

const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/",
  "/index.html",
  "/government-documents.html",
  "/registration.html",
  "/contact.html",
  "/hawaii.html",
  "/protocols.html",
  "/foreign-affairs.html",
  "/emporium.html",
  "/artisans.html",
  "/documents.html",
  "/forms/certificate-application.html",
  "/forms/business-registration.html",
  "/forms/vehicle-registration.html",
  "/offline.html",
  "/manifest.json",
  "/css/main.css",
  "/Js/site.js",
  "/Js/doc-library.js",
  "/Js/khpa-bot.js",
  "/img/logo.png",
  "/KHPANOENTRYSIGN.png",
  "/img/kk3_proclamation_scroll_style.jpeg",
  "/img/island-map.jpg",
  "/img/Emporium/emporium_rastarooster_1.webp",
  "/img/Emporium/emporium_rastarooster_2.webp",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Government Documents library — the primary-source archive this site exists
// to preserve. Precached so it reads offline, matching the site's stated
// offline-archive goal.
const ARCHIVE_PDFS = [
  "/pdf/KK3_Declaration.pdf",
  "/pdf/Anglo_Franco_Proclamation_1843.pdf",
  "/pdf/Declaration_of_Rights_1839.pdf",
  "/pdf/Constitution_1840_English.pdf",
  "/pdf/First_Act_Kamehameha_III.pdf",
  "/pdf/Second_Act_Kamehameha_III_1846.pdf",
  "/pdf/Third_Act_Kamehameha_III_1846.pdf",
  "/pdf/KHPA_Protocols_and_Procedures.pdf",
  "/pdf/Hawaii_Our_Story_Our_Future_2025.pdf",
  "/pdf/Hawaii_Island_Office_KHPA_Cleaned.pdf",
  "/pdf/Oahu_Island_Office_KHPA.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(ARCHIVE_CACHE).then((cache) => cache.addAll(ARCHIVE_PDFS))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CURRENT_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isArchivePdf(pathname) {
  return ARCHIVE_PDFS.includes(pathname);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // leave Formspree etc. alone

  // Page navigations: network-first so content updates show promptly,
  // falling back to the cached copy, then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Archive PDFs: cache-first — they're precached and don't change often.
  if (isArchivePdf(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Everything else (CSS/JS/images/other PDFs): cache-first, then fetch
  // in the background to keep the cache warm for next time.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
