import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsThunk,
  adminDeleteProductThunk,
  updateStockThunk,
} from "../redux/slice/productSlice";
import "./styles/AdminProducts.css";

const CATEGORY_TABS = [
  "all",
  "electronics",
  "fashion",
  "dairy",
  "technology",
  "home appliances",
];

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
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    dispatch(adminDeleteProductThunk(id));
  };

  const handleStockChange = async (id, value) => {
    const stock = Number(value);
    if (Number.isNaN(stock) || stock < 0) return;

    setUpdating(id);

    try {
      await dispatch(
        updateStockThunk({
          productId: id,
          stock,
        })
      ).unwrap();
    } catch {
      alert("Stock update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="admin-products-page">
      {/* HEADER */}
      <div className="admin-products-header">
        <h1>Manage Products</h1>

        <Link to="/admin/products/add" className="btn-primary add-product-btn">
          + Add Product
        </Link>
      </div>

      {/* CATEGORY TABS */}
      <div className="admin-category-tabs">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            className={`admin-category-tab ${
              activeCategory === cat ? "active" : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="loading">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="empty-text">No products found.</p>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sale Price</th>
                <th width="130">Stock</th>
                <th>Category</th>
                <th width="160">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => {
                const isUpdating = updating === p._id;

                return (
                  <tr key={p._id}>
                    {/* PRODUCT */}
                    <td className="product-info-cell">
                      <img
                        src={p.image?.[0] || "/placeholder.jpg"}
                        className="product-thumb"
                        alt={p.name}
                      />
                      <div className="product-info">
                        <strong className="product-name">{p.name}</strong>
                      </div>
                    </td>

                    {/* PRICE */}
                    <td>
                      <span className="price-tag">₹{p.salePrice}</span>

                      {p.costPrice && p.salePrice < p.costPrice && (
                        <small className="discount">
                          {Math.round(
                            ((p.costPrice - p.salePrice) / p.costPrice) * 100
                          )}
                          % OFF
                        </small>
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="stock-col">
                      <input
                        type="number"
                        min="0"
                        value={p.stock ?? 0}
                        disabled={isUpdating}
                        className={`stock-input ${
                          p.stock > 10
                            ? "in-stock"
                            : p.stock > 0
                            ? "low-stock"
                            : "out-stock"
                        }`}
                        onChange={(e) =>
                          handleStockChange(p._id, e.target.value)
                        }
                      />
                      {isUpdating && (
                        <span className="stock-loading">Saving...</span>
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td className="category-col">
                      <span className="category-badge">{p.category}</span>
                    </td>

                    {/* ACTIONS */}
                    <td className="actions-cell">
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="btn-edit"
                      >
                        Edit
                      </Link>

                      <button
                        className="btn-delete"
                        onClick={() => deleteProduct(p._id)}
                      >
                        Delete
                      </button>
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
