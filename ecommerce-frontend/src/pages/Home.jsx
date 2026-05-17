import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { fetchProductsThunk } from "../redux/slice/productSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { fetchCartThunk } from "../redux/slice/cartItemsSlice";
import { fetchActiveOffersThunk } from "../redux/slice/offerSlice";
import {
  selectProductsByCategory,
  selectTopDeals,
  selectTopRated,
  selectNewArrivals,
  selectBudgetPicks,
} from "../redux/selectors";

import ProductRow from "../components/ProductRow";
import HeroCarousel from "../components/HeroCarousel";
import OfferBanner from "../components/OfferBanner";
import Testimonials from "../components/Testimonials";
import PromoBanners from "../components/PromoBanners";
import { ProductCardSkeletonGrid } from "../components/ui/Skeleton";
import { CATEGORY_CONFIG } from "../utils/productCategory";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import DealOfTheDay from "../components/DealOfTheDay";
import CouponStrip from "../components/CouponStrip";
import LifestyleCollections from "../components/LifestyleCollections";
import AppDownloadBanner from "../components/AppDownloadBanner";
import AIPicksRow from "../components/AIPicksRow";
import {
  ChevronRight, Truck, RefreshCcw, ShieldCheck, Headphones,
  Sparkles, Mail, Send, TrendingUp, Users, Star, Lock,
} from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Free Delivery", sub: "On orders above ₹499" },
  { icon: RefreshCcw, title: "Easy Returns", sub: "7-day hassle-free" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "100% safe checkout" },
  { icon: Headphones, title: "24/7 Support", sub: "Always here to help" },
];

// Trust badges — small credibility strip. Numbers are placeholder marketing
// copy; swap with real metrics from analytics when available.
const TRUST_BADGES = [
  { icon: Users,       label: "100K+ Customers" },
  { icon: Star,        label: "4.8 ★ Avg Rating" },
  { icon: ShieldCheck, label: "Verified Sellers" },
  { icon: Lock,        label: "Secure Checkout" },
];

// Trending searches — quick-tap entry chips that funnel into the existing
// /search?query= flow. Keep this list short and current; rotate seasonally.
const TRENDING_SEARCHES = [
  "iPhone 15",
  "Air Fryer",
  "Running Shoes",
  "Wireless Earbuds",
  "Yoga Mat",
  "Face Serum",
  "Diwali Gifts",
  "Backpack",
  "Smart Watch",
  "Coffee Maker",
];

const CATEGORY_TILE_GRADIENTS = {
  "electronics": "from-blue-400 to-indigo-500",
  "fashion":     "from-pink-400 to-rose-500",
  "home":        "from-emerald-400 to-teal-500",
  "beauty":      "from-fuchsia-400 to-pink-500",
  "sports":      "from-orange-400 to-red-500",
  "books":       "from-amber-400 to-yellow-500",
  "grocery":     "from-lime-400 to-green-500",
};

const CATEGORY_ROW_ACCENT = CATEGORY_TILE_GRADIENTS;

// Flagship brand spotlight cards — full-bleed advert format. Each card is a
// sponsored-style banner: hero photo, brand logo, headline copy, price, CTA.
// Click runs a text search for the brand or product.
//
// `logoSlug` resolves to cdn.simpleicons.org/<slug>/ffffff. `cover` is an
// Unsplash photo URL with a width hint so the browser downloads card-sized
// JPEGs rather than the full-resolution original.
const BRANDS = [
  {
    name: "Apple",
    logoSlug: "apple",
    headline: "Think different.",
    sub: "iPhone 15 Pro · Titanium edition",
    price: "₹1,19,900",
    mrp: "₹1,34,900",
    cover: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=1000&q=80&auto=format",
    tint: "from-gray-900/95 via-gray-900/60 to-transparent",
    query: "Apple",
  },
  {
    name: "Sony",
    logoSlug: "sony",
    headline: "Push your limits.",
    sub: "WH-1000XM5 wireless · industry-leading ANC",
    price: "₹26,990",
    mrp: "₹34,990",
    cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80&auto=format",
    tint: "from-amber-900/85 via-orange-800/40 to-transparent",
    query: "Sony",
  },
  {
    name: "Nike",
    logoSlug: "nike",
    headline: "Just do it.",
    sub: "Air Max 270 · all-day cushioning",
    price: "₹8,995",
    mrp: "₹13,495",
    cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80&auto=format",
    tint: "from-black/95 via-zinc-900/55 to-transparent",
    query: "Nike",
  },
  {
    name: "Samsung",
    logoSlug: "samsung",
    headline: "Galaxy unfolded.",
    sub: "Galaxy S24 Ultra · 200MP camera",
    price: "₹1,04,999",
    mrp: "₹1,29,999",
    cover: "https://images.unsplash.com/photo-1610792516775-01de03eae630?w=1000&q=80&auto=format",
    tint: "from-blue-900/95 via-blue-800/55 to-transparent",
    query: "Samsung",
  },
  {
    name: "Bose",
    logoSlug: "bose",
    headline: "Better sound, every day.",
    sub: "QuietComfort Ultra · spatial audio",
    price: "₹29,990",
    mrp: "₹39,990",
    cover: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=1000&q=80&auto=format",
    tint: "from-neutral-950/90 via-neutral-800/55 to-transparent",
    query: "Bose",
  },
  {
    name: "Adidas",
    logoSlug: "adidas",
    headline: "Impossible is nothing.",
    sub: "Ultraboost 22 · responsive energy return",
    price: "₹12,999",
    mrp: "₹17,999",
    cover: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1000&q=80&auto=format",
    tint: "from-emerald-950/90 via-emerald-800/45 to-transparent",
    query: "Adidas",
  },
  {
    name: "Levi's",
    logoSlug: "levis",
    headline: "Live in Levi's.",
    sub: "501 Original · since 1873",
    price: "₹2,499",
    mrp: "₹3,999",
    cover: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000&q=80&auto=format",
    tint: "from-red-900/90 via-red-800/50 to-transparent",
    query: "Levi's",
  },
  {
    name: "Puma",
    logoSlug: "puma",
    headline: "Forever faster.",
    sub: "RS-X · retro running silhouette",
    price: "₹6,999",
    mrp: "₹9,999",
    cover: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80&auto=format",
    tint: "from-yellow-900/90 via-amber-700/45 to-transparent",
    query: "Puma",
  },
  {
    name: "Dell",
    logoSlug: "dell",
    headline: "Built to last. Designed to perform.",
    sub: "XPS 15 · OLED 4K display",
    price: "₹1,84,990",
    mrp: "₹2,14,990",
    cover: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1000&q=80&auto=format",
    tint: "from-sky-950/95 via-sky-800/50 to-transparent",
    query: "Dell",
  },
  {
    name: "L'Oréal",
    logoSlug: "loreal",
    headline: "Because you're worth it.",
    sub: "Revitalift skincare collection",
    price: "₹999",
    mrp: "₹1,499",
    cover: "https://images.unsplash.com/photo-1522335789203-aaa2f6d1b7d8?w=1000&q=80&auto=format",
    tint: "from-rose-950/90 via-pink-800/45 to-transparent",
    query: "Loreal",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use granular selectors so components only re-render when the relevant slice changes
  const products = useSelector((s) => s.product.products);
  const loading = useSelector((s) => s.product.loading);
  const error = useSelector((s) => s.product.error);
  const userRole = useSelector((s) => s.auth.user?.role);

  // Memoized derived collections — cached across renders, shared across components
  const productsByCategory = useSelector(selectProductsByCategory);
  const topDeals    = useSelector(selectTopDeals);
  const topRated    = useSelector(selectTopRated);
  const newArrivals = useSelector(selectNewArrivals);
  const budgetPicks = useSelector(selectBudgetPicks);

  // Recently viewed (localStorage-backed). Only render the row for returning
  // users who have at least 2 viewed items — single-item rows look sad.
  const { items: recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    // Only fetch if not already loaded (Redux acts as a cache)
    if (!products || products.length === 0) dispatch(fetchProductsThunk());
    dispatch(refreshCartCountThunk());
    dispatch(fetchActiveOffersThunk());
    if (userRole === "user") dispatch(fetchCartThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userRole]);

  const goToCategory = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  // Skeleton state — much closer to the final page than a centered spinner
  if (loading && (!products || products.length === 0)) {
    return (
      <main className="w-full pb-10">
        <div className="w-full h-[260px] sm:h-[360px] lg:h-[500px] bg-gray-100 animate-pulse" />
        <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
          <div className="h-8 w-48 bg-gray-200 rounded-md mb-5 animate-pulse" />
          <ProductCardSkeletonGrid count={8} />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full text-center py-20 px-4">
        <div className="max-w-sm mx-auto flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl">!</div>
          <h2 className="text-xl font-bold text-gray-800">Unable to load products</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => dispatch(fetchProductsThunk())}
            className="px-6 py-3 bg-brand text-white rounded-xl font-semibold cursor-pointer hover:bg-brand-dark transition-all"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full pb-10">
      {/* HERO */}
      <section aria-label="Promotions">
        <HeroCarousel />
      </section>

      {/* TRUST BADGES — credibility ribbon directly under the hero */}
      <section className="bg-gradient-to-r from-brand-light via-white to-brand-light border-b border-gray-100">
        <div className="max-w-[1320px] mx-auto px-2 md:px-4 py-2.5">
          <div className="flex items-center justify-around gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-gray-700 flex-shrink-0">
                <Icon size={14} className="text-brand" />
                <span className="text-[0.72rem] md:text-[0.78rem] font-bold whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVE OFFERS BANNER */}
      <OfferBanner />

      {/* TRENDING SEARCHES — chip strip */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-5">
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp size={14} className="text-brand" />
          <span className="text-[0.78rem] font-extrabold uppercase tracking-wider text-gray-700">Trending now</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 md:-mx-4 md:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TRENDING_SEARCHES.map((q) => (
            <button
              key={q}
              onClick={() => navigate(`/search?query=${encodeURIComponent(q)}`)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-[0.8rem] font-semibold text-gray-700 hover:border-brand hover:bg-brand-light hover:text-brand transition-all whitespace-nowrap cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-[1320px] mx-auto px-2 md:px-4 py-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.82rem] font-bold text-gray-800 leading-none mb-0.5">{title}</p>
                  <p className="text-[0.72rem] text-gray-400 leading-none">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE TILES */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-brand to-[#7c3aed]" />
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900 leading-tight">Shop by Category</h2>
              <p className="text-[0.8rem] text-gray-400 mt-0.5">Find what you need, fast</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-2 px-2 md:-mx-4 md:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORY_CONFIG.map(({ key, label, desc, image }) => {
            const list = productsByCategory[key] || [];
            const count = list.length;
            // Cap the displayed count so a category with 60 items doesn't dominate
            // a row of cards each at 30. Shows '30+' once the threshold is crossed.
            const countLabel = count >= 30 ? "30+" : String(count);
            // Live stats derived from real data — minimum sale price and biggest
            // discount %. Falls back to nulls when the category has no products.
            const minPrice = count
              ? Math.min(...list.map((p) => p.salePrice).filter((n) => typeof n === "number" && n > 0))
              : null;
            const maxDiscount = count
              ? Math.max(
                  ...list.map((p) =>
                    p.costPrice > p.salePrice
                      ? Math.round(((p.costPrice - p.salePrice) / p.costPrice) * 100)
                      : 0
                  )
                )
              : 0;
            // Preview thumbnails — first 3 in-stock products. Skip the strip if
            // any are missing images so we don't render broken tiles.
            const previews = list
              .filter((p) => p.image?.[0])
              .slice(0, 3);

            return (
              <button
                key={key}
                onClick={() => goToCategory(key)}
                className="group relative bg-white rounded-2xl border border-gray-100 cursor-pointer text-left overflow-hidden transition-all hover:border-brand/30 hover:shadow-hover hover:-translate-y-0.5 snap-start flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] flex flex-col"
              >
                {/* Hero cover */}
                <div className="relative h-32 md:h-36 overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  {/* Item count badge top-left */}
                  <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-gray-800 text-[0.65rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                    {countLabel} items
                  </span>
                  {/* Discount badge top-right */}
                  {maxDiscount >= 20 && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[0.65rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      Up to {maxDiscount}% off
                    </span>
                  )}
                  {/* Category name overlaid on image, big and prominent */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-white font-extrabold text-lg leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                      {label}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 md:p-3.5 flex flex-col flex-1">
                  <p className="text-[0.72rem] text-gray-500 line-clamp-1">{desc}</p>

                  {/* Product preview thumbnails */}
                  {previews.length > 0 && (
                    <div className="flex gap-1.5 mt-2.5">
                      {previews.map((p) => (
                        <div
                          key={p._id}
                          className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100"
                        >
                          <img
                            src={p.image[0]}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        </div>
                      ))}
                      {count > previews.length && (
                        <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center text-[0.7rem] font-extrabold border border-brand/15">
                          +{Math.min(99, count - previews.length)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price + CTA row pinned to bottom */}
                  <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                    {minPrice != null ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-[0.62rem] text-gray-400 uppercase font-bold tracking-wider">From</span>
                        <span className="text-gray-900 text-[1rem] font-extrabold tabular-nums">₹{minPrice}</span>
                      </div>
                    ) : <span />}
                    <span className="inline-flex items-center gap-0.5 bg-brand text-white px-3 py-1.5 rounded-full text-[0.74rem] font-bold group-hover:translate-x-0.5 transition-transform shadow-sm">
                      Shop <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* DEAL OF THE DAY — big urgency banner with live midnight countdown */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
        <DealOfTheDay />
      </section>

      {/* RECENTLY VIEWED — only for returning users with 2+ items */}
      {recentlyViewed.length >= 2 && (
        <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
          <ProductRow
            title="Pick up where you left off"
            subtitle="Recently viewed"
            accent="from-violet-400 to-purple-500"
            products={recentlyViewed}
            viewAllHref="/search"
          />
        </section>
      )}

      {/* COUPONS — click-to-copy promo codes */}
      <CouponStrip />

      {/* SHOP BY BRAND — full-bleed advertisement cards */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-brand to-[#7c3aed]" />
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900 leading-tight">Shop by Brand</h2>
              <p className="text-[0.8rem] text-gray-400 mt-0.5">Flagship picks from the names you love</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-2 px-2 md:-mx-4 md:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {BRANDS.map((b) => (
            <button
              key={b.name}
              onClick={() => navigate(`/search?query=${encodeURIComponent(b.query)}`)}
              className="group relative snap-start flex-shrink-0 w-[88vw] max-w-[520px] sm:w-[500px] md:w-[540px] rounded-2xl overflow-hidden text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-hover border-0 shadow-card"
              style={{ aspectRatio: "16 / 9" }}
            >
              {/* Full-bleed cover image */}
              <img
                src={b.cover}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Brand-coloured gradient tint for text legibility */}
              <div className={`absolute inset-0 bg-gradient-to-r ${b.tint}`} />

              {/* Brand logo badge top-left */}
              <div className="absolute top-3 left-3 md:top-4 md:left-4 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                <img
                  src={`https://cdn.simpleicons.org/${b.logoSlug}/ffffff`}
                  alt={b.name}
                  loading="lazy"
                  className="h-4 md:h-5 w-auto"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <span className="text-white text-[0.72rem] md:text-[0.78rem] font-extrabold uppercase tracking-wider">{b.name}</span>
              </div>

              {/* Sponsored micro-label top-right */}
              <span className="absolute top-3 right-3 md:top-4 md:right-4 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/55">
                Sponsored
              </span>

              {/* Advert content — bottom-left stack */}
              <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6 text-white max-w-[80%]">
                <h3 className="text-xl md:text-3xl font-extrabold leading-tight mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {b.headline}
                </h3>
                <p className="text-[0.82rem] md:text-[0.92rem] text-white/85 mb-3 line-clamp-1">
                  {b.sub}
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-lg md:text-2xl font-extrabold tabular-nums">{b.price}</span>
                  <span className="text-[0.78rem] md:text-[0.85rem] text-white/55 line-through tabular-nums pb-0.5">{b.mrp}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 rounded-full font-extrabold text-[0.78rem] md:text-[0.85rem] shadow-md group-hover:translate-x-1 transition-transform">
                  Shop now <ChevronRight size={13} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL BANNER CARDS */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
        <PromoBanners />
      </section>

      {/* LIFESTYLE COLLECTIONS — curated picks by intent */}
      <LifestyleCollections />

      {/* SPOTLIGHT AD — full-width flagship offer */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mb-8">
        <button
          onClick={() => navigate("/search?sort=salePrice-asc")}
          className="group relative w-full overflow-hidden rounded-3xl text-left text-white cursor-pointer border-0 shadow-[0_12px_40px_rgba(79,70,229,0.25)]"
        >
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80&auto=format"
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand/75 to-[#7c3aed]/50" />
          <div className="relative px-6 py-10 md:px-12 md:py-16 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 bg-white/15 border border-white/25 rounded-full text-[0.7rem] font-bold uppercase tracking-[0.18em]">
              <Sparkles size={12} /> Mega Sale · Live now
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 max-w-2xl">
              Up to 70% off this weekend
            </h2>
            <p className="text-white/85 text-[0.95rem] md:text-base max-w-xl mb-5">
              Hand-picked deals across every category. New drops every hour — once they&apos;re gone, they&apos;re gone.
            </p>
            <span className="inline-flex items-center gap-1.5 bg-white text-brand-dark px-5 py-2.5 rounded-full font-extrabold text-[0.92rem] shadow-md group-hover:translate-x-1 transition-transform">
              Shop the sale <ChevronRight size={15} />
            </span>
          </div>
        </button>
      </section>

      {/* TOP DEALS */}
      {topDeals.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-2 md:px-4">
          <ProductRow
            title="Top Deals of the Day"
            subtitle="Biggest discounts, while stocks last"
            accent="from-red-400 to-orange-500"
            products={topDeals}
            viewAllHref="/search"
          />
        </section>
      )}

      {/* CATEGORY NAV (sticky) */}
      <section className="bg-[#f0f0ff]/80 backdrop-blur-md border-y border-gray-200/50 sticky top-[57px] md:top-[65px] z-40">
        <nav
          className="flex items-center gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide max-w-[1280px] mx-auto"
          aria-label="Product categories"
        >
          <button
            className="px-4 py-2 text-sm font-semibold rounded-full cursor-pointer whitespace-nowrap text-brand bg-brand-light border border-brand/20 transition-all hover:bg-brand hover:text-white flex-shrink-0"
            onClick={() => navigate("/search")}
          >
            All
          </button>
          {CATEGORY_CONFIG.map(({ key, label, emoji }) => (
            <button
              key={key}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full cursor-pointer whitespace-nowrap text-gray-600 bg-gray-100 border border-transparent transition-all hover:bg-brand-light hover:text-brand hover:border-brand/20 flex-shrink-0"
              onClick={() => goToCategory(key)}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </nav>
      </section>

      {/* PER-CATEGORY HORIZONTAL SCROLLERS */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
        {CATEGORY_CONFIG.map(({ key, label }) => {
          const list = productsByCategory[key] || [];
          if (list.length === 0) return null;

          return (
            <ProductRow
              key={key}
              title={`Best in ${label}`}
              subtitle={`${list.length} curated picks for you`}
              accent={CATEGORY_ROW_ACCENT[key] || "from-brand to-brand-medium"}
              products={list.slice(0, 12)}
              viewAllHref={`/search?category=${encodeURIComponent(key)}`}
            />
          );
        })}
      </section>

      {/* TOP RATED */}
      {topRated.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-2 md:px-4">
          <ProductRow
            title="Top Rated"
            subtitle="Customer favourites with stellar reviews"
            accent="from-amber-400 to-orange-500"
            products={topRated}
            viewAllHref="/search"
          />
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-2 md:px-4">
          <ProductRow
            title="New Arrivals"
            subtitle="Fresh in this week"
            accent="from-brand to-[#7c3aed]"
            products={newArrivals}
            viewAllHref="/search"
          />
        </section>
      )}

      {/* BUDGET PICKS */}
      {budgetPicks.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-2 md:px-4">
          <ProductRow
            title="Under ₹999"
            subtitle="Wallet-friendly steals"
            accent="from-emerald-400 to-teal-500"
            products={budgetPicks}
            viewAllHref="/search"
          />
        </section>
      )}

      {/* AI PICKS FOR YOU — Groq-personalised row (auth users with signals) */}
      <AIPicksRow />

      {/* TESTIMONIALS */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-4">
        <Testimonials />
      </section>

      {/* APP DOWNLOAD — dark banner with QR + store badges */}
      <AppDownloadBanner />

      {/* PROMO CTA — newsletter signup */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-[#7c3aed] text-white shadow-[0_12px_40px_rgba(79,70,229,0.3)]">
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-7 md:p-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-white/15 border border-white/25 rounded-full text-[0.7rem] font-bold uppercase tracking-[0.15em]">
                <Sparkles size={12} />
                Members get more
              </span>
              <h2 className="text-2xl md:text-[2rem] font-extrabold leading-tight mb-3">
                Save 10% on your first order
              </h2>
              <p className="text-[0.95rem] text-white/80 max-w-md">
                Subscribe to our newsletter for exclusive deals, new arrivals, and members-only promotions delivered to your inbox.
              </p>
            </div>

            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/25 text-white placeholder:text-white/50 text-[0.92rem] outline-none focus:bg-white/15 focus:border-white/45 transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-6 py-3.5 bg-white text-brand-dark rounded-xl font-bold text-[0.92rem] border-0 cursor-pointer transition-all hover:bg-brand-light hover:scale-[1.02] shadow-md whitespace-nowrap"
              >
                Subscribe
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
