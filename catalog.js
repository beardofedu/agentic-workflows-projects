// Product catalog data — separate chunk so the main app logic loads independently
export const PRODUCTS = [
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
export const STUB_INFO = {
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
