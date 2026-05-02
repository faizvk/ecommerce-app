import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { searchProductsThunk } from "../redux/slice/productSlice";
import { fetchActiveOffersThunk } from "../redux/slice/offerSlice";
import ProductCard from "../components/ProductCard";
import SearchFilters from "../components/SearchFilters";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from "../components/Pagination";
import { Search, Sparkles, Clock, ArrowLeft, X as XIcon } from "lucide-react";
import { CATEGORY_CONFIG } from "../utils/productCategory";

const PAGE_SIZE = 12;

const SORT_LABELS = {
  "createdAt-desc": "Newest first",
  "createdAt-asc":  "Oldest first",
  "salePrice-asc":  "Price: Low to High",
  "salePrice-desc": "Price: High to Low",
  "name-asc":       "Name: A–Z",
  "name-desc":      "Name: Z–A",
};

// Normalise URL params into a typed filter object
function readFilters(search) {
  const p = new URLSearchParams(search);
  const sort = p.get("sort") || "createdAt-desc";
  const [sortBy, order] = sort.split("-");
  return {
    query:    p.get("query") || "",
    category: p.get("category") || "",
    minPrice: p.get("min") || "",
    maxPrice: p.get("max") || "",
    sortBy:   sortBy || "createdAt",
    order:    order || "desc",
    page:     Math.max(1, parseInt(p.get("page") || "1", 10)),
    offerId:  p.get("offer") || "",
  };
}

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
  const navigate = useNavigate();
  const { search } = useLocation();

  // URL = single source of truth
  const filters = useMemo(() => readFilters(search), [search]);
  const isOfferMode = !!filters.offerId;

  const {
    searchedProducts = [],
    totalPages = 1,
    totalCount = 0,
    loading = false,
  } = useSelector((state) => state.product || {});
  const { activeOffers } = useSelector((state) => state.offer);

  // Form state — mirrors URL but stays editable while typing
  const [formFilters, setFormFilters] = useState({
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
    order: filters.order,
  });

  // Sync form state when URL changes externally (e.g., chip removed, breadcrumb clicked)
  useEffect(() => {
    setFormFilters({
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
      order: filters.order,
    });
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.sortBy, filters.order]);

  // Helper: update URL with one or more param changes
  const updateParams = useCallback((patch) => {
    const next = new URLSearchParams(search);
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "" || v === false) next.delete(k);
      else next.set(k, v);
    });
    navigate(`/search?${next.toString()}`);
  }, [search, navigate]);

  // Fetch on URL change (skip in offer mode)
  useEffect(() => {
    if (isOfferMode) return;
    dispatch(searchProductsThunk({
      name: filters.query,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
      order: filters.order,
      page: filters.page,
      limit: PAGE_SIZE,
    }));
  }, [dispatch, filters.query, filters.category, filters.minPrice, filters.maxPrice, filters.sortBy, filters.order, filters.page, isOfferMode]);

  /* ────────── OFFER MODE ────────── */
  const [now, setNow] = useState(Date.now());
  const offer = useMemo(() => activeOffers.find((o) => o._id === filters.offerId) || null, [activeOffers, filters.offerId]);
  const offerProducts = useMemo(() => offer ? (offer.productIds || []).filter((p) => typeof p === "object" && p?._id) : [], [offer]);

  useEffect(() => {
    if (!isOfferMode) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOfferMode]);

  useEffect(() => {
    if (filters.offerId && activeOffers.length === 0) dispatch(fetchActiveOffersThunk());
  }, [filters.offerId, activeOffers.length, dispatch]);

  if (isOfferMode) {
    const offerExpired = offer && new Date(offer.endTime).getTime() <= now;
    const timeLeft = offer ? new Date(offer.endTime).getTime() - now : 0;
    const discountLabel = offer?.discountType === "fixed"
      ? `₹${offer.discountValue} OFF`
      : `${offer?.discountValue || 0}% OFF`;

    return (
      <div className="max-w-[1280px] mx-auto px-3 py-5 md:px-5 md:py-7">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-gray-500 hover:text-brand transition-colors no-underline mb-4">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {offer ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-[#7c3aed] text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)] p-5 md:p-7 mb-6">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            {offer.bannerImage && <img src={offer.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="bg-white/15 border border-white/25 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 self-start">
                <Sparkles size={20} />
                <span className="text-2xl font-extrabold tracking-tight whitespace-nowrap">{discountLabel}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-extrabold leading-tight">{offer.title}</h1>
                {offer.description && <p className="text-[0.88rem] text-white/85 mt-1">{offer.description}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[0.82rem]">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full font-semibold">
                    {offerProducts.length} products
                  </span>
                  {offerExpired ? (
                    <span className="inline-flex items-center gap-1.5 bg-red-500/30 border border-red-300/40 px-2.5 py-1 rounded-full font-semibold">
                      <Clock size={11} />Sale ended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full font-bold tabular-nums font-mono">
                      <Clock size={11} />Ends in {formatTimeLeft(timeLeft)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-center">
            <p className="text-[0.92rem] font-semibold text-amber-700">This sale is no longer active</p>
          </div>
        )}

        {offerProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Sparkles size={26} className="text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-600">No products in this sale</p>
            <Link to="/" className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {offerProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    );
  }

  /* ────────── NORMAL MODE ────────── */

  // Active filter chips — each removes its filter via URL
  const chips = [];
  if (filters.query) chips.push({ key: "q", label: `Search: "${filters.query}"`, onRemove: () => updateParams({ query: null, page: null }) });
  if (filters.category) chips.push({ key: "cat", label: `Category: ${filters.category}`, onRemove: () => updateParams({ category: null, page: null }) });
  if (filters.minPrice) chips.push({ key: "min", label: `Min ₹${filters.minPrice}`, onRemove: () => updateParams({ min: null, page: null }) });
  if (filters.maxPrice) chips.push({ key: "max", label: `Max ₹${filters.maxPrice}`, onRemove: () => updateParams({ max: null, page: null }) });
  if (filters.sortBy !== "createdAt" || filters.order !== "desc") {
    const sortKey = `${filters.sortBy}-${filters.order}`;
    chips.push({ key: "sort", label: `Sort: ${SORT_LABELS[sortKey] || sortKey}`, onRemove: () => updateParams({ sort: null, page: null }) });
  }

  const breadcrumbItems = filters.query
    ? [{ label: `Search: "${filters.query}"` }]
    : filters.category
    ? [{ label: filters.category }]
    : [{ label: "All Products" }];

  // Apply form → push to URL (resets to page 1)
  const applyFilters = () => {
    updateParams({
      category: formFilters.category || null,
      min: formFilters.minPrice || null,
      max: formFilters.maxPrice || null,
      sort: (formFilters.sortBy !== "createdAt" || formFilters.order !== "desc") ? `${formFilters.sortBy}-${formFilters.order}` : null,
      page: null,
    });
  };

  const goToPage = (p) => {
    updateParams({ page: p === 1 ? null : p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Range labels
  const rangeStart = totalCount === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filters.page * PAGE_SIZE, totalCount);

  return (
    <div className="max-w-[1280px] mx-auto px-3 py-5 md:px-5 md:py-7">
      <Breadcrumbs items={breadcrumbItems} className="mb-4" />

      <div className="mb-3 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-xl capitalize">
            {filters.query ? (
              <>Results for <span className="text-brand">"{filters.query}"</span></>
            ) : filters.category ? (
              filters.category
            ) : (
              "All Products"
            )}
          </h2>
          {!loading && (
            <p className="text-[0.85rem] text-gray-400 mt-1">
              {totalCount > 0
                ? <>Showing <span className="font-bold text-gray-700">{rangeStart}–{rangeEnd}</span> of <span className="font-bold text-gray-700">{totalCount}</span> {totalCount === 1 ? "result" : "results"}</>
                : "No products found"}
            </p>
          )}
        </div>

        {/* Quick sort selector — instant, no Apply needed */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-[0.78rem] font-semibold text-gray-500">Sort:</label>
            <select
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => {
                const v = e.target.value;
                updateParams({ sort: v === "createdAt-desc" ? null : v, page: null });
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-[0.82rem] font-semibold text-gray-700 outline-none focus:border-brand cursor-pointer hover:border-gray-300"
            >
              {Object.entries(SORT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <SearchFilters
        localFilters={formFilters}
        setLocalFilters={setFormFilters}
        applyFilters={applyFilters}
      />

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[0.72rem] font-bold text-gray-500 uppercase tracking-wider">Filtering by:</span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light text-brand rounded-full text-[0.78rem] font-semibold border border-brand/20 hover:bg-brand hover:text-white transition-colors cursor-pointer"
            >
              {chip.label}
              <XIcon size={11} />
            </button>
          ))}
          <button
            onClick={() => navigate("/search")}
            className="text-[0.78rem] font-bold text-gray-500 hover:text-red-500 transition-colors ml-1 bg-transparent border-0 cursor-pointer"
          >
            Clear all
          </button>
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
          {chips.length > 0 ? (
            <button
              onClick={() => navigate("/search")}
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold transition-all hover:bg-brand-dark text-sm border-0 cursor-pointer"
            >
              Clear all filters
            </button>
          ) : (
            <Link
              to="/"
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm"
            >
              Back to Home
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {searchedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          <Pagination page={filters.page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}
