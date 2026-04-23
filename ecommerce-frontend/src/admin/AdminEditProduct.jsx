import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductByIdThunk,
  adminUpdateProductThunk,
} from "../redux/slice/productSlice";
import { uploadImage } from "./utils/uploadImage";

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[0.9rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.12)]";
const labelCls = "text-[0.85rem] font-semibold text-gray-700";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct, loading, error } = useSelector((state) => state.product);

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
      [name]: numberFields.includes(name) ? (value === "" ? "" : Number(value)) : value,
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
    if (form.costPrice < 0 || form.salePrice < 0) return "Price cannot be negative";
    if (form.salePrice < form.costPrice) return "Sale price cannot be lower than cost price";
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
      if (imageFile) imageUrl = await uploadImage(imageFile);
      await dispatch(adminUpdateProductThunk({ id, data: { ...form, image: [imageUrl] } })).unwrap();
      navigate("/admin/products");
    } catch (err) {
      setLocalError(err || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <p className="text-center py-12 text-xl text-brand">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">Edit Product</h1>
        <p className="text-[0.875rem] text-gray-500 mt-1">Modify details and update product information</p>
      </div>

      {(localError || error) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-[0.875rem] font-medium text-red-600">{localError || error}</p>
        </div>
      )}

      <div className="flex gap-6 items-start lg:flex-col">
        {/* LEFT FORM */}
        <div className="flex-1 bg-white rounded-2xl border border-black/[0.06] p-6 shadow-card flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Name</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputCls} resize-none min-h-[100px]`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Cost Price</label>
              <input name="costPrice" type="number" value={form.costPrice} onChange={handleChange} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Sale Price</label>
              <input name="salePrice" type="number" value={form.salePrice} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Stock</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="dairy">Dairy</option>
              <option value="technology">Technology</option>
              <option value="home appliances">Home Appliances</option>
            </select>
          </div>
        </div>

        {/* IMAGE */}
        <div className="w-64 lg:w-full bg-white rounded-2xl border border-black/[0.06] p-6 shadow-card flex flex-col gap-4">
          <p className={labelCls}>Product Image</p>
          <div className="rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
            <img src={preview || "/placeholder.jpg"} alt="preview" className="w-full h-full object-contain p-2" />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={`${labelCls} text-brand cursor-pointer`}>Change Image</span>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>
      </div>

      <button
        className="self-start py-3.5 px-8 bg-brand text-white border-0 rounded-xl font-semibold cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={updateProduct}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
