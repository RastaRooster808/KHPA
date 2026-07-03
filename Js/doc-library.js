(function () {
  "use strict";

  var searchInput = document.getElementById("docSearch");
  var filterButtons = document.querySelectorAll(".doc-filter");
  var cards = document.querySelectorAll(".doc-card");
  var emptyState = document.getElementById("docEmpty");

  if (!cards.length) return;

  var activeCategory = "all";

  function applyFilters() {
    var query = (searchInput && searchInput.value || "").trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var category = card.getAttribute("data-category") || "";
      var text = card.textContent.toLowerCase();
      var matchesCategory = activeCategory === "all" || category === activeCategory;
      var matchesSearch = query === "" || text.indexOf(query) !== -1;
      var visible = matchesCategory && matchesSearch;

      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeCategory = btn.getAttribute("data-filter") || "all";

      filterButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  applyFilters();
})();
