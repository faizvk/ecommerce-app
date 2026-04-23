import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { fetchProductsThunk } from "../redux/slice/productSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";

import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { CATEGORY_CONFIG, PREVIEW_LIMIT } from "../utils/productCategory";

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
        <p className="text-center py-12 text-xl">Loading products...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full text-center py-12">
        <h2 className="text-red-700 text-2xl mb-2">Unable to load products</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchProductsThunk())}
          className="px-5 py-2.5 bg-brand text-white rounded-lg font-semibold cursor-pointer hover:bg-brand-dark"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="w-full">
      {/* HERO */}
      <section aria-label="Promotions">
        <HeroCarousel />
      </section>

      {/* CATEGORY NAV */}
      <nav
        className="flex justify-center items-center gap-4 px-2.5 py-3.5 z-20 overflow-x-auto scrollbar-hide md:gap-2.5 md:px-3 md:justify-start"
        aria-label="Product categories"
      >
        {CATEGORY_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            className="px-5 py-2.5 text-[0.95rem] font-semibold rounded-[30px] bg-transparent border-0 cursor-pointer whitespace-nowrap text-gray-700 transition-all hover:bg-[#e8eef7] hover:text-blue-600 md:px-4 md:py-2 md:text-sm"
            onClick={() => goToCategory(key)}
            aria-label={`Browse ${label}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* PRODUCTS */}
      <section className="mx-5 sm:mx-4">
        {CATEGORY_CONFIG.map(({ key, label }) => {
          const list = productsByCategory[key] || [];
          if (list.length === 0) return null;

          const preview = list.slice(0, PREVIEW_LIMIT);
          const hasMore = list.length > PREVIEW_LIMIT;

          return (
            <section key={key} className="mt-2.5" aria-labelledby={`category-${key}`}>
              <h2
                id={`category-${key}`}
                className="text-3xl font-bold mb-5 ml-7 text-brand-dark capitalize md:text-[1.7rem] md:ml-5 sm:text-2xl sm:ml-0 sm:text-center"
              >
                {label}
              </h2>

              <div className="grid grid-cols-4 gap-7 lg:grid-cols-3 md:grid-cols-2 md:gap-4 sm:grid-cols-2 sm:gap-3.5">
                {preview.map((product) => (
                  <ProductCard key={product._id} product={product} loading="lazy" />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-4 sm:mt-3">
                  <button
                    className="px-5 py-2.5 bg-blue-600 text-white border-0 rounded-md cursor-pointer font-semibold transition-all hover:bg-blue-800 sm:w-full"
                    onClick={() => goToCategory(key)}
                  >
                    Show More →
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </section>
    </main>
  );
}
