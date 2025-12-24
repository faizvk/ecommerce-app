import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchProductsThunk } from "../redux/slice/productSlice";
import ProductCard from "../components/ProductCard";
import SearchFilters from "../components/SearchFilters";
import "./styles/SearchResults.css";

export default function SearchResults() {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const url = new URLSearchParams(search);

  const query = url.get("query") || "";
  const defaultCategory = url.get("category") || "";

  const {
    searchedProducts = [], // ✅ fallback
    totalPages = 1, // ✅ fallback
    loading = false, // ✅ fallback
  } = useSelector((state) => state.product || {});

  const products = searchedProducts;

  const [page, setPage] = useState(1);

  const [localFilters, setLocalFilters] = useState({
    category: defaultCategory,
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const [activeFilters, setActiveFilters] = useState({
    category: defaultCategory,
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    order: "desc",
  });

  useEffect(() => {
    dispatch(
      searchProductsThunk({
        name: query,
        page,
        limit: 12,
        ...activeFilters,
      })
    );
  }, [query, activeFilters, page, dispatch]);

  useEffect(() => {
    if (defaultCategory) {
      setLocalFilters((prev) => ({ ...prev, category: defaultCategory }));
      setActiveFilters((prev) => ({
        ...prev,
        category: defaultCategory,
        _force: Date.now(),
      }));
    }
  }, [defaultCategory]);

  const applyFilters = () => {
    setPage(1);
    setActiveFilters({ ...localFilters, _force: Date.now() });
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="container search-results">
      <h2 className="title">
        Search Results{" "}
        {query && (
          <>
            for: "<span>{query}</span>"
          </>
        )}
        {defaultCategory && <span> in {defaultCategory}</span>}
      </h2>

      <SearchFilters
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        applyFilters={applyFilters}
      />

      {loading ? (
        <p className="loading">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="no-results">No products match your filters.</p>
      ) : (
        <>
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* PAGINATION */}
          <div className="pagination">
            <button
              className="pg-btn"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pg-btn ${page === i + 1 ? "active" : ""}`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="pg-btn"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
