import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartThunk,
  removeFromCartThunk,
  increaseQtyThunk,
  decreaseQtyThunk,
} from "../redux/slice/cartItemsSlice";
import { fadeIn } from "../animations/fadeIn";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Truck, ShieldCheck, Tag } from "lucide-react";

export default function Cart() {
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { items, totalAmount, loading: cartLoading, error } = useSelector((state) => state.cartItems);

  useEffect(() => {
    if (!authLoading && user) {
      dispatch(fetchCartThunk());
    }
  }, [authLoading, user, dispatch]);

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
          className="px-7 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;

  // Filter out items whose underlying product was deleted (productId now null)
  const validItems = items.filter((it) => it && it.productId && it.productId._id);
  const unavailableCount = items.length - validItems.length;

  const totalSavings = validItems.reduce((acc, item) => {
    const product = item.productId;
    if (product?.costPrice && product.costPrice > item.price) {
      acc += (product.costPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  const subtotal = validItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Your Cart
        </h1>
        {validItems.length > 0 && (
          <p className="text-[0.85rem] text-gray-400 mt-0.5">
            {validItems.length} {validItems.length === 1 ? "item" : "items"} in your cart
          </p>
        )}
      </div>

      {/* Stale items notice */}
      {unavailableCount > 0 && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <span className="text-xl leading-none mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-[0.88rem] font-bold text-amber-800">
              {unavailableCount} item{unavailableCount > 1 ? "s" : ""} no longer available
            </p>
            <p className="text-[0.8rem] text-amber-700 mt-0.5">
              Some products in your cart have been removed from the store. They've been hidden — refresh the page to clean them up.
            </p>
          </div>
        </div>
      )}

      {validItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">Your cart is empty</h2>
            <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
          </div>
          <Link
            to="/"
            className="px-7 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div
          className="flex flex-col gap-6 lg:flex-row lg:items-start"
          {...fadeIn({ direction: "up", distance: 40, duration: 0.6 })}
        >
          {/* CART ITEMS */}
          <div className="flex-1 flex flex-col gap-3">
            {validItems.map((item) => {
              const product = item.productId;
              const itemSavings = product?.costPrice && product.costPrice > item.price
                ? (product.costPrice - item.price) * item.quantity
                : 0;

              return (
                <div
                  key={product._id}
                  className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-card sm:flex-row sm:gap-4 sm:p-5 hover:border-brand/20 transition-colors"
                >
                  {/* IMAGE */}
                  <Link to={`/product/${product._id}`} className="flex-shrink-0">
                    <img
                      src={product.image?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-xl bg-gray-50 sm:w-24 sm:h-24 transition-opacity hover:opacity-90"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <span className="text-[0.68rem] font-bold text-brand-medium uppercase tracking-wider capitalize">
                      {product.category}
                    </span>

                    <Link to={`/product/${product._id}`} className="no-underline">
                      <h3 className="text-[0.92rem] font-semibold text-gray-900 leading-snug hover:text-brand transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-brand">₹{item.price}</span>
                      {product.costPrice && product.costPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.costPrice}</span>
                      )}
                      {itemSavings > 0 && (
                        <span className="text-[0.7rem] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          Save ₹{itemSavings}
                        </span>
                      )}
                    </div>

                    {/* QTY CONTROLS */}
                    <div className="flex items-center gap-0 mt-1 w-fit border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="w-8 h-8 bg-white border-0 text-gray-700 font-bold text-base cursor-pointer transition-all hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={item.quantity <= 1}
                        onClick={() => dispatch(decreaseQtyThunk(product._id))}
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-sm bg-gray-50 h-8 flex items-center justify-center border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        className="w-8 h-8 bg-white border-0 text-gray-700 font-bold text-base cursor-pointer transition-all hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={item.quantity >= product.stock}
                        onClick={() => dispatch(increaseQtyThunk(product._id))}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                    <span className="text-[0.95rem] font-bold text-gray-900">
                      ₹{item.quantity * item.price}
                    </span>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 text-red-400 rounded-lg cursor-pointer bg-transparent border border-transparent transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-[0.78rem] font-medium"
                      onClick={() => dispatch(removeFromCartThunk(product._id))}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="w-full lg:w-[300px] bg-white rounded-2xl border border-gray-100 p-5 shadow-card lg:sticky lg:top-24">
            <h2 className="text-[0.95rem] font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h2>

            <div className="flex flex-col gap-0">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50 text-[0.88rem]">
                <span className="text-gray-500">Subtotal ({validItems.length} {validItems.length === 1 ? "item" : "items"})</span>
                <span className="font-semibold text-gray-800">₹{subtotal}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50 text-[0.88rem]">
                  <span className="text-green-600 font-medium">You save</span>
                  <span className="font-bold text-green-600">-₹{totalSavings}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50 text-[0.88rem]">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Truck size={13} className="text-green-500" />
                  Delivery
                </span>
                <span className="font-semibold text-green-600">Free</span>
              </div>

              <div className="flex justify-between items-center pt-3 pb-1">
                <span className="text-[0.92rem] font-bold text-gray-800">Total</span>
                <span className="text-brand text-xl font-extrabold">₹{unavailableCount > 0 ? subtotal : totalAmount}</span>
              </div>
            </div>

            {totalSavings > 0 && (
              <div className="flex items-center gap-2 mt-3 p-2.5 bg-green-50 rounded-lg border border-green-100">
                <Tag size={13} className="text-green-600 flex-shrink-0" />
                <p className="text-[0.75rem] font-semibold text-green-700">
                  You're saving ₹{totalSavings} on this order!
                </p>
              </div>
            )}

            <Link to="/checkout" className="block no-underline mt-4">
              <button className="w-full py-3.5 bg-brand text-white border-0 rounded-xl font-semibold text-[0.92rem] cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px shadow-[0_4px_14px_rgba(79,70,229,0.25)]">
                Proceed to Checkout
              </button>
            </Link>

            <div className="flex items-center justify-center gap-2 mt-3">
              <ShieldCheck size={13} className="text-gray-400" />
              <p className="text-[0.72rem] text-gray-400">Secure & encrypted checkout</p>
            </div>

            <Link to="/" className="block text-center no-underline mt-3 text-[0.82rem] text-brand font-medium hover:text-brand-dark transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
