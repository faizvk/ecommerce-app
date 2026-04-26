import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";

const fieldCls =
  "px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-[0.85rem] text-gray-700 transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)] cursor-pointer hover:border-gray-300";

function SearchFilters({ localFilters, setLocalFilters, applyFilters }) {
  const update = (key, value) => setLocalFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="my-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={15} className="text-brand" />
        <span className="text-[0.8rem] font-bold text-gray-700 uppercase tracking-wider">Filters</span>
      </div>

      <div className="flex gap-2.5 flex-wrap items-center">
        <select
          value={localFilters.category}
          onChange={(e) => update("category", e.target.value)}
          className={fieldCls}
        >
          <option value="">All Categories</option>
          <option value="electronics">📱 Electronics</option>
          <option value="fashion">👗 Fashion</option>
          <option value="dairy">🥛 Dairy</option>
          <option value="technology">💻 Technology</option>
          <option value="home appliances">🏠 Home Appliances</option>
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min ₹"
            className={`${fieldCls} w-24`}
            value={localFilters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
          />
          <span className="text-gray-300 text-sm">—</span>
          <input
            type="number"
            placeholder="Max ₹"
            className={`${fieldCls} w-24`}
            value={localFilters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </div>

        <select
          value={`${localFilters.sortBy}-${localFilters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split("-");
            update("sortBy", sortBy);
            update("order", order);
          }}
          className={fieldCls}
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
          className="px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-[0.85rem] border-0 cursor-pointer transition-all hover:bg-brand-dark active:scale-[0.98] shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default memo(SearchFilters);
