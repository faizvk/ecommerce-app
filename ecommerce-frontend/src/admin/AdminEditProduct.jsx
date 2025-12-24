// src/admin/AdminEditProduct.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductByIdThunk,
  adminUpdateProductThunk,
} from "../redux/slice/productSlice";
import Button from "../components/Button";
import { uploadImage } from "../utils/uploadImage";
import "./styles/AdminEditProduct.css";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct, loading, error } = useSelector(
    (state) => state.product
  );

  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!currentProduct) return;

    setForm({
      ...currentProduct,
      description: currentProduct.description || "",
      category: currentProduct.category || "",
      stock: currentProduct.stock ?? 0,
    });

    const img = currentProduct.image?.[0];
    setPreview(img && img.length > 3 ? img : "/placeholder.jpg");
  }, [currentProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numberFields = ["costPrice", "salePrice", "stock"];

    setForm((prev) => ({
      ...prev,
      [name]: numberFields.includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.category.trim()) return "Category is required";

    if (form.costPrice < 0 || form.salePrice < 0)
      return "Price cannot be negative";

    if (form.salePrice < form.costPrice)
      return "Sale price cannot be lower than cost price";

    if (form.stock < 0) return "Stock cannot be negative";

    return "";
  };

  const updateProduct = async () => {
    setLocalError("");
    const validation = validate();
    if (validation) return setLocalError(validation);

    setSaving(true);

    try {
      let imageUrl = form.image?.[0] || "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        id,
        data: {
          ...form,
          image: [imageUrl],
        },
      };

      await dispatch(adminUpdateProductThunk(payload)).unwrap();
      navigate("/admin/products");
    } catch (err) {
      setLocalError(err || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div className="ep-wrapper">
      <h1 className="ep-title">Edit Product</h1>
      <p className="ep-subtitle">
        Modify details and update product information
      </p>

      {(localError || error) && (
        <p className="ep-error">{localError || error}</p>
      )}

      <div className="ep-grid">
        {/* LEFT FORM */}
        <div className="ep-form">
          <label className="ep-label">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="ep-input"
          />

          <label className="ep-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="ep-textarea"
          />

          <div className="ep-row">
            <div>
              <label className="ep-label">Cost Price</label>
              <input
                name="costPrice"
                type="number"
                value={form.costPrice}
                onChange={handleChange}
                className="ep-input"
              />
            </div>

            <div>
              <label className="ep-label">Sale Price</label>
              <input
                name="salePrice"
                type="number"
                value={form.salePrice}
                onChange={handleChange}
                className="ep-input"
              />
            </div>
          </div>

          <label className="ep-label">Stock</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className="ep-input"
          />

          <label className="ep-label">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="ep-select"
          >
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="dairy">Dairy</option>
            <option value="technology">Technology</option>
            <option value="home appliances">Home Appliances</option>
          </select>
        </div>

        {/* IMAGE */}
        <div className="ep-image-section">
          <p className="ep-label">Product Image</p>

          <div className="ep-image-box">
            <img
              src={preview || "/placeholder.jpg"}
              alt="preview"
              className="ep-preview"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="ep-file"
          />
        </div>
      </div>

      <Button variant="primary" onClick={updateProduct} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
