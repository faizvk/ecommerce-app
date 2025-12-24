import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartThunk,
  removeFromCartThunk,
  increaseQtyThunk,
  decreaseQtyThunk,
} from "../redux/slice/cartItemsSlice";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { fadeIn } from "../animations/FadeIn";
import { Link } from "react-router-dom";
import "./styles/Cart.css";

export default function Cart() {
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const {
    items,
    totalAmount,
    loading: cartLoading,
    error,
  } = useSelector((state) => state.cartItems);

  useEffect(() => {
    if (!authLoading && user) {
      dispatch(fetchCartThunk());
      dispatch(refreshCartCountThunk());
    }
  }, [authLoading, user, dispatch]);

  if (authLoading) return <p className="loading">Loading...</p>;

  if (!user) {
    return (
      <div className="cart-empty-login">
        <h2>You are not logged in</h2>
        <p>Please login to view your cart items</p>
        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>
    );
  }

  if (cartLoading) return <p className="loading">Loading cart...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="cart-page container">
      <h1 className="cart-title">Your Cart</h1>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="browse-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div
          className="cart-grid"
          {...fadeIn({
            direction: "left",
            distance: 80,
            duration: 0.9,
          })}
        >
          {/* LEFT ITEMS */}
          <div className="cart-items">
            {items.map((item) => {
              const product = item.productId;

              return (
                <div key={product._id} className="cart-card">
                  {/* IMAGE */}
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.image?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="cart-img"
                    />
                  </Link>

                  <div className="cart-info">
                    <Link
                      to={`/product/${product._id}`}
                      className="cart-name-link"
                    >
                      <h3 className="cart-name">{product.name}</h3>
                    </Link>

                    <div className="cart-price-row">
                      <span className="cart-price">₹{product.salePrice}</span>
                      {product.costPrice && (
                        <span className="cart-old">₹{product.costPrice}</span>
                      )}
                    </div>

                    {/* QUANTITY CONTROL */}
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                        onClick={async () => {
                          await dispatch(decreaseQtyThunk(product._id));
                          dispatch(fetchCartThunk());
                          dispatch(refreshCartCountThunk());
                        }}
                      >
                        -
                      </button>

                      <span className="qty-num">{item.quantity}</span>

                      <button
                        className="qty-btn"
                        disabled={item.quantity >= product.stock}
                        onClick={async () => {
                          await dispatch(increaseQtyThunk(product._id));
                          dispatch(fetchCartThunk());
                          dispatch(refreshCartCountThunk());
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-subtotal">
                      Subtotal: ₹{item.quantity * item.price}
                    </div>
                  </div>

                  <button
                    className="cart-remove-btn"
                    onClick={async () => {
                      await dispatch(removeFromCartThunk(product._id));
                      dispatch(fetchCartThunk());
                      dispatch(refreshCartCountThunk());
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT SUMMARY */}
          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-line">
              <span>Total Items</span>
              <strong>{items.length}</strong>
            </div>

            <div className="summary-line total">
              <span>Total Amount</span>
              <strong>₹{totalAmount}</strong>
            </div>

            <Link to="/checkout">
              <button className="checkout-btn">Proceed to Checkout</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
