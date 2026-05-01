import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Heart, Trash2, ShoppingCart, ArrowRight, ShoppingBag } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { addToCartThunk, fetchCartThunk } from "../redux/slice/cartItemsSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { fadeIn } from "../animations/fadeIn";

export default function Wishlist() {
  const { items, remove, clear, count } = useWishlist();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [busyId, setBusyId] = useState(null);

  const handleMoveToCart = async (product) => {
    if (!user) return navigate("/login");
    setBusyId(product._id);
    try {
      await dispatch(addToCartThunk({ productId: product._id, quantity: 1 })).unwrap();
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
      remove(product._id);
      toast.success("Moved to cart");
    } catch {
      toast.error("Couldn't add to cart");
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (!user) return navigate("/login");
    let added = 0;
    for (const p of items) {
      try {
        await dispatch(addToCartThunk({ productId: p._id, quantity: 1 })).unwrap();
        added++;
      } catch {
        // skip failures
      }
    }
    if (added > 0) {
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
      clear();
      toast.success(`${added} ${added === 1 ? "item" : "items"} moved to cart`);
    } else {
      toast.error("Couldn't move items to cart");
    }
  };

  if (count === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 md:py-24 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5">
          <Heart size={42} className="text-red-300" strokeWidth={1.8} />
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">Your wishlist is empty</h1>
        <p className="text-[0.92rem] text-gray-500 max-w-sm mx-auto mb-7">
          Save items you love by tapping the heart icon. They'll show up here for easy access later.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-7 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
        >
          <ShoppingBag size={16} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
      {/* HEADER */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-[#7c3aed] text-white mb-6 shadow-[0_8px_30px_rgba(79,70,229,0.25)]"
        {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 p-5 md:p-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Heart size={20} className="text-white" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70">Saved for later</p>
              <h1 className="text-lg md:text-xl font-extrabold leading-tight">
                My Wishlist <span className="text-white/70 font-semibold">({count} {count === 1 ? "item" : "items"})</span>
              </h1>
            </div>
          </div>
          {user && (
            <button
              onClick={handleMoveAllToCart}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-brand-dark rounded-xl font-bold text-[0.85rem] border-0 cursor-pointer transition-all hover:bg-brand-light shadow-md whitespace-nowrap flex-shrink-0"
            >
              <ShoppingCart size={14} />
              Move all to cart
            </button>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div className="flex flex-col gap-3">
        {items.map((p) => {
          const discount = p.costPrice && p.costPrice > p.salePrice
            ? Math.round(((p.costPrice - p.salePrice) / p.costPrice) * 100)
            : 0;
          const outOfStock = p.stock === 0;
          const busy = busyId === p._id;

          return (
            <div
              key={p._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card flex flex-col sm:flex-row gap-4 p-4 hover:border-brand/20 transition-colors"
              {...fadeIn({ direction: "up", distance: 20, duration: 0.4 })}
            >
              {/* IMAGE */}
              <Link to={`/product/${p._id}`} className="flex-shrink-0">
                <div className="relative w-full h-44 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
                  <img
                    src={p.image?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="bg-gray-700 text-white text-[0.65rem] font-bold px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* INFO */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <span className="text-[0.65rem] font-bold text-brand-medium uppercase tracking-wider capitalize">
                  {p.category}
                </span>
                <Link to={`/product/${p._id}`} className="no-underline">
                  <h3 className="text-[0.95rem] font-semibold text-gray-900 leading-snug hover:text-brand transition-colors line-clamp-2">
                    {p.name}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-brand">₹{p.salePrice}</span>
                  {p.costPrice && p.costPrice > p.salePrice && (
                    <>
                      <span className="line-through text-gray-400 text-[0.82rem]">₹{p.costPrice}</span>
                      <span className="text-[0.7rem] font-bold text-green-600">{discount}% off</span>
                    </>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex sm:flex-col gap-2 sm:w-40 sm:flex-shrink-0">
                <button
                  onClick={() => handleMoveToCart(p)}
                  disabled={outOfStock || busy}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand text-white rounded-xl text-[0.82rem] font-semibold border-0 cursor-pointer transition-all hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={13} />
                  {busy ? "Adding..." : "Move to Cart"}
                </button>
                <button
                  onClick={() => remove(p._id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-100 flex-wrap">
        <button
          onClick={() => {
            if (window.confirm("Clear your entire wishlist?")) clear();
          }}
          className="text-[0.85rem] font-semibold text-gray-500 hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer"
        >
          Clear wishlist
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-brand hover:text-brand-dark no-underline transition-colors"
        >
          Continue shopping
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
