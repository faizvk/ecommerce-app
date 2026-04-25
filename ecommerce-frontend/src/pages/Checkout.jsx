import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCart } from "../api/cart.api";
import { placeOrder } from "../api/order.api";
import { getProfile } from "../api/user.api";
import api from "../api/api";
import { refreshCartCountThunk } from "../redux/slice/cartSlice";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { MapPin, ShoppingBag } from "lucide-react";

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
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            const res = await placeOrder(address, response.razorpay_payment_id, response.razorpay_order_id);
            dispatch(refreshCartCountThunk());
            navigate(`/track/${res.data.order._id}`, { replace: true });
          } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Payment verification failed. Contact support.");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (!cart || cart.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
          <ShoppingBag size={28} className="text-brand" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Your cart is empty</h2>
          <p className="text-gray-500 text-sm">Add some products before checking out.</p>
        </div>
        <button
          className="px-7 py-3 bg-brand text-white rounded-xl font-semibold border-0 cursor-pointer transition-all hover:bg-brand-dark"
          onClick={() => navigate("/")}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-extrabold text-brand-dark mb-6">Checkout</h1>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-[0.875rem] font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* LEFT — ORDER SUMMARY */}
        <div className="flex-1 bg-white rounded-2xl border border-black/[0.07] p-5 md:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag size={18} className="text-brand" />
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          </div>

          <div className="flex flex-col gap-1">
            {cart.products.map((item) => {
              const p = item.productId;
              if (!p) return null;
              return (
                <div key={p._id} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
                  <img
                    src={p.image?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-14 h-14 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.9rem] font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                    <p className="text-[0.8rem] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-brand whitespace-nowrap text-sm">₹{item.quantity * item.price}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-2xl font-extrabold text-brand">₹{cart.totalAmount}</span>
          </div>
        </div>

        {/* RIGHT — SHIPPING + PAYMENT — full width mobile, fixed width desktop */}
        <div className="w-full lg:w-[320px] bg-white rounded-2xl border border-black/[0.07] p-5 md:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-brand" />
            <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          </div>

          <textarea
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.9rem] outline-none resize-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)] min-h-[110px]"
            placeholder="Enter your full shipping address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="mt-3 flex flex-col gap-1.5 text-[0.8rem] text-gray-400">
            <span>✔ Free delivery on all orders</span>
            <span>✔ Secure payment via Razorpay</span>
          </div>

          <button
            className="mt-5 w-full py-4 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={startPayment}
            disabled={processing}
          >
            {processing ? "Processing..." : `Pay ₹${cart.totalAmount}`}
          </button>

          <Link
            to="/cart"
            className="block text-center no-underline mt-3 text-[0.85rem] text-brand font-medium hover:text-brand-dark transition-colors"
          >
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
