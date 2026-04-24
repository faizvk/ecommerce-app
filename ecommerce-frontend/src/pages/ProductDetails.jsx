import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { ShoppingCart, ChevronRight } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentProduct: product, relatedProducts: related, loading } = useSelector((state) => state.product);

  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
    setActiveImage(0);
  }, [id, dispatch]);

  useEffect(() => {
    if (!product?.category) return;
    dispatch(fetchRelatedProductsThunk({ category: product.category, excludeId: product._id, limit: 6 }));
  }, [product, dispatch]);

  const handleAdd = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "user") return;
    setAdding(true);
    try {
      await dispatch(addToCartThunk({ productId: product._id })).unwrap();
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-12 h-12 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  const discount =
    product.costPrice && product.costPrice > 0
      ? Math.round(((product.costPrice - product.salePrice) / product.costPrice) * 100)
      : 0;

  const isOutOfStock = product.stock === 0;
  const isUser = user?.role === "user";

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 sm:px-4 sm:py-5">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-[0.8rem] text-gray-400 mb-6 flex-wrap">
        <Link to="/" className="hover:text-brand transition-colors no-underline text-gray-400">Home</Link>
        <ChevronRight size={14} />
        <Link
          to={`/search?category=${encodeURIComponent(product.category)}`}
          className="hover:text-brand transition-colors no-underline text-gray-400 capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* TOP SECTION */}
      <div className="flex gap-10 items-start lg:flex-col lg:gap-8">
        {/* LEFT — IMAGES */}
        <div
          className="flex flex-col gap-4 w-[44%] lg:w-full"
          {...fadeIn({ direction: "right", distance: 40, duration: 0.7 })}
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
              className="w-full h-full object-contain p-6 transition-all duration-300"
            />
          </div>

          {product.image?.length > 1 && (
            <div className="flex gap-2.5 flex-wrap">
              {product.image.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-transparent p-0 ${
                    activeImage === i ? "border-brand shadow-md" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div
          className="flex-1 flex flex-col gap-5"
          {...fadeIn({ direction: "left", distance: 40, duration: 0.7 })}
        >
          <div>
            <span className="text-[0.75rem] font-bold text-brand-medium uppercase tracking-wider capitalize">
              {product.category}
            </span>
            <h1 className="text-[1.8rem] font-extrabold text-gray-900 leading-snug mt-1 md:text-2xl sm:text-xl">
              {product.name}
            </h1>
          </div>

          {/* PRICE BOX */}
          <div className="flex flex-col gap-2 p-5 bg-brand-light rounded-2xl border border-brand/10">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-brand">₹{product.salePrice}</span>
              {product.costPrice && product.costPrice > product.salePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.costPrice}</span>
                  <span className="bg-red-100 text-red-600 text-[0.75rem] font-bold px-2.5 py-0.5 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[0.85rem] text-brand-dark font-medium">Inclusive of all taxes</p>
          </div>

          {/* STOCK */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-[0.85rem] font-semibold">
                ✕ Out of Stock
              </span>
            ) : product.stock <= 10 ? (
              <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-[0.85rem] font-semibold">
                ⚡ Only {product.stock} left!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-[0.85rem] font-semibold">
                ✔ In Stock
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <p className="text-[0.95rem] text-gray-600 leading-relaxed">{product.description}</p>

          {/* ADD TO CART */}
          {isUser && (
            <button
              className="py-4 px-6 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isOutOfStock || adding}
              onClick={handleAdd}
            >
              <ShoppingCart size={20} />
              {isOutOfStock ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="mt-16 sm:mt-10">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 sm:text-xl">
            More in <span className="capitalize">{product.category}</span>
          </h2>
          <div className="grid grid-cols-4 gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 sm:gap-3">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
