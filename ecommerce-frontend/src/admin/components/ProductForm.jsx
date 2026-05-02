import { useState } from "react";
import { uploadImage } from "../utils/uploadImage";
import { PRODUCT_CATEGORIES, FORM_INPUT_CLS, FORM_LABEL_CLS } from "../constants";
import { X, Upload, Loader2 } from "lucide-react";
import { notify } from "../../utils/notify";

const initialForm = {
  name: "",
  description: "",
  category: "electronics",
  costPrice: "",
  salePrice: "",
  stock: "",
};

export default function ProductForm({
  initialValues = initialForm,
  initialImages = [],
  submitLabel = "Save",
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState({ ...initialForm, ...initialValues });
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((file) => uploadImage(file).catch(() => null))
      );
      const successful = results.filter(Boolean);
      if (successful.length === 0) {
        notify.error("All image uploads failed");
      } else {
        setImages((prev) => [...prev, ...successful]);
        if (successful.length < files.length) {
          notify.warn(`${files.length - successful.length} image(s) failed to upload`);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.description.trim()) return "Description is required";
    if (form.costPrice === "" || Number(form.costPrice) < 0) return "Valid cost price required";
    if (form.salePrice === "" || Number(form.salePrice) < 0) return "Valid sale price required";
    if (Number(form.salePrice) < Number(form.costPrice)) return "Sale price cannot be less than cost price";
    if (form.stock === "" || Number(form.stock) < 0) return "Valid stock required";
    if (images.length === 0) return "At least one product image is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading || saving) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      notify.error(validationError);
      return;
    }
    setError("");
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      stock: Number(form.stock),
      image: images,
    };
    onSubmit(payload);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (uploading || saving) return;
    await handleImageUpload(e.dataTransfer.files);
  };

  const removeImage = (img) => setImages((prev) => prev.filter((i) => i !== img));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:flex-row md:items-start">
      {/* MAIN FORM */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-card flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-[0.85rem] font-medium text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={FORM_LABEL_CLS}>Product Name</label>
          <input
            className={FORM_INPUT_CLS}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Wireless Bluetooth Headphones"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FORM_LABEL_CLS}>Description</label>
          <textarea
            className={`${FORM_INPUT_CLS} resize-none min-h-[110px]`}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the product features, materials, etc."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Cost Price (₹)</label>
            <input
              type="number"
              min="0"
              className={FORM_INPUT_CLS}
              value={form.costPrice}
              onChange={(e) => update("costPrice", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Sale Price (₹)</label>
            <input
              type="number"
              min="0"
              className={FORM_INPUT_CLS}
              value={form.salePrice}
              onChange={(e) => update("salePrice", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Stock</label>
            <input
              type="number"
              min="0"
              className={FORM_INPUT_CLS}
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Category</label>
            <select
              className={FORM_INPUT_CLS}
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || saving || images.length === 0}
          className="self-start mt-2 py-3.5 px-8 bg-brand text-white border-0 rounded-xl font-semibold text-[0.92rem] cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>

      {/* IMAGES */}
      <div className="w-full md:w-72 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-card flex flex-col gap-3">
        <p className={FORM_LABEL_CLS}>Product Images <span className="text-gray-400 font-normal">({images.length})</span></p>

        {/* Dropzone */}
        <div
          className={`relative border-2 border-dashed rounded-xl px-4 py-6 text-center transition-all ${
            uploading || saving
              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              : "border-brand/40 bg-brand-light/40 cursor-pointer hover:border-brand hover:bg-brand-light"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 size={22} className="text-brand animate-spin" />
            ) : (
              <Upload size={22} className="text-brand" />
            )}
            <p className="text-[0.82rem] text-gray-600">
              <strong className="text-brand">{uploading ? "Uploading..." : "Drop images here"}</strong>
              <br />
              <span className="text-gray-400">or click to browse</span>
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => handleImageUpload(e.target.files)}
            disabled={uploading || saving}
          />
        </div>

        {/* Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={img + i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  disabled={saving}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full border-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={() => removeImage(img)}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
