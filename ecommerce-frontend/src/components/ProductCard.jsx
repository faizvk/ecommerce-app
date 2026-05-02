import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fadeIn } from "../animations/fadeIn";
import {
  addToCartThunk,
  increaseQtyThunk,
  decreaseQtyThunk,
  removeFromCartThunk,
} from "../redux/slice/cartItemsSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { ShoppingCart, Sparkles, Heart, Star, Truck, Eye, Minus, Plus } from "lucide-react";
import { buildOfferMap, getOfferPricing } from "../utils/applyOffer";
import { getProductRating, qualifiesForFreeDelivery, getProductBadge } from "../utils/productMeta";
import { useWishlist } from "../hooks/useWishlist";

function StarRow({ rating }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className="relative inline-flex items-center" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex gap-0.5 text-gray-200">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeOffers } = useSelector((state) => state.offer);
  const cartItems = useSelector((state) => state.cartItems.items);

  const offerMap = useMemo(() => buildOfferMap(activeOffers), [activeOffers]);
  const { hasOffer, finalPrice, originalPrice, percentOff } = getOfferPricing(product, offerMap);
  const { rating, reviews } = useMemo(() => getProductRating(product), [product]);
  const promoBadge = useMemo(() => getProductBadge(product), [product]);
  const { isWishlisted, toggle } = useWishlist();

  const [busy, setBusy] = useState(false);

  // Find current quantity of this product in cart
  const cartItem = useMemo(
    () => cartItems.find((it) => (it.productId?._id || it.productId) === product._id),
    [cartItems, product._id]
  );
  const cartQty = cartItem?.quantity || 0;

  const baseDiscount =
    product.costPrice && product.costPrice > 0
      ? Math.round(((product.costPrice - product.salePrice) / product.costPrice) * 100)
      : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const atStockCap = cartQty >= product.stock;
  const freeDelivery = qualifiesForFreeDelivery(finalPrice);
  const wishlisted = isWishlisted(product._id);

  // Border shade priority — gives every card a tinted border that signals its state
  // Out of stock (gray) > Offer (brand→violet) > In cart (emerald) > Low stock (amber) > Default (soft indigo)
  const cardBorderCls = isOutOfStock
    ? "border-gray-200 hover:border-gray-300"
    : hasOffer
    ? "border-brand/30 hover:border-brand/50 hover:shadow-[0_12px_32px_rgba(124,58,237,0.15)]"
    : cartQty > 0
    ? "border-emerald-300/50 hover:border-emerald-400/70 hover:shadow-[0_12px_32px_rgba(16,185,129,0.12)]"
    : isLowStock
    ? "border-amber-300/50 hover:border-amber-400/70 hover:shadow-[0_12px_32px_rgba(251,191,36,0.12)]"
    : "border-brand-medium/25 hover:border-brand/40 hover:shadow-hover";

  // Cart action helpers
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  const handleAdd = async (e) => {
    stop(e);
    if (!user) return navigate("/login");
    if (user.role !== "user") return;
    setBusy(true);
    try {
      await dispatch(addToCartThunk({ productId: product._id, quantity: 1 })).unwrap();
      dispatch(refreshCartCountThunk());
      toast.success("Added to cart!", { autoClose: 1200 });
    } catch {
      toast.error("Couldn't add to cart");
    } finally {
      setBusy(false);
    }
  };

  const handleInc = async (e) => {
    stop(e);
    if (atStockCap) {
      toast.info(`Only ${product.stock} in stock`, { autoClose: 1500 });
      return;
    }
    setBusy(true);
    try {
      await dispatch(increaseQtyThunk(product._id)).unwrap();
      dispatch(refreshCartCountThunk());
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDec = async (e) => {
    stop(e);
    setBusy(true);
    try {
      if (cartQty <= 1) {
        await dispatch(removeFromCartThunk(product._id)).unwrap();
        toast.success("Removed from cart", { autoClose: 1200 });
      } else {
        await dispatch(decreaseQtyThunk(product._id)).unwrap();
      }
      dispatch(refreshCartCountThunk());
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleWishlist = (e) => {
    stop(e);
    const nowWishlisted = toggle(product);
    toast.success(nowWishlisted ? "Saved to wishlist" : "Removed from wishlist", { autoClose: 1200 });
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="no-underline block group h-full"
      {...fadeIn({ direction: "up", distance: 50, duration: 0.6 })}
    >
      <div className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 h-full flex flex-col hover:-translate-y-1 ${cardBorderCls}`}>
        {/* IMAGE */}
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          {/* Top-left badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
            {hasOffer ? (
              <span className="bg-gradient-to-r from-brand to-[#7c3aed] text-white text-[0.65rem] font-extrabold px-2 py-0.5 rounded-md leading-none flex items-center gap-1 shadow-md">
                <Sparkles size={9} />
                SALE -{percentOff}%
              </span>
            ) : (
              baseDiscount > 0 && (
                <span className="bg-red-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-md leading-none">
                  -{baseDiscount}%
                </span>
              )
            )}
            {!hasOffer && promoBadge && (
              <span className={`text-[0.62rem] font-bold px-2 py-0.5 rounded-md leading-none flex items-center gap-1 shadow-sm ${promoBadge.cls}`}>
                <span className="leading-none">{promoBadge.emoji}</span>
                {promoBadge.label}
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white text-[0.62rem] font-bold px-2 py-0.5 rounded-md leading-none">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border cursor-pointer ${
              wishlisted
                ? "bg-red-500 border-red-500 text-white shadow-md scale-105"
                : "bg-white/90 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
            }`}
          >
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Hover hint */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-2 py-2 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pointer-events-none">
            <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-white">
              <Eye size={12} />
              View Details
            </span>
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center">
              <span className="bg-gray-700 text-white text-[0.75rem] font-bold px-3 py-1.5 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* In-cart badge */}
          {cartQty > 0 && (
            <span className="absolute top-2.5 right-12 z-10 bg-green-500 text-white text-[0.62rem] font-bold px-2 py-0.5 rounded-md leading-none shadow-md">
              {cartQty} in cart
            </span>
          )}

          <img
            src={product.image?.[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* INFO */}
        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <span className="text-[0.66rem] font-bold text-brand-medium uppercase tracking-wider mb-1 capitalize">
            {product.category}
          </span>

          <h3 className="text-[0.88rem] md:text-[0.92rem] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          {/* RATING */}
          <div className="flex items-center gap-1.5 mb-auto">
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md text-[0.7rem] font-bold leading-none">
              {rating.toFixed(1)}
              <Star size={9} fill="currentColor" strokeWidth={0} />
            </div>
            <StarRow rating={rating} />
            <span className="text-[0.7rem] text-gray-400 font-medium">({reviews})</span>
          </div>

          {/* PRICE */}
          <div className="flex items-baseline gap-1.5 mt-2.5">
            <span className={`text-[1.05rem] md:text-[1.1rem] font-extrabold ${hasOffer ? "text-[#7c3aed]" : "text-brand"}`}>
              ₹{finalPrice}
            </span>
            {hasOffer ? (
              <span className="line-through text-gray-400 text-[0.78rem]">₹{originalPrice}</span>
            ) : (
              product.costPrice && product.costPrice > product.salePrice && (
                <span className="line-through text-gray-400 text-[0.78rem]">₹{product.costPrice}</span>
              )
            )}
          </div>

          {/* DELIVERY */}
          <p className={`flex items-center gap-1 text-[0.7rem] font-semibold mt-1 mb-3 ${
            freeDelivery ? "text-green-600" : "text-gray-400"
          }`}>
            <Truck size={11} />
            {freeDelivery ? "Free delivery" : "Delivery ₹49"}
          </p>

          {/* ACTION — morphs between Add button and qty stepper */}
          {user?.role === "user" && (
            cartQty > 0 ? (
              <div className={`flex items-center justify-between rounded-xl border-2 overflow-hidden ${
                hasOffer ? "border-[#7c3aed] bg-gradient-to-r from-brand/5 to-[#7c3aed]/5" : "border-brand bg-brand-light/40"
              }`}>
                <button
                  onClick={handleDec}
                  disabled={busy}
                  aria-label={cartQty <= 1 ? "Remove from cart" : "Decrease quantity"}
                  className="w-9 h-9 flex items-center justify-center text-brand-dark cursor-pointer hover:bg-white/60 transition-colors disabled:opacity-50"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-[0.92rem] text-brand-dark tabular-nums">
                  {cartQty}
                </span>
                <button
                  onClick={handleInc}
                  disabled={busy || atStockCap}
                  aria-label="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center text-brand-dark cursor-pointer hover:bg-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock || busy}
                className={`w-full py-2 md:py-2.5 border rounded-xl text-[0.8rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasOffer
                    ? "bg-gradient-to-r from-brand to-[#7c3aed] text-white border-transparent hover:opacity-90"
                    : "bg-brand-light text-brand border-brand/20 hover:bg-brand hover:text-white hover:border-brand"
                }`}
              >
                <ShoppingCart size={14} />
                {isOutOfStock ? "Out of Stock" : busy ? "Adding..." : "Add to Cart"}
              </button>
            )
          )}
        </div>
      </div>
    </Link>
  );
}
