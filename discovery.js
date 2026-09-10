/* ========================================================================
   Kitaably — discovery controls
   Adds language filtering and sorting to the existing novels page.
   ======================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-novels-grid]");
  if (!grid) return;

  const languageButtons = document.querySelectorAll("[data-language-filter]");
  const sortSelect = document.querySelector("[data-sort-novels]");
  const resultsCount = document.querySelector("[data-results-count]");

  let activeLanguage = "All";

  function applyDiscoveryControls() {
    const cards = Array.from(grid.querySelectorAll(".book-card"));

    cards.forEach((card) => {
      const language = card.dataset.language || "";
      const languageMatches = activeLanguage === "All" || language === activeLanguage;
      if (!languageMatches) {
        card.style.display = "none";
      }
    });

    if (resultsCount) {
      const visible = cards.filter((card) => card.style.display !== "none").length;
      const total = cards.length;
      resultsCount.textContent = visible === 0
        ? ""
        : `Showing ${visible} of ${total} novel${total === 1 ? "" : "s"}`;
    }

    sortCards();
  }

  function sortCards() {
    const cards = Array.from(grid.querySelectorAll(".book-card"));
    const mode = sortSelect ? sortSelect.value : "default";

    cards.sort((a, b) => {
      if (mode === "rating-desc") {
        return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      }
      if (mode === "rating-asc") {
        return parseFloat(a.dataset.rating) - parseFloat(b.dataset.rating);
      }
      if (mode === "title-asc") {
        return a.dataset.title.localeCompare(b.dataset.title);
      }
      if (mode === "title-desc") {
        return b.dataset.title.localeCompare(a.dataset.title);
      }
      return 0;
    });

    cards.forEach((card) => grid.appendChild(card));
  }

  function restoreAndFilterLanguage() {
    const cards = grid.querySelectorAll(".book-card");
    cards.forEach((card) => {
      const language = card.dataset.language || "";
      if (activeLanguage === "All" || language === activeLanguage) {
        if (card.dataset.baseHidden !== "true") card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      languageButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      activeLanguage = button.dataset.languageFilter;

      restoreAndFilterLanguage();
      applyDiscoveryControls();
    });
  });

  const existingControls = [
    document.querySelector("[data-novels-search]"),
    ...document.querySelectorAll("[data-genre-filter]"),
    ...document.querySelectorAll("[data-rating-filter]"),
  ].filter(Boolean);

  existingControls.forEach((control) => {
    control.addEventListener("input", () => {
      setTimeout(() => {
        restoreAndFilterLanguage();
        applyDiscoveryControls();
      }, 0);
    });
    control.addEventListener("click", () => {
      setTimeout(() => {
        restoreAndFilterLanguage();
        applyDiscoveryControls();
      }, 0);
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", sortCards);
  }

  const observer = new MutationObserver(() => {
    if (grid.querySelector(".book-card")) {
      grid.querySelectorAll(".book-card").forEach((card) => {
        if (!card.dataset.language) {
          const id = (card.getAttribute("href") || "").split("id=")[1];
          const book = Array.isArray(window.NOVELS) ? window.NOVELS.find((item) => item.id === id) : null;
          if (book) card.dataset.language = book.language;
        }
      });
    }
  });

  observer.observe(grid, { childList: true });

  setTimeout(() => {
    grid.querySelectorAll(".book-card").forEach((card) => {
      const href = card.getAttribute("href") || "";
      const id = href.includes("id=") ? href.split("id=")[1].split("&")[0] : "";
      const book = Array.isArray(window.NOVELS) ? window.NOVELS.find((item) => item.id === id) : null;
      if (book) card.dataset.language = book.language;
    });
    sortCards();
  }, 0);
});
