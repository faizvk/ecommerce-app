import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductsThunk } from "../redux/slice/productSlice";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import "./styles/Home.css";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(refreshCartCountThunk());
  });

  const { products, loading } = useSelector((state) => state.product);

  const categoryOrder = [
    "electronics",
    "fashion",
    "dairy",
    "technology",
    "home appliances",
  ];

  useEffect(() => {
    dispatch(fetchProductsThunk());
  }, [dispatch]);

  const categories = {};
  products.forEach((p) => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  const goToCategory = (cat) => {
    navigate(`/search?category=${encodeURIComponent(cat)}`);
  };

  if (loading) {
    return <p className="loading">Loading products...</p>;
  }

  return (
    <div className="home">
      {/* HERO SECTION */}
      <div>
        <HeroCarousel />
      </div>

      {/* CATEGORY TABS */}
      <div className="category-tabs">
        {categoryOrder.map((cat) => (
          <button
            key={cat}
            className="category-tab"
            onClick={() => goToCategory(cat)}
          >
            {cat[0].toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* CATEGORY SECTIONS */}
      <section className="products-section">
        <div>
          {categoryOrder.map((cat) => {
            const list = categories[cat] || [];

            // SKIP CATEGORY IF EMPTY
            if (list.length === 0) return null;

            const preview = list.slice(0, 12);
            const hasMore = list.length > 12;

            return (
              <section key={cat} className="category-section">
                {/* CATEGORY TITLE */}
                <h2 className="category-title">
                  {cat[0].toUpperCase() + cat.slice(1)}
                </h2>

                {/* PRODUCT GRID */}
                <div className="grid">
                  {preview.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* SHOW MORE */}
                {hasMore && (
                  <div className="show-more-wrapper">
                    <button
                      className="show-more-btn"
                      onClick={() => goToCategory(cat)}
                    >
                      Show More →
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
