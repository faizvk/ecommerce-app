import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Search, X, Upload, Check, Percent, IndianRupee } from "lucide-react";
import { fetchProductsThunk } from "../../redux/slice/productSlice";
import { uploadImage } from "../utils/uploadImage";
import { FORM_INPUT_CLS, FORM_LABEL_CLS } from "../constants";

// Format Date → "YYYY-MM-DDTHH:mm" for datetime-local input
const toLocalDatetime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function OfferForm({
  initialValues = {},
  submitLabel = "Create Offer",
  onSubmit,
  saving = false,
}) {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);

  const [form, setForm] = useState({
    title: initialValues.title || "",
    description: initialValues.description || "",
    discountType: initialValues.discountType || "percent",
    discountValue: initialValues.discountValue ?? "",
    endTime: initialValues.endTime ? toLocalDatetime(initialValues.endTime) : "",
    bannerImage: initialValues.bannerImage || "",
    active: initialValues.active !== false,
  });

  const [selectedIds, setSelectedIds] = useState(() => {
    const ids = (initialValues.productIds || []).map((p) =>
      typeof p === "string" ? p : p?._id
    ).filter(Boolean);
    return new Set(ids);
  });

  const [search, setSearch] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!products || products.length === 0) dispatch(fetchProductsThunk());
  }, [dispatch, products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggleProduct = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, bannerImage: url }));
      toast.success("Banner uploaded");
    } catch {
      toast.error("Banner upload failed");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.discountValue === "" || Number(form.discountValue) <= 0) return toast.error("Discount value must be positive");
    if (form.discountType === "percent" && Number(form.discountValue) > 100) return toast.error("Percent discount cannot exceed 100%");
    if (!form.endTime) return toast.error("End time is required");
    if (new Date(form.endTime) <= new Date()) return toast.error("End time must be in the future");
    if (selectedIds.size === 0) return toast.error("Select at least one product");

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      discountValue: Number(form.discountValue),
      endTime: new Date(form.endTime).toISOString(),
      productIds: Array.from(selectedIds),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:flex-row lg:items-start">
      {/* LEFT — DETAILS */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Offer details card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-card flex flex-col gap-4">
          <h2 className="text-[0.95rem] font-bold text-gray-900 pb-3 border-b border-gray-100">Offer Details</h2>

          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Title</label>
            <input
              className={FORM_INPUT_CLS}
              value={form.title}
              placeholder="e.g. Summer Mega Sale"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Description (optional)</label>
            <textarea
              className={`${FORM_INPUT_CLS} min-h-[80px] resize-none`}
              value={form.description}
              placeholder="Up to 50% off on selected products!"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={FORM_LABEL_CLS}>Discount Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, discountType: "percent" })}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-[0.85rem] font-semibold cursor-pointer transition-all ${
                    form.discountType === "percent"
                      ? "border-brand bg-brand-light text-brand"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Percent size={14} />
                  Percent
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, discountType: "fixed" })}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-[0.85rem] font-semibold cursor-pointer transition-all ${
                    form.discountType === "fixed"
                      ? "border-brand bg-brand-light text-brand"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <IndianRupee size={14} />
                  Fixed
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={FORM_LABEL_CLS}>
                Discount Value {form.discountType === "percent" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                min="0"
                max={form.discountType === "percent" ? 100 : undefined}
                className={FORM_INPUT_CLS}
                value={form.discountValue}
                placeholder={form.discountType === "percent" ? "e.g. 25" : "e.g. 500"}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FORM_LABEL_CLS}>Sale Ends</label>
            <input
              type="datetime-local"
              className={FORM_INPUT_CLS}
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
            <p className="text-[0.72rem] text-gray-400">Offer auto-expires at this time and products revert to normal pricing.</p>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-brand"
            />
            <div>
              <p className="text-[0.85rem] font-semibold text-gray-800">Offer is Active</p>
              <p className="text-[0.72rem] text-gray-400">Uncheck to pause without deleting</p>
            </div>
          </label>
        </div>

        {/* Banner upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-card flex flex-col gap-3">
          <h2 className="text-[0.95rem] font-bold text-gray-900">Banner Image (optional)</h2>

          {form.bannerImage ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[3/1]">
              <img src={form.bannerImage} alt="banner" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, bannerImage: "" })}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full border-0 cursor-pointer flex items-center justify-center hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="relative border-2 border-dashed border-brand/40 bg-brand-light/30 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-brand hover:bg-brand-light transition-all">
              <div className="flex flex-col items-center gap-2">
                <Upload size={20} className="text-brand" />
                <p className="text-[0.82rem] text-gray-600">
                  <strong className="text-brand">{uploadingBanner ? "Uploading..." : "Upload banner"}</strong>
                  <br />
                  <span className="text-gray-400 text-[0.72rem]">Used in offer banner background</span>
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || uploadingBanner}
          className="self-start py-3.5 px-8 bg-brand text-white border-0 rounded-xl font-semibold text-[0.92rem] cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>

      {/* RIGHT — PRODUCT PICKER */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[0.95rem] font-bold text-gray-900">Select Products</h2>
          <span className="text-[0.72rem] font-bold text-brand bg-brand-light px-2 py-0.5 rounded-full">
            {selectedIds.size} selected
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[0.85rem] outline-none focus:border-brand focus:bg-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedIds(new Set(filteredProducts.map((p) => p._id)))}
            className="flex-1 px-3 py-1.5 text-[0.78rem] font-semibold bg-brand-light text-brand rounded-lg border-0 cursor-pointer hover:bg-brand hover:text-white transition-all"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="flex-1 px-3 py-1.5 text-[0.78rem] font-semibold bg-gray-100 text-gray-600 rounded-lg border-0 cursor-pointer hover:bg-gray-200 transition-all"
          >
            Clear
          </button>
        </div>

        {/* Product list */}
        <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto -mx-1 px-1">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No products found</p>
          ) : (
            filteredProducts.map((p) => {
              const checked = selectedIds.has(p._id);
              return (
                <label
                  key={p._id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    checked ? "bg-brand-light border border-brand/30" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleProduct(p._id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                    checked ? "bg-brand" : "bg-white border border-gray-300"
                  }`}>
                    {checked && <Check size={13} className="text-white" />}
                  </div>
                  <img
                    src={p.image?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[0.7rem] text-gray-400">
                      ₹{p.salePrice} · <span className="capitalize">{p.category}</span>
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </form>
  );
}
