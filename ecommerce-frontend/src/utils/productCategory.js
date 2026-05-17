// Canonical category set shown across the storefront — Home tiles, top nav,
// SearchFilters dropdown, and the admin product form all import from here.
// `image` URLs are pulled from Unsplash's image CDN with a width hint so the
// browser downloads tile-sized JPEGs instead of full-resolution originals.
//
// To add a category: append here, then add the same `key` to the product
// model enum (ecommerce-backend/model/product.model.js) and to the AI
// controller's CATEGORIES list (ecommerce-backend/controller/ai.controller.js).
export const CATEGORY_CONFIG = [
  {
    key: "electronics",
    label: "Electronics",
    emoji: "📱",
    desc: "Phones, audio & gadgets",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format",
  },
  {
    key: "fashion",
    label: "Fashion",
    emoji: "👗",
    desc: "Clothing & accessories",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80&auto=format",
  },
  {
    key: "home",
    label: "Home & Kitchen",
    emoji: "🏠",
    desc: "Appliances, decor & more",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format",
  },
  {
    key: "beauty",
    label: "Beauty",
    emoji: "💄",
    desc: "Skincare & cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format",
  },
  {
    key: "sports",
    label: "Sports & Fitness",
    emoji: "⚽",
    desc: "Gear, gym & outdoors",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80&auto=format",
  },
  {
    key: "books",
    label: "Books",
    emoji: "📚",
    desc: "Bestsellers & stationery",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80&auto=format",
  },
  {
    key: "grocery",
    label: "Grocery",
    emoji: "🛒",
    desc: "Daily essentials & fresh",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80&auto=format",
  },
];

export const PREVIEW_LIMIT = 8;
