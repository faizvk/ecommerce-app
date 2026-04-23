import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchProductByIdThunk,
  fetchRelatedProductsThunk,
} from "../redux/slice/productSlice";
import { addToCartThunk, fetchCartThunk } from "../redux/slice/cartItemsSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { fadeIn } from "../animations/fadeIn";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentProduct: product, relatedProducts: related, loading } = useSelector((state) => state.product);

  const [activeImage, setActiveImage] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!product?.category) return;
    dispatch(fetchRelatedProductsThunk({ category: product.category, excludeId: product._id, limit: 6 }));
  }, [product, dispatch]);

  const handleAdd = async () => {
    if (!user) {
      alert("Please login to add to cart.");
      navigate("/login");
      return;
    }
    if (user.role !== "user") {
      alert("Only customers can add items to cart.");
      return;
    }
    try {
      await dispatch(addToCartThunk({ productId: product._id })).unwrap();
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
      setMsg("Added to cart!");
      toast.success("Added to cart!");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("Failed to add to cart.");
      setTimeout(() => setMsg(""), 2000);
    }
  };

  if (loading || !product) {
    return <p className="text-center py-12 text-xl text-brand">Loading...</p>;
  }

  const discount =
    product.costPrice && product.costPrice > 0
      ? Math.round(((product.costPrice - product.salePrice) / product.costPrice) * 100)
      : 0;

  const isOutOfStock = product.stock === 0;
  const isUser = user?.role === "user";

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      {/* TOP SECTION */}
      <div className="flex gap-10 items-start lg:flex-col lg:gap-6">
        {/* LEFT — IMAGES */}
        <div
          className="flex flex-col gap-4 w-[45%] lg:w-full"
          {...fadeIn({ direction: "right", distance: 80, duration: 0.9 })}
        >
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-black/[0.06] aspect-square">
            {discount > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[0.75rem] font-bold px-3 py-1 rounded-full">
                -{discount}%
              </span>
            )}
            <img
              src={product.image?.[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          </div>

          {product.image?.length > 1 && (
            <div className="flex gap-2.5 flex-wrap">
              {product.image.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                    activeImage === i ? "border-brand shadow-md" : "border-transparent hover:border-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div
          className="flex-1 flex flex-col gap-5"
          {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
        >
          <h1 className="text-[1.9rem] font-extrabold text-gray-900 leading-snug md:text-2xl sm:text-xl">
            {product.name}
          </h1>

          <div className="flex flex-col gap-2 p-4 bg-brand-light rounded-xl">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-brand">₹{product.salePrice}</span>
              {product.costPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.costPrice}</span>
                  <span className="bg-red-100 text-red-600 text-[0.8rem] font-bold px-2.5 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[0.875rem] text-brand-dark font-medium">🔥 Special Offer – Limited Stock!</p>
          </div>

          <div>
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 rounded-full px-3.5 py-1.5 text-[0.85rem] font-semibold">
                ✔ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-full px-3.5 py-1.5 text-[0.85rem] font-semibold">
                ✕ Out of Stock
              </span>
            )}
          </div>

          <p className="text-[0.95rem] text-gray-600 leading-relaxed">{product.description}</p>

          {isUser && (
            <button
              className="py-4 px-6 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isOutOfStock}
              onClick={handleAdd}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}

          {msg && (
            <p className="text-[0.85rem] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              {msg}
            </p>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="mt-16 sm:mt-10">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 sm:text-xl">
            Related Products in "{product.category}"
          </h2>
          <div className="grid grid-cols-4 gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3.5">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
