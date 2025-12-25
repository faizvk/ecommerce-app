import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCart } from "../api/cart.api";
import { placeOrder } from "../api/order.api";
import { getProfile } from "../api/user.api";
import api from "../api/api";
import Button from "../components/Button";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { fadeIn } from "../animations/FadeIn";
import "./styles/Checkout.css";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const cartRes = await getCart();
        setCart(cartRes.data.cart);

        const profileRes = await getProfile();
        setAddress(profileRes.data.user.address || "");
        setIsProfileComplete(profileRes.data.isProfileComplete);
      } catch (err) {
        console.error(err);
        setError("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const startPayment = async () => {
    if (!isProfileComplete) {
      setError("Please complete your profile before checkout");
      setTimeout(() => {
        navigate("/profile");
      }, 800);
      return;
    }
    if (!address.trim()) {
      setError("Shipping address is required");
      return;
    }

    if (!cart || cart.products.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setError("");
    setProcessing(true);

    // 1) Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setProcessing(false);
      setError("Failed to load Razorpay. Check your connection.");
      return;
    }

    try {
      // 2) Create Razorpay order on backend
      const orderRes = await api.post("/payment/create-order", {
        amount: cart.totalAmount,
      });

      const { order, key } = orderRes.data;

      // 3) Configure Razorpay
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "MyStore",
        description: "Order Payment",
        order_id: order.id,
        handler: async function () {
          try {
            const res = await placeOrder(address);

            // 🔥 Refresh Redux cart count after order
            dispatch(refreshCartCountThunk());

            navigate(`/track/${res.data.order._id}`, { replace: true });
          } catch (err) {
            console.error(err);
            setError(
              err.response?.data?.message || "Payment done, but order failed."
            );
          } finally {
            setProcessing(false);
          }
        },
        notes: {
          address,
        },
        theme: {
          color: "#1a73e8",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error(response);
        setError("Payment failed. Please try again.");
        setProcessing(false);
      });

      // 4) Open Razorpay Checkout
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Failed to start payment. Try again.");
      setProcessing(false);
    }
  };

  if (loading) return <p className="loading">Loading checkout...</p>;

  if (!cart || cart.products.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty.</h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <h1 className="checkout-title">Checkout</h1>

      {error && <p className="error-text">{error}</p>}

      <div
        className="checkout-layout"
        {...fadeIn({
          direction: "left",
          distance: 80,
          duration: 0.9,
        })}
      >
        {/* LEFT — ORDER SUMMARY */}
        <div className="order-items-box">
          <h2 className="section-heading">Order Summary</h2>

          {cart.products.map((item) => {
            const p = item.productId;
            if (!p) return null;

            return (
              <div className="checkout-item" key={p._id}>
                <img
                  src={p.image?.[0] || "/placeholder.jpg"}
                  alt={p.name}
                  className="checkout-item-img"
                />

                <div className="ci-info">
                  <h3 className="ci-name">{p.name}</h3>
                  <p className="ci-qty">Qty: {item.quantity}</p>
                </div>

                <div className="ci-total">₹{item.quantity * item.price}</div>
              </div>
            );
          })}

          <h2 className="total-amount">Total: ₹{cart.totalAmount}</h2>
        </div>

        {/* RIGHT — SHIPPING + PAYMENT */}
        <div className="shipping-box">
          <h2 className="section-heading">Shipping Address</h2>

          <textarea
            className="address-input"
            placeholder="Enter full shipping address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Button
            variant="primary"
            onClick={startPayment}
            className="place-order-btn"
            disabled={processing}
          >
            {processing ? "Processing..." : `Pay ₹${cart.totalAmount}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
