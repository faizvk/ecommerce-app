import { memo } from "react";

function SearchFilters({ localFilters, setLocalFilters, applyFilters }) {
  const update = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filters-bar">
      <select
        value={localFilters.category}
        onChange={(e) => update("category", e.target.value)}
        className="filter-input"
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
        placeholder="Min Price"
        className="filter-input"
        value={localFilters.minPrice}
        onChange={(e) => update("minPrice", e.target.value)}
      />

      <input
        type="number"
        placeholder="Max Price"
        className="filter-input"
        value={localFilters.maxPrice}
        onChange={(e) => update("maxPrice", e.target.value)}
      />

      <select
        value={localFilters.sortBy}
        onChange={(e) => update("sortBy", e.target.value)}
        className="filter-input"
      >
        <option value="createdAt">Newest</option>
        <option value="salePrice">Price</option>
        <option value="name">Name</option>
      </select>

      <select
        value={localFilters.order}
        onChange={(e) => update("order", e.target.value)}
        className="filter-input"
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>

      <button className="apply-btn" onClick={applyFilters}>
        Apply Filters
      </button>
    </div>
  );
}

export default memo(SearchFilters);
