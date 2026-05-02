import { memo, useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const fieldCls =
  "px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-[0.85rem] text-gray-700 transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)] cursor-pointer hover:border-gray-300";

const PRICE_PRESETS = [
  { label: "Under ₹500",   min: "",     max: "500"   },
  { label: "₹500–₹1500",   min: "500",  max: "1500"  },
  { label: "₹1500–₹5000",  min: "1500", max: "5000"  },
  { label: "₹5000+",       min: "5000", max: ""      },
];

function SearchFilters({ localFilters, setLocalFilters, applyFilters }) {
  const [open, setOpen] = useState(false); // collapsed by default on mobile
  const update = (key, value) => setLocalFilters((prev) => ({ ...prev, [key]: value }));

  const setPreset = (preset) => {
    setLocalFilters((prev) => ({ ...prev, minPrice: preset.min, maxPrice: preset.max }));
  };

  const isPresetActive = (preset) =>
    String(localFilters.minPrice) === String(preset.min) &&
    String(localFilters.maxPrice) === String(preset.max);

  // Detect any unsaved changes vs blank
  const hasAnyValue =
    !!localFilters.category ||
    !!localFilters.minPrice ||
    !!localFilters.maxPrice ||
    localFilters.sortBy !== "createdAt" ||
    localFilters.order !== "desc";

  const reset = () => {
    setLocalFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  return (
    <div className="my-5 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Header — toggles collapse on mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:cursor-default md:pointer-events-none w-full flex items-center justify-between gap-2 p-4 bg-transparent border-0 cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-brand" />
          <span className="text-[0.8rem] font-bold text-gray-700 uppercase tracking-wider">Filters</span>
          {hasAnyValue && (
            <span className="text-[0.65rem] font-bold text-brand bg-brand-light border border-brand/20 rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 md:hidden transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Body */}
      <div className={`px-4 pb-4 flex flex-col gap-3 ${open ? "block" : "hidden md:flex"}`}>
        {/* Row 1 — selects */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <select
            value={`${localFilters.sortBy}-${localFilters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split("-");
              setLocalFilters((prev) => ({ ...prev, sortBy, order }));
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

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              placeholder="Min ₹"
              className={`${fieldCls} w-24`}
              value={localFilters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
            />
            <span className="text-gray-300 text-sm">—</span>
            <input
              type="number"
              min="0"
              placeholder="Max ₹"
              className={`${fieldCls} w-24`}
              value={localFilters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Row 2 — price preset chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-500">Quick price:</span>
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(p)}
              className={`px-3 py-1 rounded-full text-[0.78rem] font-semibold border cursor-pointer transition-all ${
                isPresetActive(p)
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand hover:text-brand"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Row 3 — actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={applyFilters}
            className="px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-[0.85rem] border-0 cursor-pointer transition-all hover:bg-brand-dark active:scale-[0.98] shadow-sm"
          >
            Apply Filters
          </button>
          {hasAnyValue && (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2.5 bg-white text-gray-600 rounded-xl font-semibold text-[0.85rem] border border-gray-200 cursor-pointer transition-all hover:border-red-300 hover:text-red-500"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(SearchFilters);
