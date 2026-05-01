import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import {
  fetchProductsThunk,
  adminDeleteProductThunk,
  updateStockThunk,
} from "../redux/slice/productSlice";
import { PRODUCT_CATEGORIES } from "./constants";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import PageHeader from "./components/PageHeader";
import AdminLoader from "./components/AdminLoader";
import EmptyState from "./components/EmptyState";
import ConfirmDialog from "./components/ConfirmDialog";

const stockBadgeCls = (stock) =>
  stock > 10
    ? "border-green-300 bg-green-50 text-green-700"
    : stock > 0
    ? "border-yellow-300 bg-yellow-50 text-yellow-700"
    : "border-red-300 bg-red-50 text-red-600";

const TABS = [{ value: "all", label: "All", emoji: "🗂️" }, ...PRODUCT_CATEGORIES.map((c) => ({ value: c.value, label: c.label, emoji: c.emoji }))];

function StockEditor({ product }) {
  const dispatch = useDispatch();
  const [value, setValue] = useState(product.stock ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(product.stock ?? 0); }, [product.stock]);

  const persist = useCallback(async (next) => {
    const num = Number(next);
    if (Number.isNaN(num) || num < 0) return;
    if (num === product.stock) return;
    setSaving(true);
    try {
      await dispatch(updateStockThunk({ productId: product._id, stock: num })).unwrap();
      toast.success("Stock updated", { autoClose: 1200 });
    } catch {
      toast.error("Stock update failed");
      setValue(product.stock ?? 0);
    } finally {
      setSaving(false);
    }
  }, [dispatch, product._id, product.stock]);

  const debouncedPersist = useDebouncedCallback(persist, 700);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        disabled={saving}
        className={`w-20 px-2 py-1.5 text-sm rounded-lg border outline-none transition-all focus:shadow-[0_0_0_2px_rgba(79,70,229,0.2)] disabled:opacity-60 ${stockBadgeCls(value)}`}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedPersist(e.target.value);
        }}
      />
      {saving && <span className="text-[0.7rem] text-gray-400 animate-pulse">Saving…</span>}
    </div>
  );
}

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);

  const [activeCategory, setActiveCategory] = useState("all");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsThunk());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await dispatch(adminDeleteProductThunk(confirmTarget._id)).unwrap();
      toast.success("Product deleted");
      setConfirmTarget(null);
    } catch (err) {
      toast.error(err || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Products"
        subtitle={`${products.length} total products`}
        action={
          <Link
            to="/admin/products/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm no-underline transition-all hover:bg-brand-dark shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
          >
            <Plus size={16} />
            Add Product
          </Link>
        }
      />

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((cat) => {
          const count = cat.value === "all" ? products.length : products.filter((p) => p.category === cat.value).length;
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer whitespace-nowrap transition-all ${
                isActive
                  ? "bg-brand text-white border-brand shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand/30 hover:text-brand"
              }`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.emoji} {cat.label}
              <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <AdminLoader />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={activeCategory === "all" ? "Add your first product to get started." : "No products in this category yet."}
          action={
            <Link
              to="/admin/products/add"
              className="px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm no-underline transition-all hover:bg-brand-dark"
            >
              Add Product
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card bg-white">
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
              {filteredProducts.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image?.[0] || "/placeholder.jpg"}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <span className="font-semibold text-gray-900 line-clamp-2 max-w-[220px]">{p.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-brand">₹{p.salePrice}</span>
                    {p.costPrice && p.salePrice < p.costPrice && (
                      <span className="block text-[0.72rem] text-red-500 font-semibold">
                        {Math.round(((p.costPrice - p.salePrice) / p.costPrice) * 100)}% OFF
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <StockEditor product={p} />
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[0.72rem] bg-brand-light text-brand font-semibold px-2.5 py-1 rounded-full capitalize">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-light text-brand rounded-lg text-[0.78rem] font-semibold no-underline transition-all hover:bg-brand hover:text-white"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 border-0 rounded-lg text-[0.78rem] font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white"
                        onClick={() => setConfirmTarget(p)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete product?"
        message={confirmTarget ? `Are you sure you want to delete "${confirmTarget.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
