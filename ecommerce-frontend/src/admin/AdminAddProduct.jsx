import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminAddProductThunk } from "../redux/slice/productSlice";
import { uploadImage } from "./utils/uploadImage";

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[0.9rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)]";
const labelCls = "text-[0.85rem] font-semibold text-gray-700";

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
      setForm({ name: "", description: "", category: "electronics", costPrice: "", salePrice: "", stock: "" });
      setImages([]);
      alert("Product added successfully!");
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

  const fields = [
    { label: "Name", key: "name", type: "text" },
    { label: "Cost Price", key: "costPrice", type: "number" },
    { label: "Sale Price", key: "salePrice", type: "number" },
    { label: "Stock", key: "stock", type: "number" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[700px]">
      <h1 className="text-2xl font-extrabold text-brand-dark">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-card flex flex-col gap-5">
        {fields.map(({ label, key, type }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className={labelCls}>{label}</label>
            <input
              type={type}
              required
              className={inputCls}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Description</label>
          <textarea
            required
            className={`${inputCls} resize-none min-h-[100px]`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Category</label>
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="dairy">Dairy</option>
            <option value="technology">Technology</option>
            <option value="home appliances">Home Appliances</option>
          </select>
        </div>

        {/* IMAGE UPLOADER */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Product Images</label>
          <div
            className={`relative border-2 border-dashed rounded-xl px-6 py-8 text-center transition-all ${
              uploading || saving
                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                : "border-brand/40 bg-brand-light/50 cursor-pointer hover:border-brand hover:bg-brand-light"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="text-[0.9rem] text-gray-600">
              <strong className="text-brand">Drag & Drop images</strong> or click to browse
            </p>
            <input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
              disabled={uploading || saving}
            />
          </div>
          {uploading && <p className="text-[0.8rem] text-brand animate-pulse">Uploading images...</p>}
        </div>

        {/* IMAGE PREVIEWS */}
        {images.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {images.map((img) => (
              <div key={img} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  disabled={saving}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[0.65rem] font-bold border-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={() => setImages((prev) => prev.filter((i) => i !== img))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="mt-2 py-4 bg-brand text-white border-0 rounded-xl font-semibold text-[0.95rem] cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading || saving || images.length === 0}
        >
          {saving ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
