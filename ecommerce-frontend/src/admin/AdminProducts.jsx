import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsThunk,
  adminDeleteProductThunk,
  updateStockThunk,
} from "../redux/slice/productSlice";

const CATEGORY_TABS = ["all", "electronics", "fashion", "dairy", "technology", "home appliances"];

const stockCls = (stock) =>
  stock > 10
    ? "border-green-300 bg-green-50 text-green-700"
    : stock > 0
    ? "border-yellow-300 bg-yellow-50 text-yellow-700"
    : "border-red-300 bg-red-50 text-red-600";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);

  const [updating, setUpdating] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchProductsThunk());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    dispatch(adminDeleteProductThunk(id));
  };

  const handleStockChange = async (id, value) => {
    const stock = Number(value);
    if (Number.isNaN(stock) || stock < 0) return;
    setUpdating(id);
    try {
      await dispatch(updateStockThunk({ productId: id, stock })).unwrap();
    } catch {
      alert("Stock update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-brand-dark">Manage Products</h1>
        <Link
          to="/admin/products/add"
          className="px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm no-underline transition-all hover:bg-brand-dark"
        >
          + Add Product
        </Link>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-brand text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center py-12 text-gray-400">No products found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] shadow-card bg-white">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Sale Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 w-32">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isUpdating = updating === p._id;
                return (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image?.[0] || "/placeholder.jpg"}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <span className="font-semibold text-gray-900 line-clamp-2 max-w-[200px]">{p.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-brand">₹{p.salePrice}</span>
                      {p.costPrice && p.salePrice < p.costPrice && (
                        <span className="block text-[0.75rem] text-red-500 font-semibold">
                          {Math.round(((p.costPrice - p.salePrice) / p.costPrice) * 100)}% OFF
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={p.stock ?? 0}
                          disabled={isUpdating}
                          className={`w-20 px-2 py-1.5 text-sm rounded-lg border outline-none transition-all focus:shadow-[0_0_0_2px_rgba(56,89,139,0.2)] disabled:opacity-60 ${stockCls(p.stock)}`}
                          onChange={(e) => handleStockChange(p._id, e.target.value)}
                        />
                        {isUpdating && <span className="text-[0.75rem] text-gray-400 animate-pulse">Saving...</span>}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[0.75rem] bg-brand-light text-brand font-semibold px-2.5 py-1 rounded-full capitalize">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="px-3 py-1.5 bg-brand-light text-brand rounded-lg text-[0.8rem] font-semibold no-underline transition-all hover:bg-brand hover:text-white"
                        >
                          Edit
                        </Link>
                        <button
                          className="px-3 py-1.5 bg-red-50 text-red-500 border-0 rounded-lg text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white"
                          onClick={() => deleteProduct(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
