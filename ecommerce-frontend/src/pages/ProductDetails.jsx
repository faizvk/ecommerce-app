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
  X, ZoomIn, MapPin, Star, BadgeCheck, Award, Settings, IndianRupee,
  Boxes, Headphones, ChevronDown, FileText,
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
    const now = toggleWishlist(product);
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
    <div className="max-w-[1200px] mx-auto px-3 py-4 md:px-5 md:py-6 pb-24 md:pb-6">
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
      <div className="flex flex-col gap-5 md:flex-row md:gap-7 md:items-start">
        {/* LEFT — IMAGE GALLERY */}
        <div
          className="w-full md:w-[46%] md:sticky md:top-20"
          {...fadeIn({ direction: "right", distance: 40, duration: 0.7 })}
        >
          <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-3">
            {/* THUMBNAIL STRIP — vertical on desktop, horizontal on mobile */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2 md:gap-2.5 overflow-x-auto md:overflow-y-auto scrollbar-hide md:max-h-[460px] md:w-[68px] flex-shrink-0">
                {images.map((img, i) => {
                  const active = activeImage === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden cursor-pointer bg-white p-0 transition-all flex-shrink-0 ${
                        active
                          ? "ring-2 ring-brand ring-offset-2 ring-offset-white shadow-[0_4px_14px_rgba(79,70,229,0.25)] scale-105"
                          : "ring-1 ring-gray-200 opacity-70 hover:opacity-100 hover:ring-brand/40 hover:scale-105"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* MAIN IMAGE — premium presentation */}
            <div className="relative flex-1 group">
              {/* Soft drop shadow that "floats" the image */}
              <div className="absolute inset-x-6 bottom-0 h-8 bg-black/15 blur-2xl rounded-full -z-10" />

              <div className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-gray-100">

                {/* Top-left badge stack */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className={`inline-flex items-center gap-1 text-white text-[0.72rem] font-extrabold px-3 py-1.5 rounded-full shadow-md ${
                      pricing.hasOffer
                        ? "bg-gradient-to-r from-brand to-[#7c3aed]"
                        : "bg-red-500"
                    }`}>
                      {pricing.hasOffer && <Sparkles size={11} />}
                      -{discount}% OFF
                    </span>
                  )}
                  {pricing.hasOffer && (
                    <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#7c3aed] text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#7c3aed]/20 shadow-sm">
                      Limited Sale
                    </span>
                  )}
                </div>

                {/* Top-right zoom button (glass) */}
                <button
                  onClick={() => setLightbox(true)}
                  aria-label="Zoom image"
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-gray-700 flex items-center justify-center cursor-pointer transition-all hover:bg-white hover:text-brand hover:scale-110 shadow-md"
                >
                  <ZoomIn size={15} />
                </button>

                {/* Crossfade image stack — fills entire frame */}
                {images.length === 0 ? (
                  <img src="/placeholder.jpg" alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={i === activeImage ? product.name : ""}
                      onClick={() => i === activeImage && setLightbox(true)}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
                        i === activeImage
                          ? "opacity-100 cursor-zoom-in"
                          : "opacity-0 pointer-events-none"
                      }`}
                    />
                  ))
                )}

                {/* Prev/Next nav (visible at low opacity, full on hover) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => navImage(-1)}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-gray-700 flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 hover:bg-white hover:text-brand hover:scale-110 shadow-md"
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <button
                      onClick={() => navImage(1)}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-gray-700 flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 hover:bg-white hover:text-brand hover:scale-110 shadow-md"
                    >
                      <ChevronRight size={17} />
                    </button>

                    {/* Bottom controls — counter + dot pagination */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-full px-3 py-1.5 shadow-md">
                      <span className="text-[0.7rem] font-bold text-gray-700 tabular-nums">
                        {String(activeImage + 1).padStart(2, "0")}
                        <span className="text-gray-400 mx-0.5">/</span>
                        {String(images.length).padStart(2, "0")}
                      </span>
                      <span className="w-px h-3 bg-gray-300" />
                      <div className="flex gap-1">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            aria-label={`Go to image ${i + 1}`}
                            className={`rounded-full transition-all ${
                              i === activeImage ? "w-4 h-1.5 bg-brand" : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
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

          {/* SHIPPING URGENCY + SOCIAL PROOF */}
          {!isOutOfStock && (
            <div className="flex flex-wrap items-center gap-2 text-[0.82rem]">
              {(() => {
                const now = new Date();
                const cutoff = new Date();
                cutoff.setHours(20, 0, 0, 0); // 8 PM cutoff
                const diff = cutoff - now;
                if (diff > 0) {
                  const hours = Math.floor(diff / 3600000);
                  const minutes = Math.floor((diff % 3600000) / 60000);
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const dateLabel = tomorrow.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full font-semibold">
                      <Clock size={12} />
                      Order in {hours}h {minutes}m for delivery by {dateLabel}
                    </span>
                  );
                }
                return null;
              })()}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full font-semibold">
                <Sparkles size={11} />
                {Math.max(8, Math.min(380, Math.round(reviews * 0.6)))} bought this week
              </span>
            </div>
          )}

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
        {/* Tab nav — pill style */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[0.85rem] font-semibold rounded-full border cursor-pointer whitespace-nowrap transition-all ${
                  active
                    ? "bg-brand text-white border-brand shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand/40 hover:text-brand"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ───── DESCRIPTION TAB ───── */}
        {activeTab === "description" && (() => {
          const raw = (product.description || "").trim();
          if (!raw) {
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
                <p className="text-gray-400 text-sm">No description provided for this product yet.</p>
              </div>
            );
          }

          // Split into paragraphs and detect bullet lines (-, •, *)
          const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
          const blocks = [];
          let bullets = [];
          const flushBullets = () => {
            if (bullets.length) {
              blocks.push({ type: "list", items: bullets });
              bullets = [];
            }
          };
          for (const line of lines) {
            const m = line.match(/^[-•*]\s+(.+)$/);
            if (m) bullets.push(m[1]);
            else { flushBullets(); blocks.push({ type: "p", text: line }); }
          }
          flushBullets();

          const firstParagraphIdx = blocks.findIndex((b) => b.type === "p");

          return (
            <article className="max-w-[680px] text-gray-700">
              {blocks.map((b, i) => {
                if (b.type === "list") {
                  return (
                    <ul key={i} className="my-5 flex flex-col gap-2.5">
                      {b.items.map((item, j) => (
                        <li key={j} className="flex gap-3 items-start text-[0.95rem] leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                const isLead = i === firstParagraphIdx;
                return (
                  <p
                    key={i}
                    className={
                      isLead
                        ? "text-[1rem] md:text-[1.05rem] leading-relaxed text-gray-800"
                        : "text-[0.95rem] leading-relaxed mt-4"
                    }
                  >
                    {b.text}
                  </p>
                );
              })}
            </article>
          );
        })()}

        {/* ───── SPECIFICATIONS TAB ───── */}
        {activeTab === "specs" && (
          <div className="flex flex-col gap-4">
            {/* NexKart verified header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-[#7c3aed] text-white shadow-[0_8px_30px_rgba(79,70,229,0.25)]">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-white/5 blur-2xl" />
              <div className="relative flex items-center gap-3 p-4 md:p-5">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <BadgeCheck size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70">NexKart Verified</p>
                  <p className="text-[0.95rem] md:text-[1rem] font-extrabold leading-tight">
                    Product Specifications
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider bg-white/15 border border-white/25 px-2.5 py-1 rounded-full">
                  <Sparkles size={10} />
                  Authentic
                </span>
              </div>
            </div>

            {/* 2-col spec grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  title: "General",
                  icon: Settings,
                  accent: "from-brand to-brand-medium",
                  rows: [
                    ["Product Name", <span className="line-clamp-1">{product.name}</span>],
                    ["Category", <span className="capitalize">{product.category}</span>],
                    ["Product ID", <span className="font-mono text-[0.8rem] text-brand-dark">#{product._id.slice(-8).toUpperCase()}</span>],
                    ["Brand", <span className="inline-flex items-center gap-1 text-brand"><BadgeCheck size={11} className="text-brand" />NexKart</span>],
                  ],
                },
                {
                  title: "Pricing",
                  icon: IndianRupee,
                  accent: "from-[#7c3aed] to-brand",
                  rows: [
                    ["MRP", <span className="text-gray-400 line-through">₹{product.costPrice || product.salePrice}</span>],
                    ["Selling Price", <span className="text-brand font-extrabold text-base">₹{displayPrice}</span>],
                    ["Discount", discount > 0 ? <span className="text-green-600 font-bold">{discount}% off</span> : <span className="text-gray-400">—</span>],
                    ["You Save", savings > 0 ? <span className="text-green-600 font-bold">₹{savings}</span> : <span className="text-gray-400">—</span>],
                  ],
                },
                {
                  title: "Availability",
                  icon: Boxes,
                  accent: "from-brand-medium to-[#7c3aed]",
                  rows: [
                    ["Status", isOutOfStock
                      ? <span className="inline-flex items-center gap-1 text-red-600 font-bold"><X size={11} />Out of Stock</span>
                      : <span className="inline-flex items-center gap-1 text-green-600 font-bold"><Check size={11} />In Stock</span>],
                    ["Stock Level", isOutOfStock ? "0" : <span className="text-brand-dark font-bold">{product.stock} units</span>],
                    ["Listed On", new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                  ],
                },
                {
                  title: "Shipping",
                  icon: Truck,
                  accent: "from-brand to-[#7c3aed]",
                  rows: [
                    ["Free Delivery", freeDelivery
                      ? <span className="text-green-600 font-bold">Yes — included</span>
                      : <span className="text-gray-500">Add ₹{499 - displayPrice} more</span>],
                    ["Estimated Delivery", "2–5 business days"],
                    ["Return Window", <span className="text-brand-dark font-bold">7 days</span>],
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:border-brand/20 transition-colors">
                  {/* Gradient accent strip */}
                  <div className={`h-1 bg-gradient-to-r ${section.accent}`} />
                  {/* Section header */}
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
                      <section.icon size={14} className="text-brand" />
                    </div>
                    <h3 className="text-[0.85rem] font-extrabold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  {/* Rows */}
                  <dl className="px-5 py-1">
                    {section.rows.map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
                        <dt className="text-[0.82rem] text-gray-500">{label}</dt>
                        <dd className="text-[0.86rem] text-gray-800 font-semibold text-right break-words max-w-[60%]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            {/* Footer trust note */}
            <div className="flex items-center gap-2 px-1 text-[0.78rem] text-gray-500">
              <ShieldCheck size={13} className="text-brand flex-shrink-0" />
              <span>Specifications verified by NexKart. Information may vary slightly from product packaging.</span>
            </div>
          </div>
        )}

        {/* ───── SHIPPING & RETURNS TAB ───── */}
        {activeTab === "shipping" && (
          <div className="flex flex-col gap-5">
            {/* Delivery options */}
            <div>
              <h3 className="text-[0.8rem] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Truck size={13} />
                Delivery Options
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: "Standard",
                    price: freeDelivery ? "FREE" : "₹49",
                    sub: "2–5 business days",
                    accent: freeDelivery ? "from-green-500/10 to-green-500/5 border-green-200" : "from-gray-100 to-white border-gray-200",
                    label: freeDelivery ? "Recommended" : null,
                    labelCls: "bg-green-500",
                  },
                  {
                    name: "Express",
                    price: "₹99",
                    sub: "1–2 business days",
                    accent: "from-brand-light to-white border-brand/20",
                    label: "Fastest",
                    labelCls: "bg-brand",
                  },
                  {
                    name: "Same Day",
                    price: "₹199",
                    sub: "Order before 12 PM",
                    accent: "from-amber-100/50 to-white border-amber-200",
                    label: "Select cities",
                    labelCls: "bg-amber-500",
                  },
                ].map((opt) => (
                  <div key={opt.name} className={`relative bg-gradient-to-br rounded-2xl border p-4 ${opt.accent}`}>
                    {opt.label && (
                      <span className={`absolute -top-2 left-4 text-white text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${opt.labelCls}`}>
                        {opt.label}
                      </span>
                    )}
                    <p className="text-[0.78rem] font-bold text-gray-500 uppercase tracking-wider">{opt.name}</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{opt.price}</p>
                    <p className="text-[0.78rem] text-gray-500 mt-0.5">{opt.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[0.78rem] text-gray-400 mt-3 flex items-center gap-1.5">
                <Info size={11} />
                Final delivery options shown at checkout based on your pincode.
              </p>
            </div>

            {/* Return policy timeline */}
            <div>
              <h3 className="text-[0.8rem] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <RefreshCcw size={13} />
                Return Process
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                <div className="flex flex-col">
                  {[
                    { step: 1, title: "Request a return", desc: "Within 7 days of delivery from your Orders page." },
                    { step: 2, title: "Pickup scheduled", desc: "We'll arrange a free pickup from your address in 1–2 days." },
                    { step: 3, title: "Quality check", desc: "Item is inspected at our warehouse to confirm condition." },
                    { step: 4, title: "Refund issued", desc: "Refund credited within 3–5 business days to original payment method." },
                  ].map((s, i, arr) => (
                    <div key={s.step} className="flex gap-4 relative">
                      {/* Connector line */}
                      {i < arr.length - 1 && (
                        <span className="absolute left-[14px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-brand to-brand/20" />
                      )}
                      <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0 z-10 shadow-md">
                        {s.step}
                      </div>
                      <div className="pb-5 last:pb-0 flex-1">
                        <p className="text-[0.92rem] font-bold text-gray-900">{s.title}</p>
                        <p className="text-[0.82rem] text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warranty + Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <ShieldCheck size={17} className="text-blue-600" />
                </div>
                <p className="text-[0.92rem] font-bold text-gray-900">Warranty</p>
                <p className="text-[0.82rem] text-gray-500 mt-1 leading-relaxed">
                  Manufacturer warranty applies where applicable. See product packaging for details and proof of purchase requirements.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mb-3">
                  <Headphones size={17} className="text-brand" />
                </div>
                <p className="text-[0.92rem] font-bold text-gray-900">24/7 Customer Support</p>
                <p className="text-[0.82rem] text-gray-500 mt-1 leading-relaxed">
                  Reach us at <a href="mailto:support@nexkart.com" className="text-brand font-semibold no-underline hover:underline">support@nexkart.com</a> or call +91-9876543210, Mon–Sat 9am–6pm IST.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-[0.8rem] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info size={13} />
                Frequently Asked
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-100 overflow-hidden">
                {[
                  {
                    q: "How can I track my order?",
                    a: "Visit your Orders page and click 'Track Order' on any active order to see real-time status updates.",
                  },
                  {
                    q: "Can I cancel after placing the order?",
                    a: "Yes — orders can be cancelled while they're in Pending or Processing status, directly from your Orders page.",
                  },
                  {
                    q: "What if I receive a damaged item?",
                    a: "Contact our support team within 48 hours of delivery. We'll arrange an immediate pickup and replacement at no extra cost.",
                  },
                ].map((item, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none hover:bg-gray-50/60 transition-colors">
                      <span className="text-[0.88rem] font-semibold text-gray-800">{item.q}</span>
                      <ChevronDown size={15} className="text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                    </summary>
                    <p className="px-5 pb-4 text-[0.84rem] text-gray-500 leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
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
