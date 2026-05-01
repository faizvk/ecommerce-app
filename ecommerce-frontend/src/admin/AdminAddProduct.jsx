import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminAddProductThunk } from "../redux/slice/productSlice";
import PageHeader from "./components/PageHeader";
import ProductForm from "./components/ProductForm";

export default function AdminAddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await dispatch(adminAddProductThunk(payload)).unwrap();
      toast.success("Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add New Product"
        subtitle="Create a new product listing for your store"
      />
      <ProductForm submitLabel="Add Product" onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
