import { memo } from "react";

function SearchFilters({ localFilters, setLocalFilters, applyFilters }) {
  const update = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const inputCls =
    "px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all focus:border-blue-500 focus:outline-none focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,115,232,0.1)] sm:w-full";

  return (
    <div className="flex gap-3 my-5 flex-wrap items-center sm:flex-col sm:items-stretch">
      <select
        value={localFilters.category}
        onChange={(e) => update("category", e.target.value)}
        className={inputCls}
      >
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="dairy">Dairy</option>
        <option value="technology">Technology</option>
        <option value="home appliances">Home Appliances</option>
      </select>

      <input
        type="number"
        placeholder="Min Price"
        className={inputCls}
        value={localFilters.minPrice}
        onChange={(e) => update("minPrice", e.target.value)}
      />

      <input
        type="number"
        placeholder="Max Price"
        className={inputCls}
        value={localFilters.maxPrice}
        onChange={(e) => update("maxPrice", e.target.value)}
      />

      <select
        value={localFilters.sortBy}
        onChange={(e) => update("sortBy", e.target.value)}
        className={inputCls}
      >
        <option value="createdAt">Newest</option>
        <option value="salePrice">Price</option>
        <option value="name">Name</option>
      </select>

      <select
        value={localFilters.order}
        onChange={(e) => update("order", e.target.value)}
        className={inputCls}
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>

      <button
        onClick={applyFilters}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all hover:bg-blue-700 active:scale-[0.98] sm:w-full"
      >
        Apply Filters
      </button>
    </div>
  );
}

export default memo(SearchFilters);
