// Hero carousel slides. The local /public images are kept for the first three
// so existing branded artwork still renders; the new categories use Unsplash
// fallbacks. Each slide's `category` must match a key in CATEGORY_CONFIG so
// the CTA links to a real search results page.
export const slides = [
  {
    id: 2,
    title: "Unbeatable Deals on Tech",
    text: "Exclusive discounts on top-rated gadgets. Limited time offers on NexKart.",
    image: "/technologycorousal.png",
    button: "Grab Offer",
    category: "electronics",
  },
  {
    id: 3,
    title: "Transform Your Home",
    text: "Discover premium appliances and decor handpicked for modern living.",
    image: "/homecorousal.png",
    button: "Explore Now",
    category: "home",
  },
  {
    id: 1,
    title: "Style Meets Affordability",
    text: "Shop the latest fashion trends with NexKart — fast delivery, easy returns.",
    image: "/fashioncorousal.png",
    button: "Shop Now",
    category: "fashion",
  },
  {
    id: 4,
    title: "Beauty That Glows",
    text: "Skincare, makeup, and fragrances from your favourite brands.",
    image: "https://images.unsplash.com/photo-1522335789203-aaa2f6d1b7d8?w=1600&q=80&auto=format",
    button: "Shop Beauty",
    category: "beauty",
  },
];
