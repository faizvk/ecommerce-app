import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { fetchProductsThunk } from "../redux/slice/productSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { fetchActiveOffersThunk } from "../redux/slice/offerSlice";

import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import OfferBanner from "../components/OfferBanner";
import { CATEGORY_CONFIG, PREVIEW_LIMIT } from "../utils/productCategory";
import { ChevronRight, Truck, RefreshCcw, ShieldCheck, Headphones } from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Free Delivery", sub: "On orders above ₹499" },
  { icon: RefreshCcw, title: "Easy Returns", sub: "7-day hassle-free" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "100% safe checkout" },
  { icon: Headphones, title: "24/7 Support", sub: "Always here to help" },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(refreshCartCountThunk());
    dispatch(fetchProductsThunk());
    dispatch(fetchActiveOffersThunk());
  }, [dispatch]);

  const productsByCategory = useMemo(() => {
    const map = {};
    for (const product of products || []) {
      if (!product?.category) continue;
      if (!map[product.category]) map[product.category] = [];
      map[product.category].push(product);
    }
    return map;
  }, [products]);

  const goToCategory = (category) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <main className="w-full">
        <div className="flex justify-center items-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-12 h-12 rounded-full border-4 border-brand-medium border-t-brand" />
            <p className="text-gray-500 font-medium">Loading products...</p>
          </div>
        </div>
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
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4">
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

      {/* CATEGORY NAV */}
      <section className="bg-white border-b border-gray-100 sticky top-[57px] md:top-[65px] z-40">
        <nav
          className="flex items-center gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide max-w-[1200px] mx-auto"
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
              aria-label={`Browse ${label}`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </nav>
      </section>

      {/* PRODUCTS BY CATEGORY */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
        {CATEGORY_CONFIG.map(({ key, label, emoji }) => {
          const list = productsByCategory[key] || [];
          if (list.length === 0) return null;

          const preview = list.slice(0, PREVIEW_LIMIT);
          const hasMore = list.length > PREVIEW_LIMIT;

          return (
            <section key={key} className="mb-12" aria-labelledby={`category-${key}`}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center text-lg flex-shrink-0">
                    {emoji}
                  </div>
                  <div>
                    <h2
                      id={`category-${key}`}
                      className="text-lg md:text-xl font-extrabold text-gray-900 leading-none"
                    >
                      {label}
                    </h2>
                    <p className="text-[0.75rem] text-gray-400 mt-0.5">{list.length} products</p>
                  </div>
                </div>

                {hasMore && (
                  <button
                    className="flex items-center gap-1 text-[0.82rem] font-semibold text-brand hover:text-brand-dark transition-colors cursor-pointer border border-brand/25 bg-brand-light hover:bg-brand hover:text-white rounded-full px-3.5 py-1.5 no-underline"
                    onClick={() => goToCategory(key)}
                  >
                    View All <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
                {preview.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </main>
  );
}
