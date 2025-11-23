/* script.js for Oils of BaNTU - combined: reactive blog + robust nav handling */
const categoriesBar = document.getElementById('categoriesBar');
const collectionsList = document.getElementById('collectionsList');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const paginationNode = document.getElementById('pagination');
const featuredProducts = document.getElementById('featuredProducts');


function uniqueCategories(posts) { return [...new Set(posts.map(p => p.category).filter(Boolean))]; }


function renderCategories() {
const cats = uniqueCategories(allPosts);
categoriesBar.innerHTML = ''; collectionsList.innerHTML = '';
const allBtn = document.createElement('button'); allBtn.className = 'btn small'; allBtn.textContent = 'All'; allBtn.onclick = () => { applyFilter(null); };
categoriesBar.appendChild(allBtn);
cats.forEach(cat => {
const b = document.createElement('button'); b.className = 'btn small'; b.textContent = cat; b.onclick = () => applyFilter(cat); categoriesBar.appendChild(b);
const li = document.createElement('li'); const a = document.createElement('a'); a.href = '#'; a.textContent = cat; a.onclick = (e) => { e.preventDefault(); applyFilter(cat); return false; };
li.appendChild(a); collectionsList.appendChild(li);
});
}


function renderPostCard(p) {
const art = document.createElement('article'); art.className = 'post-card'; art.innerHTML = `<a class="post-thumb" href="post.html?post=${encodeURIComponent(p.id)}"><img src="${p.image||'assets/images/product1.jpg'}" alt="${escapeHtml(p.title)}"></a><div class="post-body"><a class="post-category" href="#">${escapeHtml(p.category||'Misc')}</a><h3 class="post-title"><a href="post.html?post=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h3><p class="post-excerpt">${escapeHtml(p.excerpt||'')}</p><div class="post-meta"><time datetime="${p.date}">${formatDate(p.date)}</time><a class="read-more" href="post.html?post=${encodeURIComponent(p.id)}">Read →</a></div></div>`; return art; }


function renderPosts() {
postsGrid.innerHTML = '';
const sortBy = sortSelect?.value || 'newest'; const toRender = [...filtered];
if (sortBy === 'newest') toRender.sort((a,b) => new Date(b.date) - new Date(a.date)); else if (sortBy === 'oldest') toRender.sort((a,b) => new Date(a.date) - new Date(b.date)); else if (sortBy === 'title') toRender.sort((a,b) => a.title.localeCompare(b.title));
const total = toRender.length; const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE)); if (currentPage > totalPages) currentPage = totalPages; const start = (currentPage - 1) * PAGE_SIZE; const pageSlice = toRender.slice(start, start + PAGE_SIZE);
pageSlice.forEach(p => postsGrid.appendChild(renderPostCard(p))); renderPagination(totalPages);
}


function renderPagination(totalPages) {
paginationNode.innerHTML = ''; if (totalPages <= 1) return;
const prev = document.createElement('button'); prev.className = 'btn small'; prev.textContent = 'Prev'; prev.disabled = currentPage === 1; prev.onclick = () => { currentPage = Math.max(1, currentPage - 1); renderPosts(); }; paginationNode.appendChild(prev);
for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.className = 'btn small'; b.textContent = i; b.style.fontWeight = i === currentPage ? '700' : '400'; b.onclick = () => { currentPage = i; renderPosts(); }; paginationNode.appendChild(b); }
const next = document.createElement('button'); next.className = 'btn small'; next.textContent = 'Next'; next.disabled = currentPage === totalPages; next.onclick = () => { currentPage = Math.min(totalPages, currentPage + 1); renderPosts(); }; paginationNode.appendChild(next);
}


function applyFilter(category) { currentCategory = category; currentPage = 1; filterAndSearch(); }
function applySearch(term) { searchTerm = term.trim().toLowerCase(); currentPage = 1; filterAndSearch(); }
function filterAndSearch() { filtered = allPosts.filter(p => { const matchCat = currentCategory ? (p.category && p.category.toLowerCase() === currentCategory.toLowerCase()) : true; const matchSearch = searchTerm ? ((p.title && p.title.toLowerCase().includes(searchTerm)) || (p.excerpt && p.excerpt.toLowerCase().includes(searchTerm)) || (p.content && p.content.toLowerCase().includes(searchTerm))) : true; return matchCat && matchSearch; }); renderPosts(); }


function renderFeaturedProducts() { if (!featuredProducts) return; featuredProducts.innerHTML = ''; const featured = allPosts.slice(0,3); featured.forEach(p => { const art = document.createElement('article'); art.className = 'card'; art.innerHTML = `<img src="${p.image||'assets/images/product1.jpg'}" alt="${escapeHtml(p.title)}"><div class="card-body"><span class="tag">${escapeHtml(p.category||'Product')}</span><h3 class="card-title">${escapeHtml(p.title)}</h3><p class="card-excerpt">${escapeHtml(p.excerpt||'')}</p><div class="card-meta"><span class="price">${escapeHtml(p.price||'')}</span><a class="btn small" href="post.html?post=${encodeURIComponent(p.id)}">Learn</a></div></div>`; featuredProducts.appendChild(art); }); }


function registerAdminForm() {
const form = document.getElementById('newPostForm'); if (!form) return; form.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(form); const title = (fd.get('title') || '').toString().trim(); if (!title) { alert('Title required'); return; } const newPost = { id: 'p-' + Date.now(), title, category: (fd.get('category') || '').toString().trim() || 'Misc', excerpt: (fd.get('excerpt') || '').toString().trim(), content: (fd.get('content') || '').toString().trim(), image: (fd.get('image') || '').toString().trim() || 'assets/images/product1.jpg', price: (fd.get('price') || '').toString().trim(), date: new Date().toISOString().slice(0,10) }; allPosts.unshift(newPost); saveStoredPosts(allPosts); alert('Published locally. Visit the home page to see the new post.'); form.reset(); populateSavedPostsTable(); renderCategories(); renderFeaturedProducts(); filterAndSearch(); }); populateSavedPostsTable(); }


function populateSavedPostsTable() { const tbl = document.querySelector('#savedPostsTable tbody'); if (!tbl) return; tbl.innerHTML = ''; const posts = loadStoredPosts(); posts.forEach(p => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.category)}</td><td>${formatDate(p.date)}</td><td><button class="btn small" data-id="${p.id}" data-action="delete">Delete</button></td>`; tbl.appendChild(tr); }); tbl.querySelectorAll('button[data-action="delete"]').forEach(b => { b.addEventListener('click', () => { const id = b.getAttribute('data-id'); if (!confirm('Delete this post locally?')) return; allPosts = allPosts.filter(x => x.id !== id); saveStoredPosts(allPosts); populateSavedPostsTable(); filterAndSearch(); }); }); }


function escapeHtml(s=''){ return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatDate(d){ const dt=new Date(d); if (isNaN(dt)) return d; return dt.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}); }


function bootIndex() {
const searchInput = document.getElementById('searchInput'); const sortSelect = document.getElementById('sortSelect'); searchInput?.addEventListener('input', (e) => applySearch(e.target.value)); sortSelect?.addEventListener('change', () => renderPosts()); registerAdminForm(); renderCategories(); renderFeaturedProducts(); filterAndSearch(); }


bootIndex();
}


// Boot nav wiring on all pages
document.addEventListener('DOMContentLoaded', () => { wireNav(); bootIndexAdmin(); });


})();
