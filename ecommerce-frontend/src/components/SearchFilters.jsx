import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";

function SearchFilters({ localFilters, setLocalFilters, applyFilters }) {
  const update = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const selectCls =
    "px-3 py-2 border border-gray-200 rounded-lg bg-white text-[0.875rem] text-gray-700 transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_0_3px_rgba(56,89,139,0.12)] cursor-pointer sm:w-full";

  const inputCls =
    "px-3 py-2 border border-gray-200 rounded-lg bg-white text-[0.875rem] text-gray-700 w-28 transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_0_3px_rgba(56,89,139,0.12)] sm:w-full";

  return (
    <div className="flex gap-2.5 my-5 flex-wrap items-center sm:flex-col sm:items-stretch">
      <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-gray-400 mr-1 sm:hidden">
        <SlidersHorizontal size={14} />
        Filters
      </div>

      <select
        value={localFilters.category}
        onChange={(e) => update("category", e.target.value)}
        className={selectCls}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="dairy">Dairy</option>
        <option value="technology">Technology</option>
        <option value="home appliances">Home Appliances</option>
      </select>

      <input
        type="number"
        placeholder="Min ₹"
        className={inputCls}
        value={localFilters.minPrice}
        onChange={(e) => update("minPrice", e.target.value)}
      />

      <input
        type="number"
        placeholder="Max ₹"
        className={inputCls}
        value={localFilters.maxPrice}
        onChange={(e) => update("maxPrice", e.target.value)}
      />

      <select
        value={`${localFilters.sortBy}-${localFilters.order}`}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split("-");
          update("sortBy", sortBy);
          update("order", order);
        }}
        className={selectCls}
      >
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="salePrice-asc">Price: Low to High</option>
        <option value="salePrice-desc">Price: High to Low</option>
        <option value="name-asc">Name: A–Z</option>
        <option value="name-desc">Name: Z–A</option>
      </select>

      <button
        onClick={applyFilters}
        className="px-5 py-2 bg-brand text-white rounded-lg font-semibold text-sm transition-all hover:bg-brand-dark active:scale-[0.98] sm:w-full"
      >
        Apply
      </button>
    </div>
  );
}

export default memo(SearchFilters);
