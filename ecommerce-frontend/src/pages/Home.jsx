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
import {
  ChevronRight, Truck, RefreshCcw, ShieldCheck, Headphones,
  Sparkles, Mail, Send,
} from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Free Delivery", sub: "On orders above ₹499" },
  { icon: RefreshCcw, title: "Easy Returns", sub: "7-day hassle-free" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "100% safe checkout" },
  { icon: Headphones, title: "24/7 Support", sub: "Always here to help" },
];

const CATEGORY_TILE_GRADIENTS = {
  "electronics":      "from-blue-400 to-indigo-500",
  "fashion":          "from-pink-400 to-rose-500",
  "dairy":            "from-amber-300 to-orange-400",
  "technology":       "from-cyan-400 to-sky-500",
  "home appliances":  "from-emerald-400 to-teal-500",
};

const CATEGORY_ROW_ACCENT = {
  "electronics":      "from-blue-400 to-indigo-500",
  "fashion":          "from-pink-400 to-rose-500",
  "dairy":            "from-amber-400 to-orange-500",
  "technology":       "from-cyan-400 to-sky-500",
  "home appliances":  "from-emerald-400 to-teal-500",
};

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

      {/* ACTIVE OFFERS BANNER */}
      <OfferBanner />

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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_CONFIG.map(({ key, label, emoji, desc }) => {
            const count = productsByCategory[key]?.length || 0;
            const gradient = CATEGORY_TILE_GRADIENTS[key] || "from-brand to-brand-medium";
            return (
              <button
                key={key}
                onClick={() => goToCategory(key)}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer text-left overflow-hidden transition-all hover:border-brand/30 hover:shadow-hover hover:-translate-y-0.5"
              >
                <div className={`absolute -top-10 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-30 group-hover:opacity-60 transition-opacity`} />
                <div className="relative">
                  <div className="text-3xl md:text-[2rem] mb-2 leading-none">{emoji}</div>
                  <h3 className="font-extrabold text-gray-900 text-[0.95rem] leading-tight">{label}</h3>
                  <p className="text-[0.72rem] text-gray-400 mt-0.5 line-clamp-1">{desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[0.72rem] font-bold text-gray-500">{count} items</span>
                    <span className="text-brand inline-flex items-center gap-0.5 text-[0.78rem] font-bold group-hover:translate-x-0.5 transition-transform">
                      Shop <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PROMOTIONAL BANNER CARDS */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
        <PromoBanners />
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

      {/* TESTIMONIALS */}
      <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-4">
        <Testimonials />
      </section>

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
