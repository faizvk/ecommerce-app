import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartThunk,
  removeFromCartThunk,
  increaseQtyThunk,
  decreaseQtyThunk,
} from "../redux/slice/cartItemsSlice";
import { fadeIn } from "../animations/fadeIn";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Trash2, Truck, ShieldCheck, Tag, Minus, Plus,
  ArrowRight, RefreshCcw, Lock,
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";

export default function Cart() {
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const { items, totalAmount, loading: cartLoading, error } = useSelector((s) => s.cartItems);

  useEffect(() => {
    if (!authLoading && user) dispatch(fetchCartThunk());
  }, [authLoading, user, dispatch]);

  // Filter out items whose underlying product was deleted
  const validItems = useMemo(
    () => (items || []).filter((it) => it && it.productId && it.productId._id),
    [items]
  );
  const unavailableCount = (items?.length || 0) - validItems.length;

  const subtotal = validItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalSavings = validItems.reduce((acc, item) => {
    const p = item.productId;
    if (p?.costPrice && p.costPrice > item.price) acc += (p.costPrice - item.price) * item.quantity;
    return acc;
  }, 0);
  const itemCount = validItems.reduce((n, i) => n + i.quantity, 0);
  const displayTotal = unavailableCount > 0 ? subtotal : totalAmount;
  const grandTotal = displayTotal; // free delivery

  /* ─── auth & loading gates ─── */
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center">
          <ShoppingCart size={34} className="text-brand" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sign in to view your cart</h2>
          <p className="text-gray-500 text-sm">Your saved items will appear here once you're signed in.</p>
        </div>
        <Link
          to="/login"
          state={{ from: "/cart" }}
          className="px-7 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (cartLoading && (items?.length || 0) === 0) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-5 md:px-5 md:py-7">
      <Breadcrumbs items={[{ label: "Cart" }]} className="mb-4" />

      {/* HEADER */}
      <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-gray-900 leading-tight">Your Cart</h1>
          {validItems.length > 0 && (
            <p className="text-[0.85rem] text-gray-400 mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout
            </p>
          )}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[0.85rem] font-semibold text-brand hover:text-brand-dark transition-colors no-underline"
        >
          ← Continue shopping
        </Link>
      </div>

      {/* Stale items notice */}
      {unavailableCount > 0 && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <span className="text-xl leading-none mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-[0.88rem] font-bold text-amber-800">
              {unavailableCount} item{unavailableCount > 1 ? "s" : ""} no longer available
            </p>
            <p className="text-[0.8rem] text-amber-700 mt-0.5">
              Some products were removed from the store. They've been hidden from your cart total.
            </p>
          </div>
        </div>
      )}

      {validItems.length === 0 ? (
        /* ─── EMPTY STATE ─── */
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center bg-white rounded-3xl border border-gray-100">
          <div className="w-24 h-24 rounded-full bg-brand-light flex items-center justify-center">
            <ShoppingCart size={42} className="text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-gray-500 text-sm">Looks like you haven't added anything yet.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-7 py-3 bg-gradient-to-r from-brand to-[#7c3aed] text-white rounded-xl font-bold no-underline transition-all hover:opacity-90 hover:-translate-y-px shadow-[0_8px_24px_rgba(79,70,229,0.25)]"
          >
            Start Shopping
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start" {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}>
          {/* CART ITEMS */}
          <div className="flex-1 flex flex-col gap-3">
            {validItems.map((item) => {
              const product = item.productId;
              const lineTotal = item.price * item.quantity;
              const itemSavings = product?.costPrice && product.costPrice > item.price
                ? (product.costPrice - item.price) * item.quantity
                : 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-brand/20 hover:shadow-card transition-all p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                >
                  {/* IMAGE */}
                  <Link to={`/product/${product._id}`} className="flex-shrink-0">
                    <div className="relative w-full h-44 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
                      <img
                        src={product.image?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <span className="text-[0.66rem] font-bold text-brand-medium uppercase tracking-wider capitalize">
                      {product.category}
                    </span>

                    <Link to={`/product/${product._id}`} className="no-underline">
                      <h3 className="text-[0.95rem] font-bold text-gray-900 leading-snug hover:text-brand transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-base font-extrabold text-brand">₹{item.price}</span>
                      {product.costPrice && product.costPrice > item.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">₹{product.costPrice}</span>
                          {itemSavings > 0 && (
                            <span className="text-[0.7rem] font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded">
                              Save ₹{itemSavings}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* QTY + ACTIONS row */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Stepper */}
                      <div className="inline-flex items-stretch border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <button
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() => dispatch(decreaseQtyThunk(product._id))}
                          className="w-9 h-9 bg-white flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-0"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 flex items-center justify-center font-extrabold text-[0.88rem] tabular-nums bg-gray-50 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          disabled={item.quantity >= product.stock}
                          onClick={() => dispatch(increaseQtyThunk(product._id))}
                          className="w-9 h-9 bg-white flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-0"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {item.quantity > 1 && (
                        <span className="text-[0.78rem] text-gray-500">
                          Subtotal <span className="font-bold text-gray-800">₹{lineTotal}</span>
                        </span>
                      )}

                      <button
                        onClick={() => dispatch(removeFromCartThunk(product._id))}
                        title="Remove from cart"
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 rounded-lg cursor-pointer bg-transparent border border-transparent transition-all hover:bg-red-50 hover:border-red-100 text-[0.78rem] font-semibold"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY (sticky on desktop) */}
          <div className="w-full lg:w-[340px] flex flex-col gap-3 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-[1rem] font-extrabold text-gray-900">Order Summary</h2>
              </div>

              <dl className="p-5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[0.88rem]">
                  <dt className="text-gray-500">Subtotal ({itemCount} items)</dt>
                  <dd className="font-semibold text-gray-800">₹{subtotal}</dd>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-[0.88rem]">
                    <dt className="text-green-600">You save</dt>
                    <dd className="font-bold text-green-600">−₹{totalSavings}</dd>
                  </div>
                )}

                <div className="flex justify-between items-center text-[0.88rem]">
                  <dt className="text-gray-500 inline-flex items-center gap-1.5">
                    <Truck size={13} className="text-green-500" />
                    Delivery
                  </dt>
                  <dd className="font-semibold text-green-600">Free</dd>
                </div>

                <div className="h-px bg-gray-100 my-1.5" />

                <div className="flex justify-between items-center pt-1">
                  <dt className="text-[0.95rem] font-extrabold text-gray-900">Total</dt>
                  <dd className="text-2xl font-extrabold text-brand">₹{grandTotal}</dd>
                </div>
                <p className="text-[0.72rem] text-gray-400">Inclusive of all taxes</p>
              </dl>

              {totalSavings > 0 && (
                <div className="mx-5 mb-4 flex items-center gap-2 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <Tag size={13} className="text-green-600 flex-shrink-0" />
                  <p className="text-[0.78rem] font-bold text-green-700">
                    You're saving ₹{totalSavings} on this order
                  </p>
                </div>
              )}

              <div className="px-5 pb-5">
                <Link to="/checkout" className="block no-underline">
                  <button className="w-full py-3.5 bg-gradient-to-r from-brand to-[#7c3aed] text-white border-0 rounded-xl font-bold text-[0.95rem] cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px shadow-[0_8px_24px_rgba(79,70,229,0.25)] flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </button>
                </Link>

                <div className="flex items-center justify-center gap-1.5 mt-3 text-[0.72rem] text-gray-400">
                  <Lock size={11} />
                  Secure encrypted checkout
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck size={16} className="text-brand" />
                <span className="text-[0.68rem] font-bold text-gray-700 leading-tight">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCcw size={16} className="text-brand" />
                <span className="text-[0.68rem] font-bold text-gray-700 leading-tight">7-Day Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={16} className="text-brand" />
                <span className="text-[0.68rem] font-bold text-gray-700 leading-tight">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
