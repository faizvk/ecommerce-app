import { useEffect, useMemo, useState } from "react";
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
import { fetchActiveOffersThunk } from "../redux/slice/offerSlice";
import { buildOfferMap, getOfferPricing } from "../utils/applyOffer";
import { fadeIn } from "../animations/fadeIn";
import ProductCard from "../components/ProductCard";
import { ShoppingCart, ChevronRight, Truck, RefreshCcw, ShieldCheck, Tag, Sparkles, Clock } from "lucide-react";

const TRUST_BADGES = [
  { icon: Truck, label: "Free Delivery", sub: "On orders above ₹499" },
  { icon: RefreshCcw, label: "Easy Returns", sub: "7-day return policy" },
  { icon: ShieldCheck, label: "Secure Payment", sub: "100% safe checkout" },
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentProduct: product, relatedProducts: related, loading } = useSelector((state) => state.product);
  const { activeOffers } = useSelector((state) => state.offer);

  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  const offerMap = useMemo(() => buildOfferMap(activeOffers), [activeOffers]);
  const pricing = product ? getOfferPricing(product, offerMap) : null;

  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
    dispatch(fetchActiveOffersThunk());
    setActiveImage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, dispatch]);

  useEffect(() => {
    if (!product?.category) return;
    dispatch(fetchRelatedProductsThunk({ category: product.category, excludeId: product._id, limit: 6 }));
  }, [product, dispatch]);

  const handleAdd = async () => {
    if (!user) { navigate("/login"); return; }
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

  const baseDiscount =
    product.costPrice && product.costPrice > 0
      ? Math.round(((product.costPrice - product.salePrice) / product.costPrice) * 100)
      : 0;

  const discount = pricing.hasOffer ? pricing.percentOff : baseDiscount;

  const savings = pricing.hasOffer
    ? pricing.savings
    : (product.costPrice && product.costPrice > product.salePrice ? product.costPrice - product.salePrice : 0);

  const displayPrice = pricing.finalPrice;
  const displayOriginal = pricing.hasOffer ? pricing.originalPrice : product.costPrice;

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 10;
  const isUser = user?.role === "user";

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-[0.78rem] text-gray-400 mb-5 flex-wrap">
        <Link to="/" className="hover:text-brand transition-colors no-underline text-gray-400">Home</Link>
        <ChevronRight size={13} />
        <Link
          to={`/search?category=${encodeURIComponent(product.category)}`}
          className="hover:text-brand transition-colors no-underline text-gray-400 capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-600 truncate max-w-[180px] md:max-w-[300px]">{product.name}</span>
      </nav>

      {/* MAIN LAYOUT — stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-10 md:items-start">
        {/* LEFT — IMAGES */}
        <div
          className="w-full md:w-[44%] flex flex-col gap-3"
          {...fadeIn({ direction: "right", distance: 40, duration: 0.7 })}
        >
          {/* Main image */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square">
            {discount > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[0.72rem] font-bold px-3 py-1 rounded-full shadow-sm">
                -{discount}% OFF
              </span>
            )}
            <img
              src={product.image?.[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-contain p-4 md:p-6 transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {product.image?.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.image.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-transparent p-0 ${
                    activeImage === i ? "border-brand shadow-md" : "border-gray-200 hover:border-gray-300"
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
          {/* Category + Name */}
          <div>
            <Link
              to={`/search?category=${encodeURIComponent(product.category)}`}
              className="no-underline"
            >
              <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-brand bg-brand-light rounded-full px-2.5 py-1 capitalize hover:bg-brand hover:text-white transition-colors">
                <Tag size={10} />
                {product.category}
              </span>
            </Link>
            <h1 className="text-xl md:text-[1.75rem] font-extrabold text-gray-900 leading-snug mt-2">
              {product.name}
            </h1>
          </div>

          {/* PRICE */}
          <div className={`p-4 md:p-5 rounded-2xl border ${
            pricing.hasOffer
              ? "bg-gradient-to-br from-brand-light to-[#f5f0ff] border-brand/30"
              : "bg-brand-light border-brand/10"
          }`}>
            {pricing.hasOffer && (
              <div className="flex items-center gap-1.5 mb-2 text-[0.7rem] font-extrabold tracking-wider uppercase text-[#7c3aed]">
                <Sparkles size={11} />
                {pricing.offer.title}
                {pricing.offer.endTime && (
                  <span className="ml-auto inline-flex items-center gap-1 text-gray-500 normal-case font-semibold">
                    <Clock size={10} />
                    Ends {new Date(pricing.offer.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-3 flex-wrap mb-1">
              <span className={`text-2xl md:text-3xl font-extrabold ${pricing.hasOffer ? "text-[#7c3aed]" : "text-brand"}`}>
                ₹{displayPrice}
              </span>
              {displayOriginal && displayOriginal > displayPrice && (
                <>
                  <span className="text-base md:text-lg text-gray-400 line-through">₹{displayOriginal}</span>
                  <span className="bg-red-100 text-red-600 text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-[0.82rem] text-brand-dark">
              <span>Inclusive of all taxes</span>
              {savings > 0 && (
                <span className="font-bold text-green-700">You save ₹{savings}</span>
              )}
            </div>
          </div>

          {/* STOCK STATUS */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-[0.82rem] font-semibold">
                ✕ Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-[0.82rem] font-semibold">
                ⚡ Only {product.stock} left — order soon!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-[0.82rem] font-semibold">
                ✔ In Stock & Ready to Ship
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          {product.description && (
            <div>
              <h3 className="text-[0.82rem] font-bold text-gray-500 uppercase tracking-wider mb-2">About this product</h3>
              <p className="text-[0.92rem] text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* ADD TO CART */}
          {isUser && (
            <button
              className="py-3.5 px-6 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
              disabled={isOutOfStock || adding}
              onClick={handleAdd}
            >
              <ShoppingCart size={20} />
              {isOutOfStock ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </button>
          )}

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <Icon size={16} className="text-brand" />
                <p className="text-[0.72rem] font-bold text-gray-700 leading-tight">{label}</p>
                <p className="text-[0.65rem] text-gray-400 leading-tight hidden sm:block">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="mt-12 md:mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-brand rounded-full" />
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900">
              More in <span className="capitalize text-brand">{product.category}</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-5">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
