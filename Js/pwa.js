(function () {
  "use strict";

  /* ---- Offline indicator -------------------------------------------------- */
  var offlineBanner = document.getElementById("offlineBanner");

  function syncOnlineState() {
    if (!offlineBanner) return;
    offlineBanner.hidden = navigator.onLine;
  }

  window.addEventListener("online", syncOnlineState);
  window.addEventListener("offline", syncOnlineState);
  syncOnlineState();

  /* ---- Service worker + update banner -------------------------------------- */
  var updateBanner = document.getElementById("updateBanner");
  var updateReloadBtn = document.getElementById("updateReload");
  var waitingWorker = null;

  function showUpdateBanner(worker) {
    waitingWorker = worker;
    if (updateBanner) updateBanner.hidden = false;
  }

  if (updateReloadBtn) {
    updateReloadBtn.addEventListener("click", function () {
      if (waitingWorker) waitingWorker.postMessage("SKIP_WAITING");
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          if (registration.waiting && navigator.serviceWorker.controller) {
            showUpdateBanner(registration.waiting);
          }

          registration.addEventListener("updatefound", function () {
            var newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", function () {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                showUpdateBanner(newWorker);
              }
            });
          });
        })
        .catch(function () {
          /* Offline support just won't be available this visit — the site
             still works normally over the network. */
        });

      var reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (reloading) return;
        reloading = true;
        location.reload();
      });
    });
  }

  /* ---- Install prompt ------------------------------------------------------ */
  var installBtn = document.getElementById("installBtn");
  var deferredInstallPrompt = null;

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(function () {
        deferredInstallPrompt = null;
        installBtn.hidden = true;
      });
    });
  }

  window.addEventListener("appinstalled", function () {
    if (installBtn) installBtn.hidden = true;
    deferredInstallPrompt = null;
  });
})();
