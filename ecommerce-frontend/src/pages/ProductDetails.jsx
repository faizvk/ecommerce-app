import { useEffect, useMemo, useState, useCallback } from "react";
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
import { getProductRating, qualifiesForFreeDelivery } from "../utils/productMeta";
import { useWishlist } from "../hooks/useWishlist";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { fadeIn } from "../animations/fadeIn";
import ProductCard from "../components/ProductCard";
import {
  ShoppingCart, ChevronRight, ChevronLeft, Truck, RefreshCcw, ShieldCheck, Tag,
  Sparkles, Clock, Minus, Plus, Heart, Share2, Zap, Check, Info, Package,
  X, ZoomIn, MapPin, Star,
} from "lucide-react";

const TRUST_BADGES = [
  { icon: Truck, label: "Free Delivery", sub: "On orders above ₹499" },
  { icon: RefreshCcw, label: "Easy Returns", sub: "7-day return policy" },
  { icon: ShieldCheck, label: "Secure Payment", sub: "100% safe checkout" },
];

const TABS = [
  { key: "description", label: "Description", icon: Info },
  { key: "specs", label: "Specifications", icon: Package },
  { key: "shipping", label: "Shipping & Returns", icon: Truck },
];

function StarRow({ rating, size = 14 }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className="relative inline-flex items-center" aria-label={`${rating} out of 5`}>
      <div className="flex gap-0.5 text-gray-200">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentProduct: product, relatedProducts: related, loading } = useSelector((state) => state.product);
  const { activeOffers } = useSelector((state) => state.offer);
  const cartItems = useSelector((state) => state.cartItems.items);

  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { track: trackViewed, others: recentOthers } = useRecentlyViewed();

  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [lightbox, setLightbox] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const offerMap = useMemo(() => buildOfferMap(activeOffers), [activeOffers]);
  const pricing = product ? getOfferPricing(product, offerMap) : null;
  const { rating, reviews } = useMemo(() => product ? getProductRating(product) : { rating: 0, reviews: 0 }, [product]);

  const cartItem = useMemo(
    () => cartItems.find((it) => (it.productId?._id || it.productId) === product?._id),
    [cartItems, product?._id]
  );
  const cartQty = cartItem?.quantity || 0;

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    setActiveTab("description");
    setDeliveryInfo(null);
  }, [id]);

  useEffect(() => {
    dispatch(fetchProductByIdThunk(id));
    dispatch(fetchActiveOffersThunk());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, dispatch]);

  useEffect(() => {
    if (!product?.category) return;
    dispatch(fetchRelatedProductsThunk({ category: product.category, excludeId: product._id, limit: 6 }));
    trackViewed(product);
  }, [product, dispatch, trackViewed]);

  // Keyboard navigation for image gallery
  const images = product?.image || [];
  const navImage = useCallback((dir) => {
    if (!images.length) return;
    setActiveImage((i) => (i + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") navImage(-1);
      else if (e.key === "ArrowRight") navImage(1);
      else if (e.key === "Escape") setLightbox(false);
    };
    if (lightbox || images.length > 1) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [navImage, lightbox, images.length]);

  const handleAdd = async () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "user") return;
    setAdding(true);
    try {
      await dispatch(addToCartThunk({ productId: product._id, quantity })).unwrap();
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
      toast.success(`${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`);
    } catch {
      toast.error("Failed to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "user") return;
    setBuying(true);
    try {
      await dispatch(addToCartThunk({ productId: product._id, quantity })).unwrap();
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
      navigate("/checkout");
    } catch {
      toast.error("Couldn't proceed to checkout");
    } finally {
      setBuying(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on NexKart`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // user cancelled
    }
  };

  const handleWishlist = () => {
    const now = toggleWishlist(product._id);
    toast.success(now ? "Saved to wishlist" : "Removed from wishlist", { autoClose: 1200 });
  };

  const checkDelivery = () => {
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    // Mock: 2-5 day delivery based on pincode parity
    const days = 2 + (parseInt(trimmed[0]) % 4);
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDeliveryInfo({
      pincode: trimmed,
      days,
      date: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    });
  };

  const incQty = () => {
    if (!product) return;
    if (quantity >= product.stock) {
      toast.info(`Only ${product.stock} in stock`, { autoClose: 1500 });
      return;
    }
    setQuantity((q) => q + 1);
  };
  const decQty = () => setQuantity((q) => Math.max(1, q - 1));

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
  const wishlisted = isWishlisted(product._id);
  const freeDelivery = qualifiesForFreeDelivery(displayPrice);
  const recentlyViewedOthers = recentOthers(product._id);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8 pb-24 md:pb-8">
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

      {/* MAIN HERO LAYOUT */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-10 md:items-start">
        {/* LEFT — IMAGE GALLERY */}
        <div
          className="w-full md:w-[44%] flex flex-col gap-3"
          {...fadeIn({ direction: "right", distance: 40, duration: 0.7 })}
        >
          {/* Main image with prev/next */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square group">
            {discount > 0 && (
              <span className={`absolute top-4 left-4 z-10 text-white text-[0.72rem] font-bold px-3 py-1 rounded-full shadow-sm ${
                pricing.hasOffer
                  ? "bg-gradient-to-r from-brand to-[#7c3aed]"
                  : "bg-red-500"
              }`}>
                {pricing.hasOffer && "🎉 "}-{discount}% OFF
              </span>
            )}

            <button
              onClick={() => setLightbox(true)}
              aria-label="Zoom image"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-brand"
            >
              <ZoomIn size={15} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => navImage(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-brand"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => navImage(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-brand"
                >
                  <ChevronRight size={16} />
                </button>
                {/* Image counter */}
                <span className="absolute bottom-3 right-3 z-10 text-[0.7rem] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  {activeImage + 1} / {images.length}
                </span>
              </>
            )}

            <img
              src={images[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              onClick={() => setLightbox(true)}
              className="w-full h-full object-contain p-4 md:p-6 cursor-zoom-in transition-transform duration-300"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
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
          {/* Title block */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/search?category=${encodeURIComponent(product.category)}`}
              className="no-underline w-fit"
            >
              <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-brand bg-brand-light rounded-full px-2.5 py-1 capitalize hover:bg-brand hover:text-white transition-colors">
                <Tag size={10} />
                {product.category}
              </span>
            </Link>
            <h1 className="text-xl md:text-[1.75rem] font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[0.78rem] font-bold leading-none">
                {rating.toFixed(1)}
                <Star size={10} fill="currentColor" strokeWidth={0} />
              </div>
              <StarRow rating={rating} />
              <span className="text-[0.82rem] text-gray-500 font-medium">
                ({reviews} {reviews === 1 ? "review" : "reviews"})
              </span>
            </div>
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
                <span className="font-bold text-green-700">You save ₹{savings * quantity}</span>
              )}
            </div>
          </div>

          {/* STOCK + ALREADY IN CART */}
          <div className="flex flex-wrap items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-full px-3.5 py-1.5 text-[0.82rem] font-semibold">
                ✕ Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-3.5 py-1.5 text-[0.82rem] font-semibold">
                ⚡ Only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 rounded-full px-3.5 py-1.5 text-[0.82rem] font-semibold">
                <Check size={12} />
                In Stock
              </span>
            )}

            {cartQty > 0 && (
              <Link
                to="/cart"
                className="inline-flex items-center gap-1.5 text-brand bg-brand-light border border-brand/30 rounded-full px-3.5 py-1.5 text-[0.82rem] font-semibold no-underline hover:bg-brand hover:text-white transition-colors"
              >
                <ShoppingCart size={12} />
                {cartQty} already in cart →
              </Link>
            )}
          </div>

          {/* DELIVERY CHECK */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <MapPin size={14} className="text-brand" />
              <h3 className="text-[0.82rem] font-bold text-gray-700 uppercase tracking-wider">
                Check delivery
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && checkDelivery()}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[0.85rem] outline-none focus:border-brand transition-colors"
              />
              <button
                onClick={checkDelivery}
                className="px-4 py-2 bg-brand text-white rounded-xl text-[0.82rem] font-semibold border-0 cursor-pointer hover:bg-brand-dark transition-colors"
              >
                Check
              </button>
            </div>
            {deliveryInfo && (
              <div className="mt-3 flex items-center gap-2 text-[0.82rem]">
                <Truck size={13} className="text-green-600 flex-shrink-0" />
                <span className="text-gray-600">
                  Delivery to <span className="font-bold text-gray-800">{deliveryInfo.pincode}</span>:{" "}
                  <span className="font-bold text-green-600">{deliveryInfo.date}</span>
                  <span className="text-gray-400"> ({deliveryInfo.days} days)</span>
                </span>
              </div>
            )}
            {freeDelivery && !deliveryInfo && (
              <p className="mt-2 text-[0.78rem] text-green-600 font-semibold flex items-center gap-1">
                <Check size={11} /> Free delivery available on this item
              </p>
            )}
          </div>

          {/* QUANTITY */}
          {isUser && !isOutOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-[0.82rem] font-bold text-gray-500 uppercase tracking-wider">Quantity</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={decQty}
                  disabled={quantity <= 1 || adding}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="w-12 text-center font-extrabold text-gray-900 tabular-nums">{quantity}</span>
                <button
                  onClick={incQty}
                  disabled={quantity >= product.stock || adding}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
              {quantity > 1 && (
                <span className="text-[0.85rem] text-gray-500">
                  Subtotal: <span className="font-bold text-brand-dark">₹{displayPrice * quantity}</span>
                </span>
              )}
            </div>
          )}

          {/* ACTION BUTTONS */}
          {isUser && (
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  className="py-3.5 px-4 bg-brand-light text-brand border-2 border-brand rounded-xl text-[0.92rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isOutOfStock || adding}
                  onClick={handleAdd}
                >
                  <ShoppingCart size={17} />
                  {adding ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  className="py-3.5 px-4 bg-gradient-to-r from-brand to-[#7c3aed] text-white border-0 rounded-xl text-[0.92rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
                  disabled={isOutOfStock || buying}
                  onClick={handleBuyNow}
                >
                  <Zap size={17} />
                  {buying ? "..." : "Buy Now"}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-[0.85rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all border ${
                    wishlisted
                      ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                      : "bg-white text-gray-700 border-gray-200 hover:border-red-200 hover:text-red-500"
                  }`}
                >
                  <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                  {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl text-[0.85rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:border-brand/30 hover:text-brand"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </div>
            </div>
          )}

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <Icon size={16} className="text-brand" />
                <p className="text-[0.7rem] font-bold text-gray-700 leading-tight">{label}</p>
                <p className="text-[0.62rem] text-gray-400 leading-tight hidden sm:block">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="mt-12 md:mt-14">
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 md:px-5 py-3 text-[0.85rem] font-semibold border-0 cursor-pointer whitespace-nowrap transition-all relative bg-transparent ${
                activeTab === key
                  ? "text-brand"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 shadow-card p-5 md:p-6">
          {activeTab === "description" && (
            <div className="prose-sm">
              <p className="text-[0.92rem] text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || "No description available for this product."}
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[0.875rem]">
              {[
                ["Category", <span className="capitalize">{product.category}</span>],
                ["Product ID", <span className="font-mono">#{product._id.slice(-8).toUpperCase()}</span>],
                ["Availability", isOutOfStock ? "Out of Stock" : `${product.stock} units in stock`],
                ["MRP", `₹${product.costPrice || product.salePrice}`],
                ["Selling Price", `₹${displayPrice}`],
                ["Listed On", new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                ["Discount", discount > 0 ? `${discount}% off` : "—"],
                ["Free Delivery", freeDelivery ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <dt className="text-gray-500 font-medium">{label}</dt>
                  <dd className="text-gray-800 font-semibold text-right">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {activeTab === "shipping" && (
            <div className="flex flex-col gap-4 text-[0.88rem] text-gray-600 leading-relaxed">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                  <Truck size={16} className="text-brand" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-0.5">Delivery</p>
                  <p>Standard delivery in 2–5 business days. Free delivery on orders above ₹499. Express options available at checkout.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                  <RefreshCcw size={16} className="text-brand" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-0.5">Returns</p>
                  <p>7-day return policy. Items must be in original condition with tags and packaging. Refunds are processed within 3–5 business days after we receive your return.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} className="text-brand" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-0.5">Warranty & Support</p>
                  <p>Manufacturer warranty applies where applicable. Reach our support team 9am–6pm IST, Monday to Saturday.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECENTLY VIEWED */}
      {recentlyViewedOthers.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-brand-medium rounded-full" />
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-5">
            {recentlyViewedOthers.slice(0, 4).map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="mt-12 md:mt-14">
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

      {/* MOBILE STICKY BAR */}
      {isUser && !isOutOfStock && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className={`text-lg font-extrabold leading-none ${pricing.hasOffer ? "text-[#7c3aed]" : "text-brand"}`}>
                ₹{displayPrice * quantity}
              </span>
              {quantity > 1 && (
                <span className="text-[0.68rem] text-gray-400 mt-0.5">{quantity} × ₹{displayPrice}</span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex-1 py-3 bg-brand-light text-brand border border-brand/30 rounded-xl text-[0.85rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShoppingCart size={15} />
              Add
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buying}
              className="flex-1 py-3 bg-gradient-to-r from-brand to-[#7c3aed] text-white rounded-xl text-[0.85rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Zap size={15} />
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center"
            onClick={() => setLightbox(false)}
            aria-label="Close zoom"
          >
            <X size={20} />
          </button>

          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeImage]}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => navImage(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => navImage(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`rounded-full transition-all ${
                        i === activeImage ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
