/* ==========================================================================
   Kitaably — shared behaviour
   ========================================================================== */

const READING_LIST_KEY = "kitaablyReadingList";

function getReadingList() {
  try {
    const saved = JSON.parse(localStorage.getItem(READING_LIST_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveReadingList(list) {
  try {
    localStorage.setItem(READING_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    // Ignore storage errors so the rest of the site keeps working.
  }
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
  return added;
}

function readingListCount() {
  return getReadingList().length;
}

function updateReadingListUI() {
  const count = readingListCount();

  document.querySelectorAll("[data-reading-list-count]").forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });

  document.querySelectorAll("[data-reading-list-button]").forEach((button) => {
    const id = button.dataset.readingListButton;
    const saved = isInReadingList(id);
    button.classList.toggle("is-saved", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? "Remove from My Reading List" : "Add to My Reading List");
    button.title = saved ? "Remove from My Reading List" : "Add to My Reading List";
    button.querySelector(".reading-list-icon").textContent = saved ? "♥" : "♡";
  });
}

function getBookIdFromHref(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.searchParams.get("id");
  } catch (error) {
    const match = href.match(/[?&]id=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

function attachReadingListButton(card, bookId) {
  if (!card || !bookId || card.querySelector("[data-reading-list-button]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "reading-list-button";
  button.dataset.readingListButton = bookId;
  button.setAttribute("aria-pressed", String(isInReadingList(bookId)));
  button.innerHTML = '<span class="reading-list-icon" aria-hidden="true">♡</span><span class="sr-only">Add to My Reading List</span>';

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const added = toggleReadingList(bookId);

    const liveNote = document.querySelector("[data-reading-list-live]");
    const book = NOVELS.find((item) => item.id === bookId);
    if (liveNote && book) {
      liveNote.textContent = added ? `${book.title} added to My Reading List.` : `${book.title} removed from My Reading List.`;
    }
  });

  card.appendChild(button);
}

function decorateBookCards() {
  document.querySelectorAll(".book-card").forEach((card) => {
    const href = card.getAttribute("href");
    const id = href ? getBookIdFromHref(href) : null;
    if (id) attachReadingListButton(card, id);
  });
  updateReadingListUI();
}

/* ---------- navigation ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (!toggle || !menu) return;

  if (!menu.querySelector('a[href="my-list.html"]')) {
    const item = document.createElement("li");
    item.innerHTML = '<a href="my-list.html">My List <span class="nav-list-count" data-reading-list-count hidden>0</span></a>';
    menu.appendChild(item);
  }

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

  updateReadingListUI();
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

/* ---------- shared novel data (used across the site) ---------- */
const NOVELS = [
  // Romance
  {
    id: "pride-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    language: "English",
    genre: "Romance",
    genreClass: "romance",
    rating: 4.8,
    desc: "A quintessential classic romance.",
    review: "A quintessential classic romance. Austen delivers sharp wit and social commentary through the evolving dynamic and misunderstandings between the spirited Elizabeth Bennet and the proud Mr. Darcy.",
  },
  {
    id: "gunahon-ka-devta",
    title: "Gunahon Ka Devta (गुनाहों का देवता)",
    author: "Dharamvir Bharati",
    language: "Hindi",
    genre: "Romance",
    genreClass: "romance",
    rating: 4.8,
    desc: "An intensely emotional, tragic love story set in Allahabad.",
    review: "An intensely emotional, tragic love story set in Allahabad. It explores the painful boundaries of sacrifice, caste morality, and platonic ideals between Chander and Sudha.",
  },
  {
    id: "me-before-you",
    title: "Me Before You",
    author: "Jojo Moyes",
    language: "English",
    genre: "Romance",
    genreClass: "romance",
    rating: 4.6,
    desc: "An emotionally charged contemporary romance following the unlikely bond between an eccentric caregiver and a paralyzed former adventurer.",
    review: "An emotionally charged contemporary romance following the unlikely bond between an eccentric caregiver and a paralyzed former adventurer, posing difficult moral questions on life and love.",
  },

  // Mystery & Thriller
  {
    id: "and-then-there-were-none",
    title: "And Then There Were None",
    author: "Agatha Christie",
    language: "English",
    genre: "Mystery & Thriller",
    genreClass: "thriller",
    rating: 4.9,
    desc: "The gold standard of locked-room mysteries.",
    review: "The gold standard of locked-room mysteries. Ten strangers trapped on an isolated island are eliminated one by one according to a nursery rhyme in an impeccably paced puzzle.",
  },
  {
    id: "girl-with-dragon-tattoo",
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    language: "English",
    genre: "Mystery & Thriller",
    genreClass: "thriller",
    rating: 4.7,
    desc: "A gritty, pulse-pounding Nordic noir pairing investigative journalist Mikael Blomkvist with brilliant hacker Lisbeth Salander.",
    review: "A gritty, pulse-pounding Nordic noir pairing investigative journalist Mikael Blomkvist with brilliant hacker Lisbeth Salander to uncover decades of dark family secrets.",
  },
  {
    id: "khoon-ka-badla-khoon",
    title: "Khoon Ka Badla Khoon (खून का बदला खून)",
    author: "Surender Mohan Pathak",
    language: "Hindi",
    genre: "Mystery & Thriller",
    genreClass: "thriller",
    rating: 4.5,
    desc: "A quintessential Indian pulp crime thriller featuring investigative journalist Sunil.",
    review: "A quintessential Indian pulp crime thriller featuring investigative journalist Sunil. Fast-paced, street-smart, and filled with classic twists and gritty city suspense.",
  },

  // Fantasy
  {
    id: "hobbit",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    language: "English",
    genre: "Fantasy",
    genreClass: "fantasy",
    rating: 4.8,
    desc: "Bilbo Baggins' whimsical yet dangerous journey to reclaim the lost dwarven kingdom is rich in folklore and unforgettable creatures.",
    review: "Bilbo Baggins' whimsical yet dangerous journey to reclaim the lost dwarven kingdom is rich in folklore, unforgettable creatures, and quintessential high-fantasy adventure.",
  },
  {
    id: "chandrakanta",
    title: "Chandrakanta (चंद्रकांता)",
    author: "Devaki Nandan Khatri",
    language: "Hindi",
    genre: "Fantasy",
    genreClass: "fantasy",
    rating: 4.7,
    desc: "The pioneering masterwork of Indian fantasy and Tilasmi/Aiyyari fiction.",
    review: "The pioneering masterwork of Indian fantasy and Tilasmi/Aiyyari fiction. Filled with subterranean mazes, shapeshifting tricksters, and court rivalries that captivated generations of readers.",
  },
  {
    id: "harry-potter-sorcerers-stone",
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    language: "English",
    genre: "Fantasy",
    genreClass: "fantasy",
    rating: 4.8,
    desc: "The gateway to modern fantasy.",
    review: "The gateway to modern fantasy. Introduces the hidden magical world with warmth, immersive wonder, and an engaging boarding-school mystery backdrop.",
  },

  // Science Fiction
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    language: "English",
    genre: "Science Fiction",
    genreClass: "dystopian",
    rating: 4.8,
    desc: "A definitive dystopian sci-fi masterpiece examining psychological control, continuous surveillance, and totalitarian manipulation of historical truth.",
    review: "A definitive dystopian sci-fi masterpiece examining psychological control, continuous surveillance, and totalitarian manipulation of historical truth.",
  },
  {
    id: "dune",
    title: "Dune",
    author: "Frank Herbert",
    language: "English",
    genre: "Science Fiction",
    genreClass: "dystopian",
    rating: 4.7,
    desc: "A monumental space-opera epic combining political intrigue, environmental ecology, religion, and interstellar warfare on the desert planet of Arrakis.",
    review: "A monumental space-opera epic combining political intrigue, environmental ecology, religion, and interstellar warfare on the desert planet of Arrakis.",
  },
  {
    id: "bhookha-jahaz",
    title: "Bhookha Jahaz (भूखा जहाज़)",
    author: "Yamuna Dutt Vaishnav 'Ashok'",
    language: "Hindi",
    genre: "Science Fiction",
    genreClass: "dystopian",
    rating: 4.4,
    desc: "An early Indian sci-fi gem dealing with space exploration, extraterrestrial mysteries, and futuristic technology through a distinctly localized lens.",
    review: "An early Indian sci-fi gem dealing with space exploration, extraterrestrial mysteries, and futuristic technology through a distinctly localized lens.",
  },

  // Classics
  {
    id: "godan",
    title: "Godan (गोदान)",
    author: "Munshi Premchand",
    language: "Hindi",
    genre: "Classics",
    genreClass: "classic",
    rating: 5.0,
    desc: "The crown jewel of realistic Hindi literature.",
    review: "The crown jewel of realistic Hindi literature. A deeply poignant critique of peasant exploitation, debt cycles, and societal hypocrisy centered around the farmer Hori.",
  },
  {
    id: "to-kill-a-mockingbird",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    language: "English",
    genre: "Classics",
    genreClass: "classic",
    rating: 4.9,
    desc: "A timeless exploration of moral courage, racial injustice, and childhood innocence in the American South.",
    review: "A timeless exploration of moral courage, racial injustice, and childhood innocence in the American South, viewed through the unforgettable voice of Scout Finch.",
  },
  {
    id: "nirmala",
    title: "Nirmala (निर्मला)",
    author: "Munshi Premchand",
    language: "Hindi",
    genre: "Classics",
    genreClass: "classic",
    rating: 4.7,
    desc: "A gripping, heartbreaking tragedy highlighting the devastating social costs of dowry and mismatched marriage in pre-independence Indian society.",
    review: "A gripping, heartbreaking tragedy highlighting the devastating social costs of dowry and mismatched marriage in pre-independence Indian society.",
  },
  {
    id: "crime-and-punishment",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    language: "English Translation",
    genre: "Classics",
    genreClass: "classic",
    rating: 4.8,
    desc: "A psychological descent into guilt, hubris, and redemption following a student's philosophical justification for murder.",
    review: "A psychological descent into guilt, hubris, and redemption following a student's philosophical justification for murder.",
  },

  // Historical Fiction
  {
    id: "tamas",
    title: "Tamas (तमस)",
    author: "Bhisham Sahni",
    language: "Hindi",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.9,
    desc: "A visceral, haunting examination of the days leading up to the partition riots of 1947.",
    review: "A visceral, haunting examination of the days leading up to the partition riots of 1947. Raw, intensely truthful, and vital historical storytelling.",
  },
  {
    id: "book-thief",
    title: "The Book Thief",
    author: "Markus Zusak",
    language: "English",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.8,
    desc: "Narrated by Death, this moving novel set in Nazi Germany follows young Liesel Meminger as she discovers the transformative power of books during wartime.",
    review: "Narrated by Death, this moving novel set in Nazi Germany follows young Liesel Meminger as she discovers the transformative power of books during wartime.",
  },
  {
    id: "maila-aanchal",
    title: "Maila Aanchal (मैला आँचल)",
    author: "Phanishwar Nath Renu",
    language: "Hindi",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.8,
    desc: "Set in a remote Bihar village in the 1940s, this regional masterpiece captures the socio-political awakening and cultural texture of newly independent India.",
    review: "Set in a remote Bihar village in the 1940s, this regional masterpiece captures the socio-political awakening and cultural texture of newly independent India.",
  },
  {
    id: "kite-runner",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    language: "English",
    genre: "Historical Fiction",
    genreClass: "historical",
    rating: 4.9,
    desc: "An unforgettable, emotionally wrenching journey of guilt, friendship, and redemption set against the turbulent backdrop of modern Afghan history.",
    review: "An unforgettable, emotionally wrenching journey of guilt, friendship, and redemption set against the turbulent backdrop of modern Afghan history.",
  },
];

function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function bookCardHTML(book) {
  return `
    <a class="book-card" href="book.html?id=${book.id}" aria-label="View details for ${book.title} by ${book.author}" data-title="${book.title.toLowerCase()}" data-author="${book.author.toLowerCase()}" data-genre="${book.genre}" data-rating="${book.rating}">
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
        <span class="btn btn--text" aria-hidden="true">Read Review</span>
      </div>
    </a>
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
  decorateBookCards();

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

/* ---------- Book detail page (book.html?id=...) ---------- */
function initBookDetailPage() {
  const container = document.querySelector("[data-book-detail]");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const book = NOVELS.find((b) => b.id === id);

  if (!book) {
    container.innerHTML = `
      <div class="book-detail__not-found">
        <h1>Novel not found</h1>
        <p>We couldn't find a novel matching that link.</p>
        <a class="btn btn--primary" href="novels.html">Back to Novels</a>
      </div>
    `;
    return;
  }

  document.title = `${book.title} — Kitaably`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `${book.title} by ${book.author} — ${book.desc}`);

  container.innerHTML = `
    <div class="book-detail__cover-col">
      <div class="cover cover--large cover--${book.genreClass}" role="img" aria-label="Book cover for ${book.title} by ${book.author}">
        <span class="cover__title">${book.title}</span>
        <span class="cover__author">${book.author}</span>
      </div>
    </div>
    <div class="book-detail__info">
      <p class="book-detail__genre">${book.genre}</p>
      <h1 class="book-detail__title">${book.title}</h1>
      <p class="book-detail__author">${book.author}</p>

      <dl class="book-detail__meta">
        <div><dt>Author</dt><dd>${book.author}</dd></div>
        <div><dt>Language</dt><dd>${book.language}</dd></div>
        <div><dt>Category</dt><dd>${book.genre}</dd></div>
        <div><dt>Rating</dt><dd><span class="rating__stars" aria-hidden="true">${starString(book.rating)}</span> ${book.rating.toFixed(1)} / 5</dd></div>
      </dl>

      <div class="book-detail__section">
        <h2>My Review</h2>
        <p>${book.review}</p>
      </div>

      <div class="book-detail__section">
        <h2>About this Book</h2>
        <p>${book.desc}</p>
      </div>

      <button class="btn btn--primary reading-list-detail-button" type="button" data-reading-list-button="${book.id}" aria-pressed="${isInReadingList(book.id)}">
        <span class="reading-list-icon" aria-hidden="true">${isInReadingList(book.id) ? "♥" : "♡"}</span>
        ${isInReadingList(book.id) ? "Saved to My List" : "Add to My List"}
      </button>
      <a class="btn btn--ghost" href="novels.html">Back to Novels</a>
    </div>
  `;

  const saveButton = container.querySelector("[data-reading-list-button]");
  if (saveButton) {
    saveButton.addEventListener("click", (event) => {
      event.preventDefault();
      const added = toggleReadingList(book.id);
      saveButton.classList.toggle("is-saved", added);
      saveButton.querySelector(".reading-list-icon").textContent = added ? "♥" : "♡";
      saveButton.childNodes[2].textContent = added ? " Saved to My List" : " Add to My List";
    });
  }
}

/* ---------- My Reading List page ---------- */
function initReadingListPage() {
  const grid = document.querySelector("[data-reading-list-grid]");
  if (!grid) return;

  const emptyState = document.querySelector("[data-reading-list-empty]");
  const countLabel = document.querySelector("[data-reading-list-page-count]");
  const liveNote = document.querySelector("[data-reading-list-live]");

  function render() {
    const ids = getReadingList();
    const savedBooks = ids.map((id) => NOVELS.find((book) => book.id === id)).filter(Boolean);

    grid.innerHTML = savedBooks.length ? savedBooks.map(bookCardHTML).join("") : "";
    if (emptyState) emptyState.hidden = savedBooks.length > 0;
    if (countLabel) countLabel.textContent = `${savedBooks.length} saved novel${savedBooks.length === 1 ? "" : "s"}`;

    decorateBookCards();

    grid.querySelectorAll(".book-card").forEach((card) => {
      const id = getBookIdFromHref(card.getAttribute("href") || "");
      if (!id) return;
      const button = card.querySelector("[data-reading-list-button]");
      if (!button) return;
      button.title = "Remove from My Reading List";
      button.setAttribute("aria-label", "Remove from My Reading List");
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reading-list-button]");
    if (!button || !grid.contains(button)) return;
    setTimeout(render, 0);
  });

  window.addEventListener("storage", render);
  render();

  if (liveNote) liveNote.setAttribute("aria-live", "polite");
}

/* ---------- add a footer shortcut without editing every HTML page ---------- */
function initFooterReadingListLink() {
  const footerLinks = document.querySelector(".footer-links");
  if (!footerLinks || footerLinks.querySelector('a[href="my-list.html"]')) return;
  const item = document.createElement("li");
  item.innerHTML = '<a href="my-list.html">My Reading List</a>';
  footerLinks.appendChild(item);
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initNewsletter();
  initNovelsPage();
  initBookDetailPage();
  initReadingListPage();
  initFooterReadingListLink();
  decorateBookCards();
  updateReadingListUI();
});