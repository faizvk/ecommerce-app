import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProductByIdThunk,
  adminUpdateProductThunk,
} from "../redux/slice/productSlice";
import PageHeader from "./components/PageHeader";
import ProductForm from "./components/ProductForm";
import AdminLoader from "./components/AdminLoader";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct, loading } = useSelector((state) => state.product);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
  }, [id, dispatch]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await dispatch(adminUpdateProductThunk({ id, data: payload })).unwrap();
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentProduct) {
    return <AdminLoader />;
  }

  const initialValues = {
    name: currentProduct.name || "",
    description: currentProduct.description || "",
    category: currentProduct.category || "electronics",
    costPrice: currentProduct.costPrice ?? "",
    salePrice: currentProduct.salePrice ?? "",
    stock: currentProduct.stock ?? 0,
  };

  const initialImages = (currentProduct.image || []).filter((img) => img && img.length > 3);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edit Product"
        subtitle="Modify details and update product information"
      />
      <ProductForm
        key={currentProduct._id}
        initialValues={initialValues}
        initialImages={initialImages}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
