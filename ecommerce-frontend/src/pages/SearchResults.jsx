import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchProductsThunk } from "../redux/slice/productSlice";
import { fetchActiveOffersThunk } from "../redux/slice/offerSlice";
import ProductCard from "../components/ProductCard";
import SearchFilters from "../components/SearchFilters";
import Breadcrumbs from "../components/Breadcrumbs";
import { Search, Sparkles, Clock, ArrowLeft, X as XIcon } from "lucide-react";
import { CATEGORY_CONFIG } from "../utils/productCategory";

const SORT_LABELS = {
  "createdAt-desc": "Newest first",
  "createdAt-asc":  "Oldest first",
  "salePrice-asc":  "Price: Low to High",
  "salePrice-desc": "Price: High to Low",
  "name-asc":       "Name: A–Z",
  "name-desc":      "Name: Z–A",
};

function formatTimeLeft(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export default function SearchResults() {
  const dispatch = useDispatch();
  const { search } = useLocation();

  const queryParams = new URLSearchParams(search);
  const urlQuery = queryParams.get("query") || "";
  const urlCategory = queryParams.get("category") || "";
  const urlOfferId = queryParams.get("offer") || "";

  const {
    searchedProducts = [],
    totalPages = 1,
    loading = false,
  } = useSelector((state) => state.product || {});

  const { activeOffers } = useSelector((state) => state.offer);

  const [page, setPage] = useState(1);
  const [now, setNow] = useState(Date.now());
  const [localFilters, setLocalFilters] = useState({
    category: urlCategory,
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    order: "desc",
  });

  // Tick for live countdown when viewing an offer
  useEffect(() => {
    if (!urlOfferId) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [urlOfferId]);

  // Find the requested offer
  const offer = useMemo(
    () => activeOffers.find((o) => o._id === urlOfferId) || null,
    [activeOffers, urlOfferId]
  );

  // Products from the offer (when in offer mode)
  const offerProducts = useMemo(() => {
    if (!offer) return [];
    return (offer.productIds || []).filter((p) => typeof p === "object" && p?._id);
  }, [offer]);

  const isOfferMode = !!urlOfferId;

  useEffect(() => {
    setLocalFilters((prev) => ({ ...prev, category: urlCategory }));
    setPage(1);
  }, [urlCategory]);

  // Fetch active offers if we landed here via offer link directly
  useEffect(() => {
    if (urlOfferId && activeOffers.length === 0) {
      dispatch(fetchActiveOffersThunk());
    }
  }, [urlOfferId, activeOffers.length, dispatch]);

  // Skip product search when in offer mode
  useEffect(() => {
    if (isOfferMode) return;
    dispatch(
      searchProductsThunk({
        name: urlQuery,
        page,
        limit: 12,
        ...localFilters,
        category: urlCategory || localFilters.category,
      })
    );
  }, [urlQuery, urlCategory, page, dispatch, isOfferMode]);

  const applyFilters = () => {
    setPage(1);
    dispatch(searchProductsThunk({ name: urlQuery, page: 1, limit: 12, ...localFilters }));
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = [...Array(totalPages)].map((_, i) => i + 1);

  // Display products: from offer or from search
  const displayProducts = isOfferMode ? offerProducts : searchedProducts;

  // OFFER MODE — special header
  if (isOfferMode) {
    const offerExpired = offer && new Date(offer.endTime).getTime() <= now;
    const timeLeft = offer ? new Date(offer.endTime).getTime() - now : 0;
    const discountLabel =
      offer?.discountType === "fixed"
        ? `₹${offer.discountValue} OFF`
        : `${offer?.discountValue || 0}% OFF`;

    return (
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-gray-500 hover:text-brand transition-colors no-underline mb-4"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Offer hero card */}
        {offer ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-[#7c3aed] text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)] p-5 md:p-7 mb-6">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            {offer.bannerImage && (
              <img src={offer.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            )}

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="bg-white/15 border border-white/25 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 self-start">
                <Sparkles size={20} className="text-white" />
                <span className="text-2xl font-extrabold tracking-tight whitespace-nowrap">{discountLabel}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-extrabold leading-tight">{offer.title}</h1>
                {offer.description && (
                  <p className="text-[0.88rem] text-white/85 mt-1">{offer.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[0.82rem]">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full font-semibold">
                    {displayProducts.length} products
                  </span>
                  {offerExpired ? (
                    <span className="inline-flex items-center gap-1.5 bg-red-500/30 border border-red-300/40 px-2.5 py-1 rounded-full font-semibold">
                      <Clock size={11} />
                      Sale ended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full font-bold tabular-nums font-mono">
                      <Clock size={11} />
                      Ends in {formatTimeLeft(timeLeft)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-center">
            <p className="text-[0.92rem] font-semibold text-amber-700">This sale is no longer active</p>
            <p className="text-[0.82rem] text-amber-600 mt-1">It may have ended or been removed. Browse our full catalog instead.</p>
          </div>
        )}

        {/* Products */}
        {displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Sparkles size={26} className="text-gray-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-600">No products in this sale</p>
              <p className="text-sm text-gray-400 mt-0.5">The sale may have ended or products have been removed.</p>
            </div>
            <Link
              to="/"
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
            {displayProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Build active filter chips
  const activeChips = [];
  if (urlQuery) activeChips.push({ key: "query", label: `Search: "${urlQuery}"`, removeTo: `/search${urlCategory ? `?category=${encodeURIComponent(urlCategory)}` : ""}` });
  if (localFilters.category) activeChips.push({
    key: "category",
    label: `Category: ${localFilters.category}`,
    onRemove: () => { setLocalFilters((p) => ({ ...p, category: "" })); setPage(1); dispatch(searchProductsThunk({ name: urlQuery, page: 1, limit: 12, ...localFilters, category: "" })); },
  });
  if (localFilters.minPrice) activeChips.push({
    key: "min", label: `Min ₹${localFilters.minPrice}`,
    onRemove: () => { setLocalFilters((p) => ({ ...p, minPrice: "" })); setPage(1); dispatch(searchProductsThunk({ name: urlQuery, page: 1, limit: 12, ...localFilters, minPrice: "" })); },
  });
  if (localFilters.maxPrice) activeChips.push({
    key: "max", label: `Max ₹${localFilters.maxPrice}`,
    onRemove: () => { setLocalFilters((p) => ({ ...p, maxPrice: "" })); setPage(1); dispatch(searchProductsThunk({ name: urlQuery, page: 1, limit: 12, ...localFilters, maxPrice: "" })); },
  });
  if (localFilters.sortBy !== "createdAt" || localFilters.order !== "desc") {
    const sortKey = `${localFilters.sortBy}-${localFilters.order}`;
    activeChips.push({
      key: "sort", label: `Sort: ${SORT_LABELS[sortKey] || sortKey}`,
      onRemove: () => { setLocalFilters((p) => ({ ...p, sortBy: "createdAt", order: "desc" })); setPage(1); dispatch(searchProductsThunk({ name: urlQuery, page: 1, limit: 12, ...localFilters, sortBy: "createdAt", order: "desc" })); },
    });
  }

  const breadcrumbItems = urlQuery
    ? [{ label: `Search: "${urlQuery}"` }]
    : urlCategory
    ? [{ label: urlCategory, to: null }]
    : [{ label: "All Products" }];

  // NORMAL SEARCH MODE
  return (
    <div className="max-w-[1280px] mx-auto px-3 py-5 md:px-5 md:py-7">
      <Breadcrumbs items={breadcrumbItems} className="mb-4" />

      <div className="mb-3">
        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-xl capitalize">
          {urlQuery ? (
            <>Results for <span className="text-brand">"{urlQuery}"</span></>
          ) : urlCategory ? (
            urlCategory
          ) : (
            "All Products"
          )}
        </h2>
        {!loading && (
          <p className="text-[0.85rem] text-gray-400 mt-1">
            {searchedProducts.length > 0
              ? `${searchedProducts.length} ${searchedProducts.length === 1 ? "result" : "results"}`
              : "No products found"}
          </p>
        )}
      </div>

      <SearchFilters
        localFilters={localFilters}
        setLocalFilters={setLocalFilters}
        applyFilters={applyFilters}
      />

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[0.72rem] font-bold text-gray-500 uppercase tracking-wider">Filtering by:</span>
          {activeChips.map((chip) => (
            chip.removeTo ? (
              <Link
                key={chip.key}
                to={chip.removeTo}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light text-brand rounded-full text-[0.78rem] font-semibold no-underline border border-brand/20 hover:bg-brand hover:text-white transition-colors"
              >
                {chip.label}
                <XIcon size={11} />
              </Link>
            ) : (
              <button
                key={chip.key}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light text-brand rounded-full text-[0.78rem] font-semibold border border-brand/20 hover:bg-brand hover:text-white transition-colors cursor-pointer"
              >
                {chip.label}
                <XIcon size={11} />
              </button>
            )
          ))}
          <Link
            to="/search"
            className="text-[0.78rem] font-bold text-gray-500 hover:text-red-500 no-underline transition-colors ml-1"
          >
            Clear all
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      ) : searchedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={32} className="text-gray-300" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-700">No products match your filters</p>
            <p className="text-[0.88rem] text-gray-400 mt-1 max-w-md">Try adjusting your search or browse one of these popular categories.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {CATEGORY_CONFIG.map((c) => (
              <Link
                key={c.value}
                to={`/search?category=${encodeURIComponent(c.value)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 rounded-full text-[0.82rem] font-semibold no-underline border border-gray-200 hover:border-brand hover:text-brand hover:bg-brand-light transition-all"
              >
                <span>{c.emoji}</span>
                {c.label}
              </Link>
            ))}
          </div>
          <Link
            to="/"
            className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {searchedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

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
