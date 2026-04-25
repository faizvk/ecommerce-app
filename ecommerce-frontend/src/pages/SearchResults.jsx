import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchProductsThunk } from "../redux/slice/productSlice";
import ProductCard from "../components/ProductCard";
import SearchFilters from "../components/SearchFilters";
import { Search } from "lucide-react";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = [...Array(totalPages)].map((_, i) => i + 1);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 sm:px-4 sm:py-6">
      {/* TITLE */}
      <div className="mb-1">
        <h2 className="text-2xl font-extrabold text-brand-dark sm:text-xl">
          {urlQuery ? (
            <>
              Results for{" "}
              <span className="text-brand">"{urlQuery}"</span>
            </>
          ) : urlCategory ? (
            <>
              <span className="capitalize">{urlCategory}</span>
            </>
          ) : (
            "All Products"
          )}
        </h2>
        {!loading && (
          <p className="text-[0.85rem] text-gray-400 mt-0.5">
            {searchedProducts.length > 0
              ? `${searchedProducts.length} product${searchedProducts.length !== 1 ? "s" : ""} found`
              : "No products found"}
          </p>
        )}
      </div>

      <SearchFilters
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        applyFilters={applyFilters}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      ) : searchedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={26} className="text-gray-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-600">No products match your filters</p>
            <p className="text-sm text-gray-400 mt-0.5">Try adjusting your search or removing some filters.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
            {searchedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold text-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                ← Prev
              </button>

              {pageNumbers.map((num) => (
                <button
                  key={num}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm cursor-pointer border transition-all ${
                    page === num
                      ? "bg-brand text-white border-brand shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => goToPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold text-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
