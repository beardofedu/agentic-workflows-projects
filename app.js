// Product catalog
const PRODUCTS = [
  { id: 1,  name: "ProPhone 15 Ultra",    category: "phones",      emoji: "📱", price: 1199, original: null,  rating: 4.8, reviews: 312, badge: "new"  },
  { id: 2,  name: "ProPhone 15",          category: "phones",      emoji: "📱", price: 899,  original: null,  rating: 4.6, reviews: 198, badge: null   },
  { id: 3,  name: "SoundPods Pro",        category: "audio",       emoji: "🎧", price: 249,  original: 299,   rating: 4.7, reviews: 541, badge: "sale" },
  { id: 4,  name: "BassBar Speaker",      category: "audio",       emoji: "🔊", price: 179,  original: null,  rating: 4.4, reviews: 87,  badge: null   },
  { id: 5,  name: "SmartWatch Series 9",  category: "wearables",   emoji: "⌚", price: 399,  original: 449,   rating: 4.9, reviews: 720, badge: "sale" },
  { id: 6,  name: "FitBand Active",       category: "wearables",   emoji: "📿", price: 79,   original: null,  rating: 4.2, reviews: 154, badge: "new"  },
  { id: 7,  name: "USB-C Hub 10-in-1",    category: "accessories", emoji: "🔌", price: 59,   original: null,  rating: 4.5, reviews: 402, badge: null   },
  { id: 8,  name: "MagCharge Pad",        category: "accessories", emoji: "🪫", price: 39,   original: null,  rating: 4.3, reviews: 238, badge: null   },
  { id: 9,  name: "Tablet Pro 13",        category: "phones",      emoji: "🖥️", price: 799,  original: 899,   rating: 4.6, reviews: 95,  badge: "sale" },
  { id: 10, name: "Retro Gaming Pad",     category: "accessories", emoji: "🎮", price: 49,   original: null,  rating: 4.1, reviews: 63,  badge: "stub" },
  { id: 11, name: "NoiseFree Buds",       category: "audio",       emoji: "🎵", price: 129,  original: null,  rating: 4.5, reviews: 189, badge: null   },
  { id: 12, name: "AR Glasses Dev Kit",   category: "wearables",   emoji: "🥽", price: 699,  original: null,  rating: 3.9, reviews: 18,  badge: "stub" },
];

// Stub feature metadata — maps feature names to sprint context
const STUB_INFO = {
  "Login / Sign Up": {
    sprint: "Sprint 2",
    ticket: "AUTH-001",
    note: "User authentication flow is planned for Sprint 2. Currently blocked on backend API.",
  },
  "Shopping Cart": {
    sprint: "Sprint 1",
    ticket: "CART-003",
    note: "Cart persistence and quantity management are in-progress. UI complete, API integration pending.",
  },
  "View Deals": {
    sprint: "Sprint 3",
    ticket: "PROMO-007",
    note: "Promotions engine requires discount rule service not yet built.",
  },
  "Flash Sale Page": {
    sprint: "Sprint 3",
    ticket: "PROMO-008",
    note: "Depends on PROMO-007 (discount rules). Moved to Sprint 3 due to dependency delay.",
  },
  "Order History": {
    sprint: "Sprint 4",
    ticket: "ACC-012",
    note: "Order history requires auth (Sprint 2) and order service (Sprint 3) to ship first.",
  },
  "Wishlist": {
    sprint: "Sprint 2",
    ticket: "ACC-005",
    note: "Wishlist feature is part of the account module planned for Sprint 2.",
  },
  "Help Center": {
    sprint: "Sprint 5",
    ticket: "SUP-001",
    note: "Help center content and search are planned as a post-launch initiative.",
  },
  "Contact Us": {
    sprint: "Sprint 4",
    ticket: "SUP-002",
    note: "Contact form requires support ticketing integration.",
  },
  "Returns": {
    sprint: "Sprint 4",
    ticket: "OPS-009",
    note: "Returns portal depends on order service and warehouse API.",
  },
  "Login": {
    sprint: "Sprint 2",
    ticket: "AUTH-001",
    note: "User authentication flow is planned for Sprint 2.",
  },
  "Register": {
    sprint: "Sprint 2",
    ticket: "AUTH-002",
    note: "Registration and email verification planned for Sprint 2.",
  },
  "Product Detail Page": {
    sprint: "Sprint 1",
    ticket: "PDP-001",
    note: "Full product detail page with images, specs, and reviews is in Sprint 1.",
  },
};

let cart = [];
let currentFilter = "all";

// ===== RENDER PRODUCTS =====
function renderProducts(filter = "all") {
  const grid = document.getElementById("productsGrid");
  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(productCard).join("");
}

function productCard(p) {
  const stars = "★".repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(p.rating));
  const badgeHtml = p.badge
    ? `<span class="product-badge badge-${p.badge}">${p.badge === "stub" ? "🚧 Stub" : p.badge.toUpperCase()}</span>`
    : "";
  const originalHtml = p.original ? `<span class="original">$${p.original}</span>` : "";
  const addBtnLabel = p.badge === "stub" ? "Unavailable" : "Add to Cart";
  const addBtnClick = p.badge === "stub"
    ? `showStub('Product Detail Page')`
    : `addToCart(${p.id})`;

  return `
    <div class="product-card" data-category="${p.category}">
      <div class="product-img-placeholder">${p.emoji}</div>
      <div class="product-info">
        ${badgeHtml}
        <div class="product-name">${p.name}</div>
        <div class="product-category">${p.category}</div>
        <div class="product-rating" title="${p.rating}/5">${stars} (${p.reviews})</div>
        <div class="product-footer">
          <div class="product-price">$${p.price}${originalHtml}</div>
          <button class="add-to-cart" onclick="${addBtnClick}">${addBtnLabel}</button>
        </div>
      </div>
    </div>`;
}

// ===== FILTER =====
function filterProducts(category, btn) {
  currentFilter = category;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
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
  document.getElementById("cartCount").textContent = total;
}

// ===== STUB MODAL =====
function showStub(featureName) {
  const info = STUB_INFO[featureName];
  const modal = document.getElementById("stubModal");
  document.getElementById("modalTitle").textContent = featureName + " — Not Yet Implemented";

  if (info) {
    document.getElementById("modalBody").textContent = info.note;
    const meta = document.getElementById("modalMeta");
    meta.textContent = `📋 ${info.ticket} · Planned for ${info.sprint}`;
    meta.classList.add("visible");
  } else {
    document.getElementById("modalBody").textContent =
      "This feature is on the backlog and hasn't been built yet.";
    document.getElementById("modalMeta").classList.remove("visible");
  }

  modal.classList.add("open");
}

function closeModal() {
  document.getElementById("stubModal").classList.remove("open");
}

// ===== TOAST =====
let toastTimer;
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== UTILS =====
function scrollToProducts() {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// ===== INIT =====
renderProducts();
