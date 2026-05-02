import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../api/order.api";
import { getProfile } from "../api/user.api";
import api from "../api/api";
import { refreshCartCountThunk, clearCart } from "../redux/slice/cartSlice";
import { clearCartItemsState, fetchCartThunk } from "../redux/slice/cartItemsSlice";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { notify } from "../utils/notify";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  MapPin, ShoppingBag, ShieldCheck, Lock, ArrowRight, ArrowLeft,
  CreditCard, Check, Truck, RefreshCcw, AlertTriangle,
} from "lucide-react";

const STEPS = [
  { key: "cart",    label: "Cart" },
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
];

function Stepper({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1.5 sm:gap-3 mb-6 overflow-x-auto scrollbar-hide">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={step.key} className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.72rem] font-extrabold border-2 transition-all ${
              done ? "bg-brand text-white border-brand"
              : active ? "bg-white text-brand border-brand shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
              : "bg-gray-50 text-gray-400 border-gray-200"
            }`}>
              {done ? <Check size={13} strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[0.78rem] font-bold whitespace-nowrap ${active ? "text-brand-dark" : done ? "text-gray-700" : "text-gray-400"}`}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`hidden sm:block w-8 md:w-12 h-0.5 ${i < idx ? "bg-brand" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((s) => s.cartItems.items);
  const cartLoading = useSelector((s) => s.cartItems.loading);

  const [address, setAddress] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null); // razorpay payment id for support reference

  const validItems = useMemo(
    () => (cartItems || []).filter((it) => it && it.productId && it.productId._id),
    [cartItems]
  );
  const subtotal = useMemo(
    () => validItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0),
    [validItems]
  );
  const totalSavings = useMemo(() =>
    validItems.reduce((acc, item) => {
      const p = item.productId;
      if (p?.costPrice && p.costPrice > item.price) acc += (p.costPrice - item.price) * item.quantity;
      return acc;
    }, 0), [validItems]);
  const itemCount = validItems.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    dispatch(fetchCartThunk());
    (async () => {
      try {
        const profileRes = await getProfile();
        const addr = profileRes.data.user.address || "";
        setAddress(addr);
        setProfileAddress(addr);
        setIsProfileComplete(profileRes.data.isProfileComplete);
      } catch {
        setError("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [dispatch]);

  const loading = profileLoading || (cartLoading && cartItems.length === 0);

  const startPayment = async () => {
    if (!isProfileComplete) {
      setError("Please complete your profile before checkout");
      setTimeout(() => navigate("/profile/edit"), 800);
      return;
    }
    if (!address.trim()) { setError("Shipping address is required"); return; }
    if (validItems.length === 0) { setError("Your cart is empty"); return; }

    setError("");
    setProcessing(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setProcessing(false);
      setError("Failed to load payment gateway. Check your connection.");
      return;
    }

    try {
      const orderRes = await api.post("/payment/create-order", {});
      const { order, key, amount: serverAmount } = orderRes.data;

      if (serverAmount && Math.abs(serverAmount - subtotal) > 0.01) {
        setError(`Cart total updated to ₹${serverAmount}. Please review and try again.`);
        setProcessing(false);
        dispatch(fetchCartThunk());
        return;
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "NexKart",
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
            dispatch(clearCartItemsState());
            dispatch(clearCart());
            dispatch(refreshCartCountThunk());
            notify.order({
              title: "Order placed!",
              desc: "Track its journey now",
              action: { label: "View order", to: `/track/${res.data.order._id}` },
            });
            navigate(`/track/${res.data.order._id}`, { replace: true });
          } catch (err) {
            console.error(err);
            setPaymentInfo({ paymentId: response.razorpay_payment_id });
            setError(err.response?.data?.message || "Order placement failed after payment");
            notify.error({
              title: "Order placement failed",
              desc: "Payment was charged. Save your payment ID below to contact support.",
            });
          } finally {
            setProcessing(false);
          }
        },
        notes: { address },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setError("Payment failed. Please try again.");
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to start payment";
      setError(msg);
      setProcessing(false);
    }
  };

  /* ─── Loading & empty states ─── */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (validItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center">
          <ShoppingBag size={32} className="text-brand" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Your cart is empty</h2>
          <p className="text-gray-500 text-sm">Add some products before checking out.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-7 py-3 bg-brand text-white rounded-xl font-bold no-underline transition-all hover:bg-brand-dark"
        >
          Browse Products
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-5 md:px-5 md:py-7">
      <Breadcrumbs items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} className="mb-4" />

      <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
        <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-gray-900 leading-tight">Checkout</h1>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-[0.85rem] font-semibold text-brand hover:text-brand-dark transition-colors no-underline"
        >
          <ArrowLeft size={14} />
          Back to cart
        </Link>
      </div>

      <Stepper current="address" />

      {error && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[0.85rem] font-semibold text-red-700">{error}</p>
            {paymentInfo?.paymentId && (
              <p className="mt-1 text-[0.78rem] text-red-600">
                Payment ID:{" "}
                <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded">
                  {paymentInfo.paymentId}
                </span>
                <span className="ml-2">— quote this when contacting support.</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* LEFT — Address + Order Summary */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Address card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                  <MapPin size={16} className="text-brand" />
                </div>
                <div>
                  <h2 className="text-[0.95rem] font-extrabold text-gray-900 leading-tight">Shipping Address</h2>
                  <p className="text-[0.74rem] text-gray-400">Where should we deliver this order?</p>
                </div>
              </div>
              {profileAddress && address !== profileAddress && (
                <button
                  type="button"
                  onClick={() => setAddress(profileAddress)}
                  className="text-[0.78rem] font-bold text-brand hover:text-brand-dark transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Use saved
                </button>
              )}
            </div>

            <div className="p-5">
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[0.92rem] text-gray-800 outline-none resize-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] min-h-[110px]"
                placeholder="House no., street, area, city, state, pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {!isProfileComplete && (
                <p className="mt-3 text-[0.78rem] text-amber-600 inline-flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  Please <Link to="/profile/edit" className="underline font-bold">complete your profile</Link> before paying.
                </p>
              )}
            </div>
          </div>

          {/* Items list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                <ShoppingBag size={16} className="text-brand" />
              </div>
              <div>
                <h2 className="text-[0.95rem] font-extrabold text-gray-900 leading-tight">Order Summary</h2>
                <p className="text-[0.74rem] text-gray-400">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              </div>
            </div>

            <ul className="p-2">
              {validItems.map((item) => {
                const p = item.productId;
                return (
                  <li key={p._id} className="flex gap-3 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <Link to={`/product/${p._id}`} className="flex-shrink-0">
                      <img
                        src={p.image?.[0] || "/placeholder.jpg"}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${p._id}`} className="no-underline">
                        <h3 className="text-[0.9rem] font-bold text-gray-900 line-clamp-1 hover:text-brand transition-colors">{p.name}</h3>
                      </Link>
                      <p className="text-[0.78rem] text-gray-500 mt-0.5">
                        Qty: <span className="font-semibold text-gray-700">{item.quantity}</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span className="capitalize">{p.category}</span>
                      </p>
                    </div>
                    <span className="font-extrabold text-brand whitespace-nowrap text-[0.92rem]">
                      ₹{item.quantity * item.price}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* RIGHT — Payment summary (sticky on desktop) */}
        <div className="w-full lg:w-[340px] flex flex-col gap-3 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                <CreditCard size={16} className="text-brand" />
              </div>
              <h2 className="text-[0.95rem] font-extrabold text-gray-900 leading-tight">Price Details</h2>
            </div>

            <dl className="p-5 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-[0.88rem]">
                <dt className="text-gray-500">Subtotal ({itemCount} items)</dt>
                <dd className="font-semibold text-gray-800">₹{subtotal}</dd>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between items-center text-[0.88rem]">
                  <dt className="text-green-600">Discount</dt>
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
                <dt className="text-[0.95rem] font-extrabold text-gray-900">Total to pay</dt>
                <dd className="text-2xl font-extrabold text-brand">₹{subtotal}</dd>
              </div>
              <p className="text-[0.72rem] text-gray-400">Inclusive of all taxes</p>
            </dl>

            <div className="px-5 pb-5">
              <button
                onClick={startPayment}
                disabled={processing || !address.trim()}
                className="w-full py-4 bg-gradient-to-r from-brand to-[#7c3aed] text-white border-0 rounded-xl text-[0.95rem] font-extrabold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(79,70,229,0.3)]"
              >
                <Lock size={15} />
                {processing ? "Processing..." : `Pay ₹${subtotal}`}
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span className="text-[0.62rem] font-bold text-gray-700">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                  <RefreshCcw size={14} className="text-blue-600" />
                  <span className="text-[0.62rem] font-bold text-gray-700">Refunds</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                  <Truck size={14} className="text-amber-600" />
                  <span className="text-[0.62rem] font-bold text-gray-700">Free Ship</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[0.72rem] text-gray-400">
                <Lock size={11} />
                256-bit SSL encrypted via Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
