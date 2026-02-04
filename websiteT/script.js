/* =========================================================
   Oils of BaNTU — script.js (CLEAN + MOBILE SAFE VERSION)
   Fixes:
   - Mobile buttons not clickable
   - Nav toggle
   - Dropdown toggle
   ========================================================= */

/* ---------------- NAV + DROPDOWNS ---------------- */

/* ---------------- DARK MODE ---------------- */

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
  }

  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";

    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });
}


function wireNav() {
  const navToggle = document.getElementById("navToggle");
  const navList = document.getElementById("navList");
  const collectionsToggle = document.getElementById("collectionsToggle");
  const collectionsWrap = document.getElementById("collectionsWrap");
  const collectionsList = document.getElementById("collectionsList");

  // Mobile nav toggle
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navList.classList.toggle("open");
    });
  }

  // Collections dropdown (click-based for mobile)
  if (collectionsToggle && collectionsWrap) {
    collectionsToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const expanded =
        collectionsToggle.getAttribute("aria-expanded") === "true";

      collectionsToggle.setAttribute("aria-expanded", String(!expanded));
      collectionsWrap.classList.toggle("open");
    });
  }

  // Close nav when clicking a link (mobile UX fix)
  navList?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- BLOG / POSTS LOGIC ---------------- */

let allPosts = JSON.parse(localStorage.getItem("oils_posts") || "[]");
let filtered = [...allPosts];
let currentCategory = null;
let searchTerm = "";
let currentPage = 1;
const PAGE_SIZE = 6;

const postsGrid = document.getElementById("postsGrid");
const categoriesBar = document.getElementById("categoriesBar");
const sortSelect = document.getElementById("sortSelect");
const paginationNode = document.getElementById("pagination");
const featuredProducts = document.getElementById("featuredProducts");

function saveStoredPosts(posts) {
  localStorage.setItem("oils_posts", JSON.stringify(posts));
}

function loadStoredPosts() {
  return JSON.parse(localStorage.getItem("oils_posts") || "[]");
}

function uniqueCategories(posts) {
  return [...new Set(posts.map((p) => p.category).filter(Boolean))];
}

function renderCategories() {
  if (!categoriesBar) return;

  categoriesBar.innerHTML = "";
  const cats = uniqueCategories(allPosts);

  const allBtn = document.createElement("button");
  allBtn.className = "btn small";
  allBtn.textContent = "All";
  allBtn.onclick = () => applyFilter(null);
  categoriesBar.appendChild(allBtn);

  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "btn small";
    btn.textContent = cat;
    btn.onclick = () => applyFilter(cat);
    categoriesBar.appendChild(btn);
  });
}

function renderPosts() {
  if (!postsGrid) return;
  postsGrid.innerHTML = "";

  let toRender = [...filtered];
  const sortBy = sortSelect?.value || "newest";

  if (sortBy === "newest")
    toRender.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortBy === "oldest")
    toRender.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sortBy === "title")
    toRender.sort((a, b) => a.title.localeCompare(b.title));

  const totalPages = Math.max(1, Math.ceil(toRender.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  toRender.slice(start, start + PAGE_SIZE).forEach((p) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <a class="post-thumb" href="post.html?post=${encodeURIComponent(p.id)}">
        <img src="${p.image || ""}" alt="${escapeHtml(p.title)}">
      </a>
      <div class="post-body">
        <span class="post-category">${escapeHtml(p.category || "")}</span>
        <h3 class="post-title">${escapeHtml(p.title)}</h3>
        <p class="post-excerpt">${escapeHtml(p.excerpt || "")}</p>
        <a class="read-more" href="post.html?post=${encodeURIComponent(
          p.id
        )}">Read →</a>
      </div>
    `;
    postsGrid.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (!paginationNode) return;
  paginationNode.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement("button");
    b.className = "btn small";
    b.textContent = i;
    b.onclick = () => {
      currentPage = i;
      renderPosts();
    };
    paginationNode.appendChild(b);
  }
}

function applyFilter(cat) {
  currentCategory = cat;
  currentPage = 1;
  filterAndSearch();
}

function filterAndSearch() {
  filtered = allPosts.filter((p) => {
    const matchCat = currentCategory
      ? p.category === currentCategory
      : true;
    const matchSearch = searchTerm
      ? p.title.toLowerCase().includes(searchTerm)
      : true;
    return matchCat && matchSearch;
  });
  renderPosts();
}

/* ---------------- FEATURED PRODUCTS ---------------- */

function renderFeaturedProducts() {
  if (!featuredProducts) return;
  featuredProducts.innerHTML = "";

  allPosts.slice(0, 3).forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image || ""}" alt="${escapeHtml(p.title)}">
      <div class="card-body">
        <span class="tag">${escapeHtml(p.category || "")}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.excerpt || "")}</p>
        <a class="btn small" href="post.html?post=${encodeURIComponent(
          p.id
        )}">Learn</a>
      </div>
    `;
    featuredProducts.appendChild(card);
  });
}

/* ---------------- UTIL ---------------- */

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

/* ---------------- BOOT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  allPosts = loadStoredPosts();
  filtered = [...allPosts];

  wireNav();
  renderCategories();
  renderFeaturedProducts();
  renderPosts();

  sortSelect?.addEventListener("change", renderPosts);
  initThemeToggle();
  initAdminPublish();
  applyAdminVisibility();
});

/* ---------------- ADMIN PUBLISH ---------------- */

function initAdminPublish() {
  const form = document.getElementById("newPostForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const post = {
      id: "post-" + Date.now(),
      title: data.get("title")?.trim(),
      category: data.get("category")?.trim() || "General",
      price: data.get("price")?.trim(),
      content: data.get("content")?.trim(),
      excerpt: data.get("content")?.trim().slice(0, 120) + "...",
      date: new Date().toISOString().slice(0, 10),
      image: "", // placeholder
    };

    if (!post.title || !post.content) {
      alert("Title and content are required");
      return;
    }

    const posts = loadStoredPosts();
    posts.unshift(post);
    saveStoredPosts(posts);

    alert("Post published 🎉");
    form.reset();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initAdminPublish();
});

/* ---------------- ADMIN VISIBILITY ---------------- */

function applyAdminVisibilityxVisibility() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  document.querySelectorAll(".admin-only").forEach((el) => {
    el.style.display = isAdmin ? "inline-block" : "none";
  });
}
document.addEventListener("DOMContentLoaded", () => {
  applyAdminVisibility();
});
