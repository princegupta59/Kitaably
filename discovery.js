/* ========================================================================
   Kitaably — discovery controls
   Language filtering + sorting for the novels page.
   ======================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-novels-grid]");
  if (!grid) return;

  const languageButtons = document.querySelectorAll("[data-language-filter]");
  const sortSelect = document.querySelector("[data-sort-novels]");
  const resultsCount = document.querySelector("[data-results-count]");

  const languageById = {
    "pride-prejudice":"English","gunahon-ka-devta":"Hindi","me-before-you":"English",
    "and-then-there-were-none":"English","girl-with-dragon-tattoo":"English","khoon-ka-badla-khoon":"Hindi",
    "hobbit":"English","chandrakanta":"Hindi","harry-potter-sorcerers-stone":"English",
    "1984":"English","dune":"English","bhookha-jahaz":"Hindi","godan":"Hindi",
    "to-kill-a-mockingbird":"English","nirmala":"Hindi","crime-and-punishment":"English Translation",
    "tamas":"Hindi","book-thief":"English","maila-aanchal":"Hindi","kite-runner":"English"
  };

  let activeLanguage = "All";

  function getId(card) {
    const match = (card.getAttribute("href") || "").match(/[?&]id=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function applyLanguageFilter() {
    const cards = grid.querySelectorAll(".book-card");
    cards.forEach((card) => {
      const language = languageById[getId(card)] || "";
      if (activeLanguage !== "All" && language !== activeLanguage) card.style.display = "none";
    });
    if (resultsCount) {
      const visible = Array.from(cards).filter((card) => card.style.display !== "none").length;
      resultsCount.textContent = visible ? `Showing ${visible} of ${cards.length} novels` : "";
    }
  }

  function sortCards() {
    const mode = sortSelect ? sortSelect.value : "default";
    const cards = Array.from(grid.querySelectorAll(".book-card"));
    cards.sort((a, b) => {
      if (mode === "rating-desc") return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      if (mode === "rating-asc") return parseFloat(a.dataset.rating) - parseFloat(b.dataset.rating);
      if (mode === "title-asc") return a.dataset.title.localeCompare(b.dataset.title);
      if (mode === "title-desc") return b.dataset.title.localeCompare(a.dataset.title);
      return 0;
    });
    cards.forEach((card) => grid.appendChild(card));
    applyLanguageFilter();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      languageButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      activeLanguage = button.dataset.languageFilter;
      setTimeout(applyLanguageFilter, 0);
    });
  });

  document.querySelectorAll("[data-novels-search], [data-genre-filter], [data-rating-filter]").forEach((control) => {
    control.addEventListener("input", () => setTimeout(applyLanguageFilter, 0));
    control.addEventListener("click", () => setTimeout(applyLanguageFilter, 0));
  });

  if (sortSelect) sortSelect.addEventListener("change", sortCards);
  setTimeout(sortCards, 0);
});
