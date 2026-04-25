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
import { ShoppingCart, Trash2 } from "lucide-react";

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
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
          <ShoppingCart size={28} className="text-brand" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sign in to view your cart</h2>
          <p className="text-gray-500 text-sm">Your saved items will appear here.</p>
        </div>
        <Link
          to="/login"
          className="px-7 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark"
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

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-extrabold text-brand-dark mb-6">
        Your Cart{items.length > 0 && (
          <span className="text-gray-400 font-medium ml-2 text-lg">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart size={36} className="text-gray-400" />
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
        /* Stack on mobile, side-by-side on desktop */
        <div
          className="flex flex-col gap-6 lg:flex-row lg:items-start"
          {...fadeIn({ direction: "up", distance: 40, duration: 0.6 })}
        >
          {/* CART ITEMS */}
          <div className="flex-1 flex flex-col gap-4">
            {items.map((item) => {
              const product = item.productId;
              return (
                <div
                  key={product._id}
                  className="flex flex-col gap-3 bg-white rounded-2xl border border-black/[0.07] p-4 shadow-card sm:flex-row sm:gap-4 sm:p-5"
                >
                  {/* IMAGE */}
                  <Link to={`/product/${product._id}`} className="flex-shrink-0">
                    <img
                      src={product.image?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-44 object-cover rounded-xl bg-gray-100 sm:w-28 sm:h-28 transition-opacity hover:opacity-90"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <Link to={`/product/${product._id}`} className="no-underline">
                      <h3 className="text-[0.95rem] font-semibold text-gray-900 leading-snug hover:text-brand transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <span className="text-[0.72rem] font-semibold text-brand-medium uppercase tracking-wider capitalize">
                      {product.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-brand">₹{item.price}</span>
                      {product.costPrice && product.costPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.costPrice}</span>
                      )}
                    </div>

                    {/* QUANTITY CONTROL */}
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 border-0 text-gray-700 font-bold text-lg cursor-pointer transition-all hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={item.quantity <= 1}
                        onClick={() => dispatch(decreaseQtyThunk(product._id))}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-base">{item.quantity}</span>
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 border-0 text-gray-700 font-bold text-lg cursor-pointer transition-all hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={item.quantity >= product.stock}
                        onClick={() => dispatch(increaseQtyThunk(product._id))}
                      >
                        +
                      </button>

                      <span className="text-[0.85rem] text-gray-500 ml-2">
                        Subtotal: <span className="text-brand font-bold">₹{item.quantity * item.price}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    className="self-start flex items-center gap-1.5 px-3 py-1.5 text-red-400 rounded-lg cursor-pointer bg-transparent border-0 transition-all hover:bg-red-50 hover:text-red-600 text-sm font-medium"
                    onClick={() => dispatch(removeFromCartThunk(product._id))}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY — full width on mobile, fixed width on desktop */}
          <div className="w-full lg:w-[300px] bg-white rounded-2xl border border-black/[0.07] p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="flex justify-between items-center py-3 border-b border-gray-100 text-[0.9rem]">
              <span className="text-gray-500">Items</span>
              <span className="font-semibold text-gray-900">{items.length}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 text-[0.9rem]">
              <span className="text-gray-500">Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>

            <div className="flex justify-between items-center pt-4 pb-1">
              <span className="text-gray-700 font-semibold">Total</span>
              <span className="text-brand text-2xl font-extrabold">₹{totalAmount}</span>
            </div>

            <Link to="/checkout" className="block no-underline mt-5">
              <button className="w-full py-3.5 bg-brand text-white border-0 rounded-xl font-semibold text-[0.95rem] cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px">
                Proceed to Checkout
              </button>
            </Link>

            <Link to="/" className="block text-center no-underline mt-3 text-[0.85rem] text-brand font-medium hover:text-brand-dark transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
