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

  const queryParams = new URLSearchParams(search);
  const urlQuery = queryParams.get("query") || "";
  const urlCategory = queryParams.get("category") || "";

  const {
    searchedProducts = [],
    totalPages = 1,
    loading = false,
  } = useSelector((state) => state.product || {});

  const [page, setPage] = useState(1);

  const [localFilters, setLocalFilters] = useState({
    category: urlCategory,
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    order: "desc",
  });

  //whenever product category changes set page to 1
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      category: urlCategory,
    }));
    setPage(1);
  }, [urlCategory]);

  useEffect(() => {
    dispatch(
      searchProductsThunk({
        name: urlQuery,
        page, //pagination
        limit: 12,
        ...localFilters,
        category: urlCategory || localFilters.category,
      })
    );
  }, [urlQuery, urlCategory, page, dispatch]);

  const applyFilters = () => {
    setPage(1);
    dispatch(
      searchProductsThunk({
        name: urlQuery,
        page: 1,
        limit: 12,
        ...localFilters,
      })
    );
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="container search-results">
      <h2 className="title">
        Search Results
        {urlQuery && (
          <>
            {" "}
            for: "<span>{urlQuery}</span>"
          </>
        )}
        {urlCategory && <span> in {urlCategory}</span>}
      </h2>

      <SearchFilters
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        applyFilters={applyFilters}
      />

      {loading ? (
        <p className="loading">Loading products...</p>
      ) : searchedProducts.length === 0 ? (
        <p className="no-results">No products match your filters.</p>
      ) : (
        <>
          <div className="grid">
            {searchedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

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
