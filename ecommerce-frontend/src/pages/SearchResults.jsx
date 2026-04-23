import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchProductsThunk } from "../redux/slice/productSlice";
import ProductCard from "../components/ProductCard";
import SearchFilters from "../components/SearchFilters";

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

  useEffect(() => {
    setLocalFilters((prev) => ({ ...prev, category: urlCategory }));
    setPage(1);
  }, [urlCategory]);

  useEffect(() => {
    dispatch(
      searchProductsThunk({
        name: urlQuery,
        page,
        limit: 12,
        ...localFilters,
        category: urlCategory || localFilters.category,
      })
    );
  }, [urlQuery, urlCategory, page, dispatch]);

  const applyFilters = () => {
    setPage(1);
    dispatch(searchProductsThunk({ name: urlQuery, page: 1, limit: 12, ...localFilters }));
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const pageNumbers = [...Array(totalPages)].map((_, i) => i + 1);

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      <h2 className="text-2xl font-bold text-brand-dark mb-2 sm:text-xl">
        Search Results
        {urlQuery && (
          <> for: "<span className="text-brand">{urlQuery}</span>"</>
        )}
        {urlCategory && <span className="text-brand"> in {urlCategory}</span>}
      </h2>

      <SearchFilters
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        applyFilters={applyFilters}
      />

      {loading ? (
        <p className="text-center py-12 text-xl text-brand">Loading products...</p>
      ) : searchedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-xl text-gray-400">No products match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-6 mt-2 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3.5">
            {searchedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 font-semibold text-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                Prev
              </button>

              {pageNumbers.map((num) => (
                <button
                  key={num}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm cursor-pointer border transition-all ${
                    page === num
                      ? "bg-brand text-white border-brand shadow-md"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => goToPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 font-semibold text-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
