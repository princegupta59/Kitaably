/* ==========================================================================
   Kitaably — MySQL powered shared behaviour
   ========================================================================== */

const READING_LIST_KEY = "kitaablyReadingList";

let NOVELS = [];


/* ==========================================================================
   LOAD NOVELS FROM MYSQL API
   ========================================================================== */

async function loadNovels() {
  try {
    const response = await fetch("api/novels.php", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch novels");
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.novels)) {
      throw new Error("Invalid API response");
    }

    NOVELS = data.novels.map((book) => ({
      id: book.slug,
      title: book.title,
      author: book.author,
      language: book.language,
      genre: book.genre,
      genreClass: book.genre_class,
      rating: Number(book.rating),
      desc: book.description,
      review: book.review,
      coverImage: book.cover_image || null
    }));

    console.log("Novels loaded from MySQL:", NOVELS);

  } catch (error) {
    console.error("Error loading novels:", error);
    NOVELS = [];
  }
}


/* ==========================================================================
   READING LIST
   ========================================================================== */

function getReadingList() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(READING_LIST_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}


function saveReadingList(list) {
  try {
    localStorage.setItem(
      READING_LIST_KEY,
      JSON.stringify(list)
    );
  } catch (error) {}
}


function isInReadingList(id) {
  return getReadingList().includes(id);
}


function toggleReadingList(id) {
  const list = getReadingList();
  const index = list.indexOf(id);

  let added = false;

  if (index === -1) {
    list.push(id);
    added = true;
  } else {
    list.splice(index, 1);
  }

  saveReadingList(list);
  updateReadingListUI();
  updateReadingListPage();

  return added;
}


function readingListCount() {
  return getReadingList().length;
}


function updateReadingListUI() {
  const count = readingListCount();

  document
    .querySelectorAll("[data-reading-list-count]")
    .forEach((el) => {
      el.textContent = String(count);
      el.hidden = count === 0;
    });

  document
    .querySelectorAll("[data-reading-list-button]")
    .forEach((button) => {
      const id = button.dataset.readingListButton;
      const saved = isInReadingList(id);

      button.classList.toggle("is-saved", saved);

      button.setAttribute(
        "aria-pressed",
        String(saved)
      );

      button.setAttribute(
        "aria-label",
        saved
          ? "Remove from My Reading List"
          : "Add to My Reading List"
      );

      button.title = saved
        ? "Remove from My Reading List"
        : "Add to My Reading List";

      const icon = button.querySelector(
        ".reading-list-icon"
      );

      if (icon) {
        icon.textContent = saved ? "♥" : "♡";
      }
    });

  const pageCount = document.querySelector(
    "[data-reading-list-page-count]"
  );

  if (pageCount) {
    const total = readingListCount();

    pageCount.textContent =
      `${total} saved ${total === 1 ? "novel" : "novels"}`;
  }
}


/* ==========================================================================
   READING LIST BUTTONS
   ========================================================================== */

function getBookIdFromHref(href) {
  if (!href) return null;

  try {
    const url = new URL(
      href,
      window.location.href
    );

    return url.searchParams.get("id");
  } catch (error) {
    const match = href.match(/[?&]id=([^&]+)/);

    return match
      ? decodeURIComponent(match[1])
      : null;
  }
}


function attachReadingListButton(card, bookId) {
  if (
    !card ||
    !bookId ||
    card.querySelector("[data-reading-list-button]")
  ) {
    return;
  }

  const button = document.createElement("button");

  button.type = "button";
  button.className = "reading-list-button";
  button.dataset.readingListButton = bookId;

  button.innerHTML = `
    <span
      class="reading-list-icon"
      aria-hidden="true"
    >♡</span>

    <span class="sr-only">
      Add to My Reading List
    </span>
  `;

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const added = toggleReadingList(bookId);

    const liveNote = document.querySelector(
      "[data-reading-list-live]"
    );

    const book = NOVELS.find(
      (item) => item.id === bookId
    );

    if (liveNote && book) {
      liveNote.textContent = added
        ? `${book.title} added to My Reading List.`
        : `${book.title} removed from My Reading List.`;
    }
  });

  card.appendChild(button);

  updateReadingListUI();
}


function decorateBookCards() {
  document
    .querySelectorAll(".book-card")
    .forEach((card) => {
      const href = card.getAttribute("href");

      const id = href
        ? getBookIdFromHref(href)
        : card.dataset.bookId;

      if (id) {
        attachReadingListButton(card, id);
      }
    });

  updateReadingListUI();
}


/* ==========================================================================
   NAVIGATION
   ========================================================================== */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");

  if (!toggle || !menu) return;

  /*
   * Add My List automatically to pages where it is not already present.
   */
  if (!menu.querySelector('a[href="my-list.html"]')) {
    const item = document.createElement("li");

    item.innerHTML = `
      <a href="my-list.html">
        My List
        <span
          class="nav-list-count"
          data-reading-list-count
          hidden
        >0</span>
      </a>
    `;

    menu.appendChild(item);
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });

  updateReadingListUI();
}


/* ==========================================================================
   NEWSLETTER
   ========================================================================== */

function initNewsletter() {
  const form = document.querySelector(".newsletter-form");

  if (!form) return;

  const note = form.querySelector(".newsletter-note");
  const defaultNote = note ? note.textContent : "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = form.querySelector(
      "input[type='email']"
    );

    if (!input || !input.value.trim()) {
      return;
    }

    if (note) {
      note.textContent =
        "Thanks — keep an eye on your inbox for your next favorite novel.";
    }

    input.value = "";

    setTimeout(() => {
      if (note) {
        note.textContent = defaultNote;
      }
    }, 5000);
  });
}


/* ==========================================================================
   STAR RATING
   ========================================================================== */

function starString(rating) {
  const full = Math.round(Number(rating));

  return (
    "★".repeat(Math.max(0, Math.min(5, full))) +
    "☆".repeat(Math.max(0, 5 - full))
  );
}


/* ==========================================================================
   SAFE HTML
   ========================================================================== */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ==========================================================================
   BOOK CARD
   ========================================================================== */

function bookCardHTML(book) {
  return `
    <a
      class="book-card"
      href="book.html?id=${encodeURIComponent(book.id)}"
      aria-label="View details for ${escapeHTML(book.title)} by ${escapeHTML(book.author)}"
      data-title="${escapeHTML(book.title.toLowerCase())}"
      data-author="${escapeHTML(book.author.toLowerCase())}"
      data-genre="${escapeHTML(book.genre)}"
      data-language="${escapeHTML(book.language)}"
      data-rating="${book.rating}"
    >

      <div
        class="cover cover--${escapeHTML(book.genreClass)}"
        role="img"
        aria-label="Book cover for ${escapeHTML(book.title)} by ${escapeHTML(book.author)}"
      >
        <span class="cover__title">
          ${escapeHTML(book.title)}
        </span>

        <span class="cover__author">
          ${escapeHTML(book.author)}
        </span>
      </div>

      <div class="book-card__body">

        <p class="book-card__genre">
          ${escapeHTML(book.genre)}
        </p>

        <h3 class="book-card__title">
          ${escapeHTML(book.title)}
        </h3>

        <p class="book-card__author">
          ${escapeHTML(book.author)}
        </p>

        <p class="rating">
          <span
            class="rating__stars"
            aria-hidden="true"
          >
            ${starString(book.rating)}
          </span>

          ${Number(book.rating).toFixed(1)} / 5
        </p>

        <p class="book-card__desc">
          ${escapeHTML(book.desc)}
        </p>

      </div>
    </a>
  `;
}


/* ==========================================================================
   HOMEPAGE
   ========================================================================== */

function initHomepage() {
  const featuredGrid =
    document.querySelector("#featured-grid");

  const topRatedGrid =
    document.querySelector("#top-rated-grid");

  const recommendedGrid =
    document.querySelector("#recommended-grid");

  if (
    !featuredGrid &&
    !topRatedGrid &&
    !recommendedGrid
  ) {
    return;
  }

  const featuredIds = [
    "pride-prejudice",
    "and-then-there-were-none",
    "hobbit",
    "dune",
    "godan",
    "kite-runner"
  ];

  const recommendedIds = [
    "gunahon-ka-devta",
    "chandrakanta",
    "girl-with-dragon-tattoo",
    "book-thief",
    "1984",
    "nirmala"
  ];

  const byId = (ids) =>
    ids
      .map((id) =>
        NOVELS.find((book) => book.id === id)
      )
      .filter(Boolean);

  const topRated = [...NOVELS]
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        a.title.localeCompare(b.title)
    )
    .slice(0, 6);

  if (featuredGrid) {
    featuredGrid.innerHTML =
      byId(featuredIds)
        .map(bookCardHTML)
        .join("");
  }

  if (topRatedGrid) {
    topRatedGrid.innerHTML =
      topRated
        .map(bookCardHTML)
        .join("");
  }

  if (recommendedGrid) {
    recommendedGrid.innerHTML =
      byId(recommendedIds)
        .map(bookCardHTML)
        .join("");
  }

  decorateBookCards();
}


/* ==========================================================================
   NOVELS PAGE
   ========================================================================== */

function initNovelsPage() {
  const grid =
    document.querySelector("[data-novels-grid]");

  if (!grid) return;

  const searchInput =
    document.querySelector("[data-novels-search]");

  const genreButtons =
    document.querySelectorAll("[data-genre-filter]");

  const languageButtons =
    document.querySelectorAll(
      "[data-language-filter]"
    );

  const ratingButtons =
    document.querySelectorAll(
      "[data-rating-filter]"
    );

  const sortSelect =
    document.querySelector("[data-sort-novels]");

  const resultsCount =
    document.querySelector("[data-results-count]");

  const noResults =
    document.querySelector("[data-no-results]");

  let selectedGenre = "All";
  let selectedLanguage = "All";
  let selectedRating = "All";

  function updateActiveButton(
    buttons,
    selectedValue
  ) {
    buttons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.genreFilter === selectedValue ||
        button.dataset.languageFilter === selectedValue ||
        button.dataset.ratingFilter === selectedValue
      );
    });
  }

  function render() {
    let books = [...NOVELS];

    const searchTerm = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    if (searchTerm) {
      books = books.filter((book) => {
        const title =
          book.title.toLowerCase();

        const author =
          book.author.toLowerCase();

        return (
          title.includes(searchTerm) ||
          author.includes(searchTerm)
        );
      });
    }

    if (selectedGenre !== "All") {
      books = books.filter(
        (book) =>
          book.genre === selectedGenre
      );
    }

    if (selectedLanguage !== "All") {
      books = books.filter(
        (book) =>
          book.language === selectedLanguage
      );
    }

    if (selectedRating === "4+") {
      books = books.filter(
        (book) => book.rating >= 4
      );
    }

    if (selectedRating === "4.5+") {
      books = books.filter(
        (book) => book.rating >= 4.5
      );
    }

    const sortValue =
      sortSelect
        ? sortSelect.value
        : "default";

    if (sortValue === "rating-desc") {
      books.sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (sortValue === "rating-asc") {
      books.sort(
        (a, b) => a.rating - b.rating
      );
    }

    if (sortValue === "title-asc") {
      books.sort(
        (a, b) =>
          a.title.localeCompare(b.title)
      );
    }

    if (sortValue === "title-desc") {
      books.sort(
        (a, b) =>
          b.title.localeCompare(a.title)
      );
    }

    grid.innerHTML = books
      .map(bookCardHTML)
      .join("");

    if (resultsCount) {
      resultsCount.textContent =
        `${books.length} ${
          books.length === 1
            ? "novel"
            : "novels"
        } found`;
    }

    if (noResults) {
      noResults.hidden = books.length !== 0;
    }

    decorateBookCards();
  }


  genreButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedGenre =
        button.dataset.genreFilter;

      genreButtons.forEach((btn) =>
        btn.classList.remove("is-active")
      );

      button.classList.add("is-active");

      render();
    });
  });


  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedLanguage =
        button.dataset.languageFilter;

      languageButtons.forEach((btn) =>
        btn.classList.remove("is-active")
      );

      button.classList.add("is-active");

      render();
    });
  });


  ratingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedRating =
        button.dataset.ratingFilter;

      ratingButtons.forEach((btn) =>
        btn.classList.remove("is-active")
      );

      button.classList.add("is-active");

      render();
    });
  });


  if (searchInput) {
    searchInput.addEventListener(
      "input",
      render
    );
  }


  if (sortSelect) {
    sortSelect.addEventListener(
      "change",
      render
    );
  }


  render();
}


/* ==========================================================================
   BOOK DETAIL PAGE
   ========================================================================== */

function initBookDetailPage() {
  const container =
    document.querySelector("[data-book-detail]");

  if (!container) return;

  const params =
    new URLSearchParams(
      window.location.search
    );

  const id = params.get("id");

  const book =
    NOVELS.find(
      (novel) => novel.id === id
    );

  if (!book) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Book not found</h2>

        <p>
          Sorry, we couldn't find this novel.
        </p>

        <a
          href="novels.html"
          class="btn btn--primary"
        >
          Browse Novels
        </a>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <article class="book-detail-layout">

      <div
        class="cover cover--${escapeHTML(book.genreClass)} book-detail-cover"
        role="img"
        aria-label="Book cover for ${escapeHTML(book.title)}"
      >
        <span class="cover__title">
          ${escapeHTML(book.title)}
        </span>

        <span class="cover__author">
          ${escapeHTML(book.author)}
        </span>
      </div>


      <div class="book-detail-content">

        <p class="book-detail-genre">
          ${escapeHTML(book.genre)}
        </p>

        <h1>
          ${escapeHTML(book.title)}
        </h1>

        <p class="book-detail-author">
          by ${escapeHTML(book.author)}
        </p>

        <p class="book-detail-language">
          ${escapeHTML(book.language)}
        </p>

        <p class="rating">
          <span
            class="rating__stars"
            aria-hidden="true"
          >
            ${starString(book.rating)}
          </span>

          ${Number(book.rating).toFixed(1)} / 5
        </p>

        <div class="book-detail-description">
          <h2>About the Book</h2>

          <p>
            ${escapeHTML(book.desc)}
          </p>
        </div>

        <div class="book-detail-review">

          <h2>Our Review</h2>

          <p>
            ${escapeHTML(book.review)}
          </p>

        </div>

        <button
          type="button"
          class="reading-list-button"
          data-reading-list-button="${escapeHTML(book.id)}"
          aria-pressed="false"
        >
          <span
            class="reading-list-icon"
            aria-hidden="true"
          >♡</span>

          <span>
            Add to My Reading List
          </span>
        </button>

      </div>

    </article>
  `;

  const button =
    container.querySelector(
      "[data-reading-list-button]"
    );

  if (button) {
    button.addEventListener(
      "click",
      () => {
        const added =
          toggleReadingList(book.id);

        const liveNote =
          document.querySelector(
            "[data-reading-list-live]"
          );

        if (liveNote) {
          liveNote.textContent =
            added
              ? `${book.title} added to My Reading List.`
              : `${book.title} removed from My Reading List.`;
        }
      }
    );
  }

  updateReadingListUI();
}


/* ==========================================================================
   READING LIST PAGE
   ========================================================================== */

function updateReadingListPage() {
  const container =
    document.querySelector(
      "[data-reading-list-grid]"
    );

  if (!container) return;

  const emptyState =
    document.querySelector(
      "[data-reading-list-empty]"
    );

  const list = getReadingList();

  const books = list
    .map((id) =>
      NOVELS.find(
        (book) => book.id === id
      )
    )
    .filter(Boolean);

  if (!books.length) {
    container.innerHTML = "";

    if (emptyState) {
      emptyState.hidden = false;
    }

    updateReadingListUI();

    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  container.innerHTML =
    books
      .map(bookCardHTML)
      .join("");

  decorateBookCards();

  updateReadingListUI();
}


function initReadingListPage() {
  const container =
    document.querySelector(
      "[data-reading-list-grid]"
    );

  if (!container) return;

  updateReadingListPage();
}


/* ==========================================================================
   FOOTER READING LIST
   ========================================================================== */

function initFooterReadingListLink() {
  const link =
    document.querySelector(
      "[data-reading-list-link]"
    );

  if (!link) return;

  const count =
    readingListCount();

  const countElement =
    link.querySelector(
      "[data-reading-list-count]"
    );

  if (countElement) {
    countElement.textContent =
      String(count);

    countElement.hidden =
      count === 0;
  }
}


/* ==========================================================================
   INITIALIZE WEBSITE
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initNav();

    initNewsletter();

    /*
     * IMPORTANT:
     * Load MySQL data BEFORE rendering any page.
     */
    await loadNovels();

    /*
     * Homepage
     */
    initHomepage();

    /*
     * Novels page
     */
    initNovelsPage();

    /*
     * Book detail
     */
    initBookDetailPage();

    /*
     * My Reading List
     */
    initReadingListPage();

    /*
     * Footer
     */
    initFooterReadingListLink();

    updateReadingListUI();
  }
);