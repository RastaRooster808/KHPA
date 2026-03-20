(function () {
  const path = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav a").forEach(function (a) {
    const href = a.getAttribute("href");
    if (!href) return;
    const file = href.split("/").pop();
    if (file === path) {
      a.classList.add("active");
    }
  });

  const y = document.getElementById("year");
  if (y) {
    y.textContent = String(new Date().getFullYear());
  }
})();
