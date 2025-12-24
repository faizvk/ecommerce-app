// src/admin/AdminAddProduct.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminAddProductThunk } from "../redux/slice/productSlice";
import { uploadImage } from "../utils/uploadImage";
import "./styles/AdminAddProduct.css";

export default function AdminAddProduct() {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "electronics",
    costPrice: "",
    salePrice: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedImages = [];

    for (const file of files) {
      try {
        const url = await uploadImage(file);
        if (url) uploadedImages.push(url);
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    setImages((prev) => [...prev, ...uploadedImages]);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading || saving) return;

    if (Number(form.salePrice) < Number(form.costPrice)) {
      alert("Sale price must be equal or greater than cost price!");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one product image.");
      return;
    }

    const payload = {
      ...form,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      stock: Number(form.stock),
      image: images,
    };

    setSaving(true);

    try {
      await dispatch(adminAddProductThunk(payload)).unwrap();

      alert("Product added successfully!");

      setForm({
        name: "",
        description: "",
        category: "electronics",
        costPrice: "",
        salePrice: "",
        stock: "",
      });

      setImages([]);
    } catch (err) {
      console.error(err);
      alert(err || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (uploading || saving) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    await handleImageUpload({ target: { files } });
  };

  return (
    <div className="admin-add-product-page">
      <h1>Add New Product</h1>

      <form className="admin-add-product-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label>Description</label>
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="dairy">Dairy</option>
          <option value="technology">Technology</option>
          <option value="home appliances">Home Appliances</option>
        </select>

        <label>Cost Price</label>
        <input
          type="number"
          required
          value={form.costPrice}
          onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
        />

        <label>Sale Price</label>
        <input
          type="number"
          required
          value={form.salePrice}
          onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
        />

        <label>Stock</label>
        <input
          type="number"
          required
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        {/* IMAGE UPLOADER */}
        <label>Product Images</label>

        <div
          className={`admin-add-product-upload-dropzone${
            uploading || saving
              ? " admin-add-product-upload-dropzone--disabled"
              : ""
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p>
            <strong>Drag & Drop images</strong> or click to browse
          </p>

          <input
            type="file"
            multiple
            className="admin-add-product-file-input"
            onChange={handleImageUpload}
            disabled={uploading || saving}
          />
        </div>

        {uploading && (
          <p className="admin-add-product-uploading-text">
            Uploading images...
          </p>
        )}

        <div className="admin-add-product-preview-images">
          {images.map((img) => (
            <div className="admin-add-product-preview-box" key={img}>
              <img src={img} alt="" />

              <button
                type="button"
                className="admin-add-product-remove-image"
                disabled={saving}
                onClick={() =>
                  setImages((prev) => prev.filter((i) => i !== img))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="admin-add-product-btn admin-add-product-btn--submit"
          disabled={uploading || saving || images.length === 0}
        >
          {saving ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
