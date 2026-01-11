import { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { fetchProductsThunk } from "../redux/slice/productSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";

import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { CATEGORY_CONFIG, PREVIEW_LIMIT } from "../utils/productCategory";

import "./styles/Home.css";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector((state) => state.product);

  // Run once on mount
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

  const goToCategory = useCallback(
    (category) => {
      navigate(`/search?category=${encodeURIComponent(category)}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <main className="home">
        <p className="loading">Loading products...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="home error-state">
        <h2>Unable to load products</h2>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchProductsThunk())}>Retry</button>
      </main>
    );
  }

  return (
    <main className="home">
      {/* HERO */}
      <section aria-label="Promotions">
        <HeroCarousel />
      </section>

      {/* CATEGORY NAV */}
      <nav className="category-tabs" aria-label="Product categories">
        {CATEGORY_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            className="category-tab"
            onClick={() => goToCategory(key)}
            aria-label={`Browse ${label}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* PRODUCTS */}
      <section className="products-section">
        {CATEGORY_CONFIG.map(({ key, label }) => {
          const list = productsByCategory[key] || [];
          if (list.length === 0) return null;

          const preview = list.slice(0, PREVIEW_LIMIT);
          const hasMore = list.length > PREVIEW_LIMIT;

          return (
            <section
              key={key}
              className="category-section"
              aria-labelledby={`category-${key}`}
            >
              <h2 id={`category-${key}`} className="category-title">
                {label}
              </h2>

              <div className="home-grid">
                {preview.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    loading="lazy"
                  />
                ))}
              </div>

              {hasMore && (
                <div className="show-more-wrapper">
                  <button
                    className="show-more-btn"
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
