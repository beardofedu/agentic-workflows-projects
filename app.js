import { PRODUCTS, STUB_INFO } from './catalog.js';

// Expose functions to global scope for inline HTML event handlers
window.showStub = showStub;
window.closeModal = closeModal;
window.filterProducts = filterProducts;
window.addToCart = addToCart;
window.scrollToProducts = scrollToProducts;

// ===== SESSION STORAGE CACHE =====
const CACHE_KEY = 'tm_catalog_v1';

// ===== STATE =====
let cart = [];
let currentFilter = 'all';

// ===== SEARCH INDEX (pre-built at page load and memoized) =====
let _searchIndex = null;

function buildSearchIndex() {
  if (_searchIndex) return _searchIndex;
  _searchIndex = PRODUCTS.reduce((idx, p) => {
    const tokens = `${p.name} ${p.category} ${p.badge ?? ''}`.toLowerCase().split(/\W+/).filter(Boolean);
    tokens.forEach(t => {
      if (!idx[t]) idx[t] = new Set();
      idx[t].add(p.id);
    });
    return idx;
  }, {});
  return _searchIndex;
}

// ===== RENDER PRODUCTS =====
function renderProducts(filter = 'all') {
  const cacheKey = `${CACHE_KEY}_${filter}`;
  const grid = document.getElementById('productsGrid');
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    grid.innerHTML = cached;
  } else {
    const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
    const html = filtered.map(productCard).join('');
    grid.innerHTML = html;
    try { sessionStorage.setItem(cacheKey, html); } catch (_) { /* quota exceeded — ignore */ }
  }

  initProductObserver();
}

function productCard(p) {
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating));
  const badgeHtml = p.badge
    ? `<span class="product-badge badge-${p.badge}">${p.badge === 'stub' ? '🚧 Stub' : p.badge.toUpperCase()}</span>`
    : '';
  const originalHtml = p.original ? `<span class="original">$${p.original}</span>` : '';
  const addBtnLabel = p.badge === 'stub' ? 'Unavailable' : 'Add to Cart';
  const addBtnClick = p.badge === 'stub'
    ? `showStub('Product Detail Page')`
    : `addToCart(${p.id})`;

  return `
    <div class="product-card" data-category="${p.category}" data-lazy>
      <div class="product-img-placeholder" role="img" aria-label="${p.name} product image">${p.emoji}</div>
      <div class="product-info">
        ${badgeHtml}
        <div class="product-name">${p.name}</div>
        <div class="product-category">${p.category}</div>
        <div class="product-rating" aria-label="${p.rating} out of 5 stars, ${p.reviews} reviews">${stars} (${p.reviews})</div>
        <div class="product-footer">
          <div class="product-price">$${p.price}${originalHtml}</div>
          <button class="add-to-cart" onclick="${addBtnClick}" aria-label="${addBtnLabel} ${p.name}">${addBtnLabel}</button>
        </div>
      </div>
    </div>`;
}

// ===== LAZY LOADING (Intersection Observer for product cards) =====
function initProductObserver() {
  if (!('IntersectionObserver' in window)) {
    // Graceful fallback for older browsers
    document.querySelectorAll('.product-card[data-lazy]').forEach(c => c.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

  document.querySelectorAll('.product-card[data-lazy]:not(.visible)').forEach(card => observer.observe(card));
}

// ===== REVIEWS ON DEMAND (loaded only when user scrolls to section) =====
function initReviewsObserver() {
  const section = document.getElementById('reviews-section');
  if (!section || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) {
      section.dataset.loaded = 'true';
      obs.disconnect();
    }
  }, { rootMargin: '0px 0px 200px 0px' });

  observer.observe(section);
}

// ===== FILTER =====
function filterProducts(category, btn) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(category);
}

// ===== CART =====
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Cart add works, but checkout is stubbed
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartCount();
  showToast(`${product.emoji} ${product.name} added to cart`);
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

// ===== STUB MODAL =====
function showStub(featureName) {
  const info = STUB_INFO[featureName];
  const modal = document.getElementById('stubModal');
  const inner = modal.querySelector('.modal');
  document.getElementById('modalTitle').textContent = featureName + ' — Not Yet Implemented';

  if (info) {
    document.getElementById('modalBody').textContent = info.note;
    const meta = document.getElementById('modalMeta');
    meta.textContent = `📋 ${info.ticket} · Planned for ${info.sprint}`;
    meta.classList.add('visible');
  } else {
    document.getElementById('modalBody').textContent =
      "This feature is on the backlog and hasn't been built yet.";
    document.getElementById('modalMeta').classList.remove('visible');
  }

  modal.classList.add('open');
  inner.focus();
}

function closeModal() {
  document.getElementById('stubModal').classList.remove('open');
}

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ===== TOAST =====
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== UTILS =====
function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ===== INIT =====
buildSearchIndex();
renderProducts();
initReviewsObserver();
