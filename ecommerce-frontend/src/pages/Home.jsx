import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { fetchProductsThunk } from "../redux/slice/productSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";

import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { CATEGORY_CONFIG, PREVIEW_LIMIT } from "../utils/productCategory";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(refreshCartCountThunk());
    dispatch(fetchProductsThunk());
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

      {/* CATEGORY NAV */}
      <nav
        className="flex items-center gap-2 px-6 py-4 overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white md:px-4 md:gap-2"
        aria-label="Product categories"
      >
        {CATEGORY_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            className="px-5 py-2 text-[0.875rem] font-semibold rounded-full border border-transparent cursor-pointer whitespace-nowrap text-gray-600 bg-gray-100 transition-all hover:bg-brand-light hover:text-brand hover:border-brand/20 md:px-4 md:py-1.5 md:text-sm"
            onClick={() => goToCategory(key)}
            aria-label={`Browse ${label}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* PRODUCTS */}
      <section className="mx-6 mt-8 sm:mx-4">
        {CATEGORY_CONFIG.map(({ key, label }) => {
          const list = productsByCategory[key] || [];
          if (list.length === 0) return null;

          const preview = list.slice(0, PREVIEW_LIMIT);
          const hasMore = list.length > PREVIEW_LIMIT;

          return (
            <section key={key} className="mb-12" aria-labelledby={`category-${key}`}>
              <div className="flex items-center justify-between mb-5">
                <h2
                  id={`category-${key}`}
                  className="text-2xl font-extrabold text-brand-dark capitalize sm:text-xl"
                >
                  {label}
                </h2>
                {hasMore && (
                  <button
                    className="flex items-center gap-1 text-[0.875rem] font-semibold text-brand hover:text-brand-dark transition-colors cursor-pointer border-0 bg-transparent"
                    onClick={() => goToCategory(key)}
                  >
                    View All <ChevronRight size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-6 lg:grid-cols-3 md:grid-cols-2 md:gap-4 sm:grid-cols-2 sm:gap-3">
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
