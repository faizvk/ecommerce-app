import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartThunk,
  removeFromCartThunk,
  increaseQtyThunk,
  decreaseQtyThunk,
} from "../redux/slice/cartItemsSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { fadeIn } from "../animations/fadeIn";
import { Link } from "react-router-dom";

export default function Cart() {
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { items, totalAmount, loading: cartLoading, error } = useSelector((state) => state.cartItems);

  useEffect(() => {
    if (!authLoading && user) {
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
    }
  }, [authLoading, user, dispatch]);

  if (authLoading) return <p className="text-center py-12 text-xl text-brand">Loading...</p>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">You are not logged in</h2>
        <p className="text-gray-500">Please login to view your cart items</p>
        <Link
          to="/login"
          className="px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark"
        >
          Login
        </Link>
      </div>
    );
  }

  if (cartLoading) return <p className="text-center py-12 text-xl text-brand">Loading cart...</p>;
  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-8 sm:text-2xl sm:mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <p className="text-xl text-gray-500">Your cart is empty.</p>
          <Link
            to="/"
            className="px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div
          className="flex gap-8 items-start lg:flex-col"
          {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
        >
          {/* CART ITEMS */}
          <div className="flex-1 flex flex-col gap-4">
            {items.map((item) => {
              const product = item.productId;
              return (
                <div
                  key={product._id}
                  className="flex gap-4 bg-white rounded-2xl border border-black/[0.08] p-5 shadow-card sm:flex-col sm:gap-3"
                >
                  {/* IMAGE */}
                  <Link to={`/product/${product._id}`} className="flex-shrink-0">
                    <img
                      src={product.image?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-28 h-28 object-cover rounded-xl bg-gray-100 sm:w-full sm:h-48"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <Link to={`/product/${product._id}`} className="no-underline">
                      <h3 className="text-[1rem] font-semibold text-gray-900 leading-snug hover:text-brand transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-brand">₹{product.salePrice}</span>
                      {product.costPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.costPrice}</span>
                      )}
                    </div>

                    {/* QUANTITY CONTROL */}
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 border-0 text-gray-700 font-bold text-lg cursor-pointer transition-all hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={item.quantity <= 1}
                        onClick={async () => {
                          await dispatch(decreaseQtyThunk(product._id));
                          await dispatch(fetchCartThunk());
                          await dispatch(refreshCartCountThunk());
                        }}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-base">{item.quantity}</span>
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 border-0 text-gray-700 font-bold text-lg cursor-pointer transition-all hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={item.quantity >= product.stock}
                        onClick={async () => {
                          await dispatch(increaseQtyThunk(product._id));
                          await dispatch(fetchCartThunk());
                          await dispatch(refreshCartCountThunk());
                        }}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[0.85rem] text-gray-500 font-medium">
                      Subtotal: <span className="text-brand font-bold">₹{item.quantity * item.price}</span>
                    </span>
                  </div>

                  <button
                    className="self-start px-4 py-1.5 text-sm font-semibold text-red-500 border border-red-200 rounded-lg cursor-pointer bg-red-50 transition-all hover:bg-red-100 sm:self-stretch sm:text-center"
                    onClick={async () => {
                      await dispatch(removeFromCartThunk(product._id));
                      await dispatch(fetchCartThunk());
                      await dispatch(refreshCartCountThunk());
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="w-[320px] bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card sticky top-24 lg:w-full lg:static">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="flex justify-between items-center py-3 border-b border-gray-100 text-[0.95rem]">
              <span className="text-gray-600">Total Items</span>
              <strong className="text-gray-900">{items.length}</strong>
            </div>

            <div className="flex justify-between items-center py-4 text-[1rem]">
              <span className="text-gray-600 font-semibold">Total Amount</span>
              <strong className="text-brand text-xl font-extrabold">₹{totalAmount}</strong>
            </div>

            <Link to="/checkout" className="block no-underline">
              <button className="w-full py-4 bg-brand text-white border-0 rounded-xl font-semibold text-[0.95rem] cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
