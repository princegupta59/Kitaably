/* ==========================================================================
   Kitaably — shared behaviour
   ========================================================================== */

/* ---------- mobile nav ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- "Read Review" placeholder toggles ---------- */
/* Works on any card that has a [data-review-toggle] button next to a
   [data-review-panel] element. Full review pages are coming in a later
   version of the site — for now this just reveals a short note in place. */
function initReviewToggles(root = document) {
  root.querySelectorAll("[data-review-toggle]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      const panel = btn.closest(".book-card, .latest-item")?.querySelector("[data-review-panel]");
      if (!panel) return;
      const isOpen = panel.classList.toggle("is-open");
      btn.textContent = isOpen ? "Hide review" : "Read Review";
    });
  });
}

/* ---------- newsletter (visual only, no backend) ---------- */
function initNewsletter() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;
  const note = form.querySelector(".newsletter-note");
  const defaultNote = note ? note.textContent : "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type='email']");
    if (!input || !input.value.trim()) return;
    if (note) note.textContent = "Thanks — keep an eye on your inbox for your next favorite novel.";
    input.value = "";
    setTimeout(() => {
      if (note) note.textContent = defaultNote;
    }, 5000);
  });
}

/* ---------- shared novel data (used on the Novels page) ---------- */
const NOVELS = [
  {
    id: "alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    genreClass: "fiction",
    rating: 4.3,
    desc: "A shepherd sets off across unfamiliar country chasing a recurring dream, and learns to read the small signs along the way.",
  },
  {
    id: "kite-runner",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.6,
    desc: "A friendship in 1970s Kabul casts a long shadow, and one man returns years later to try to make things right.",
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    genreClass: "dystopian",
    rating: 4.7,
    desc: "In a society where every move is watched, one man starts to keep a private record of his own thoughts.",
  },
  {
    id: "book-thief",
    title: "The Book Thief",
    author: "Markus Zusak",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.6,
    desc: "A young girl in wartime Germany finds comfort in stolen books, narrated by an unusually observant voice.",
  },
  {
    id: "silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Mystery & Thriller",
    genreClass: "thriller",
    rating: 4.2,
    desc: "A woman stops speaking the night her husband dies, and the psychotherapist assigned to her case can't let the silence go.",
  },
  {
    id: "great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic",
    genreClass: "classic",
    rating: 4.1,
    desc: "A newcomer to Long Island gets pulled into his neighbor's glittering parties, and the story behind them.",
  },
  {
    id: "hobbit",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    genreClass: "fantasy",
    rating: 4.8,
    desc: "A homebody is talked into a journey with a company of dwarves, and finds he's better suited to adventure than expected.",
  },
  {
    id: "pride-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    genreClass: "romance",
    rating: 4.5,
    desc: "A sharp-tongued young woman and a proud, reserved gentleman keep misjudging each other across a string of drawing rooms.",
  },
  {
    id: "thousand-suns",
    title: "A Thousand Splendid Suns",
    author: "Khaled Hosseini",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.7,
    desc: "Two women from very different generations end up sharing a home, and a friendship neither expected, across decades of change.",
  },
];

function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function bookCardHTML(book) {
  return `
    <article class="book-card" data-title="${book.title.toLowerCase()}" data-author="${book.author.toLowerCase()}" data-genre="${book.genre}" data-rating="${book.rating}">
      <div class="cover cover--${book.genreClass}" role="img" aria-label="Book cover for ${book.title} by ${book.author}">
        <span class="cover__title">${book.title}</span>
        <span class="cover__author">${book.author}</span>
      </div>
      <div class="book-card__body">
        <p class="book-card__genre">${book.genre}</p>
        <h3 class="book-card__title">${book.title}</h3>
        <p class="book-card__author">${book.author}</p>
        <p class="rating"><span class="rating__stars" aria-hidden="true">${starString(book.rating)}</span> ${book.rating.toFixed(1)} / 5</p>
        <p class="book-card__desc">${book.desc}</p>
        <p class="book-card__review" data-review-panel>Full spoiler-free review coming soon — we're polishing our thoughts on <em>${book.title}</em>.</p>
        <button class="btn btn--text" data-review-toggle type="button">Read Review</button>
      </div>
    </article>
  `;
}

/* ---------- Novels page: render + search + filter ---------- */
function initNovelsPage() {
  const grid = document.querySelector("[data-novels-grid]");
  if (!grid) return;

  const searchInput = document.querySelector("[data-novels-search]");
  const genreButtons = document.querySelectorAll("[data-genre-filter]");
  const ratingButtons = document.querySelectorAll("[data-rating-filter]");
  const noResults = document.querySelector("[data-no-results]");
  const resultsCount = document.querySelector("[data-results-count]");

  let activeGenre = "All";
  let activeRating = "All";
  let query = "";

  grid.innerHTML = NOVELS.map(bookCardHTML).join("");
  initReviewToggles(grid);

  function applyFilters() {
    const cards = grid.querySelectorAll(".book-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.dataset.title;
      const author = card.dataset.author;
      const genre = card.dataset.genre;
      const rating = parseFloat(card.dataset.rating);

      const matchesQuery =
        query === "" || title.includes(query) || author.includes(query) || genre.toLowerCase().includes(query);
      const matchesGenre = activeGenre === "All" || genre === activeGenre;
      const matchesRating =
        activeRating === "All" ||
        (activeRating === "4+" && rating >= 4) ||
        (activeRating === "4.5+" && rating >= 4.5);

      const visible = matchesQuery && matchesGenre && matchesRating;
      card.style.display = visible ? "" : "none";
      if (visible) visibleCount += 1;
    });

    if (noResults) noResults.classList.toggle("is-visible", visibleCount === 0);
    if (resultsCount) {
      resultsCount.textContent =
        visibleCount === 0
          ? ""
          : `Showing ${visibleCount} of ${NOVELS.length} novel${NOVELS.length === 1 ? "" : "s"}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      query = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  genreButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      genreButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeGenre = btn.dataset.genreFilter;
      applyFilters();
    });
  });

  ratingButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      ratingButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeRating = btn.dataset.ratingFilter;
      applyFilters();
    });
  });

  applyFilters();
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReviewToggles();
  initNewsletter();
  initNovelsPage();
});
