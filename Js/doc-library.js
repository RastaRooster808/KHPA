(function () {
  "use strict";

  var searchInput = document.getElementById("docSearch");
  var filterButtons = document.querySelectorAll(".doc-filter");
  var clearButton = document.getElementById("docClear");
  var cards = document.querySelectorAll(".doc-card");
  var emptyState = document.getElementById("docEmpty");

  if (!cards.length) return;

  var activeCategory = "all";

  function setActiveFilter(category) {
    activeCategory = category;
    filterButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === category));
    });
  }

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

  /* Category counts, computed from the actual cards so they never drift
     out of sync with the document list. */
  function labelWithCount(button) {
    var filter = button.getAttribute("data-filter") || "all";
    var count = filter === "all"
      ? cards.length
      : Array.prototype.filter.call(cards, function (c) {
          return c.getAttribute("data-category") === filter;
        }).length;

    var baseLabel = button.getAttribute("data-label") || button.textContent.trim();
    button.setAttribute("data-label", baseLabel);
    button.textContent = "";
    button.appendChild(document.createTextNode(baseLabel + " "));
    var countEl = document.createElement("span");
    countEl.className = "doc-count";
    countEl.textContent = "(" + count + ")";
    button.appendChild(countEl);
  }

  filterButtons.forEach(labelWithCount);

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActiveFilter(btn.getAttribute("data-filter") || "all");
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      setActiveFilter("all");
      applyFilters();
      if (searchInput) searchInput.focus();
    });
  }

  /* Support ?q= in the URL so the homepage/search-engine "search this site"
     action (WebSite SearchAction structured data) actually filters results. */
  try {
    var params = new URLSearchParams(location.search);
    var q = params.get("q");
    if (q && searchInput) {
      searchInput.value = q;
    }
  } catch (e) {}

  setActiveFilter("all");
  applyFilters();
})();
