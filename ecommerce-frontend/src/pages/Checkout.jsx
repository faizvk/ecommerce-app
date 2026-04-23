import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCart } from "../api/cart.api";
import { placeOrder } from "../api/order.api";
import { getProfile } from "../api/user.api";
import api from "../api/api";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { fadeIn } from "../animations/fadeIn";

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
      setTimeout(() => navigate("/profile"), 800);
      return;
    }
    if (!address.trim()) { setError("Shipping address is required"); return; }
    if (!cart || cart.products.length === 0) { setError("Your cart is empty"); return; }

    setError("");
    setProcessing(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setProcessing(false);
      setError("Failed to load Razorpay. Check your connection.");
      return;
    }

    try {
      const orderRes = await api.post("/payment/create-order", { amount: cart.totalAmount });
      const { order, key } = orderRes.data;

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
            dispatch(refreshCartCountThunk());
            navigate(`/track/${res.data.order._id}`, { replace: true });
          } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Payment done, but order failed.");
          } finally {
            setProcessing(false);
          }
        },
        notes: { address },
        theme: { color: "#38598b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error(response);
        setError("Payment failed. Please try again.");
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Failed to start payment. Try again.");
      setProcessing(false);
    }
  };

  if (loading) return <p className="text-center py-12 text-xl text-brand">Loading checkout...</p>;

  if (!cart || cart.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty.</h2>
        <button
          className="px-6 py-3 bg-brand text-white rounded-xl font-semibold border-0 cursor-pointer transition-all hover:bg-brand-dark"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-8 sm:text-2xl sm:mb-6">Checkout</h1>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-[0.875rem] font-medium text-red-600">{error}</p>
        </div>
      )}

      <div
        className="flex gap-8 items-start lg:flex-col"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        {/* LEFT — ORDER SUMMARY */}
        <div className="flex-1 bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

          <div className="flex flex-col gap-4">
            {cart.products.map((item) => {
              const p = item.productId;
              if (!p) return null;
              return (
                <div key={p._id} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
                  <img
                    src={p.image?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.95rem] font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                    <p className="text-[0.85rem] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-brand whitespace-nowrap">₹{item.quantity * item.price}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold text-gray-700">Total</span>
            <span className="text-2xl font-extrabold text-brand">₹{cart.totalAmount}</span>
          </div>
        </div>

        {/* RIGHT — SHIPPING + PAYMENT */}
        <div className="w-[340px] lg:w-full bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Shipping Address</h2>

          <textarea
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] outline-none resize-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)] min-h-[120px]"
            placeholder="Enter full shipping address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <button
            className="mt-5 w-full py-4 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={startPayment}
            disabled={processing}
          >
            {processing ? "Processing..." : `Pay ₹${cart.totalAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
}
