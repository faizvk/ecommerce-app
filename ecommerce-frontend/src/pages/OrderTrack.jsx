import { useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { trackOrderThunk, cancelOrderThunk } from "../redux/slice/orderSlice";
import {
  MapPin, CheckCircle2, XCircle, Package, Truck, Box, Home as HomeIcon,
  ArrowLeft, ChevronRight, ShieldCheck, Clock,
} from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge";
import Breadcrumbs from "../components/Breadcrumbs";

const STEPS = [
  { key: "ordered",    label: "Order Placed",  desc: "We've received your order",                       icon: Box },
  { key: "processing", label: "Processing",    desc: "Packing your items with care",                    icon: Package },
  { key: "shipped",    label: "Shipped",       desc: "On the way — courier in transit",                 icon: Truck },
  { key: "delivered",  label: "Delivered",     desc: "Enjoy your order!",                               icon: HomeIcon },
];

const statusToStep = {
  pending:    0,
  processing: 1,
  shipped:    2,
  delivered:  3,
};

export default function OrderTrack() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const { currentOrder: order, loading: orderLoading, error, message } = useSelector((s) => s.order);

  if (!authLoading && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (authLoading) return;
    dispatch(trackOrderThunk(id));
  }, [id, authLoading, dispatch]);

  const handleCancel = () => {
    if (!window.confirm("Cancel this order? Your stock will be restored and refund (if applicable) will be processed.")) return;
    dispatch(cancelOrderThunk(id));
  };

  if (authLoading || orderLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error || "The order ID may be invalid or removed."}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm"
        >
          <ArrowLeft size={14} />
          My Orders
        </Link>
      </div>
    );
  }

  const orderId = order._id.slice(-8).toUpperCase();
  const currentStep = order.status === "cancelled" ? -1 : (statusToStep[order.status] ?? 0);
  const itemCount = order.items.reduce((n, it) => n + (it.quantity || 0), 0);
  const placedDate = new Date(order.createdAt);

  // Estimated delivery: place + 5 business days
  const estimatedDelivery = new Date(placedDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const etaLabel = estimatedDelivery.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <div className="max-w-[900px] mx-auto px-4 py-5 md:px-5 md:py-7">
      <Breadcrumbs
        items={[
          { label: "My Orders", to: "/orders" },
          { label: `Track #${orderId}` },
        ]}
        className="mb-4"
      />

      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-gray-900 leading-tight">Track your order</h1>
          <p className="text-[0.85rem] text-gray-400 mt-0.5">
            Order <span className="font-mono font-bold text-gray-700">#{orderId}</span>
          </p>
        </div>
        <OrderStatusBadge status={order.status} size="lg" />
      </div>

      {message && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-[0.875rem] font-medium text-green-700">{message}</p>
        </div>
      )}

      {/* TIMELINE — main visual */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden mb-5">
        {order.status === "cancelled" ? (
          /* Cancelled state */
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <XCircle size={28} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-red-600">Order Cancelled</h3>
              <p className="text-[0.85rem] text-gray-500 mt-1">Your refund will reach you within 3–5 business days.</p>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-7">
            {/* ETA banner */}
            {order.status !== "delivered" && (
              <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-gradient-to-r from-brand-light to-[#f5f0ff] border border-brand/20">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Truck size={18} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brand mb-0.5">Estimated Delivery</p>
                  <p className="text-[0.95rem] font-extrabold text-brand-dark leading-tight">By {etaLabel}</p>
                </div>
                <Clock size={16} className="text-brand-medium hidden sm:block" />
              </div>
            )}

            {order.status === "delivered" && (
              <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-green-700 mb-0.5">Delivered</p>
                  <p className="text-[0.95rem] font-extrabold text-green-800 leading-tight">Hope you're loving it!</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="flex flex-col">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const completed = i <= currentStep;
                const active = i === currentStep && currentStep < STEPS.length - 1;
                const isLast = i === STEPS.length - 1;

                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {/* Connector line */}
                    {!isLast && (
                      <span
                        className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                          i < currentStep ? "bg-gradient-to-b from-brand to-brand/40" : "bg-gray-200"
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all border-2 ${
                        completed
                          ? "bg-brand border-brand text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                          : "bg-white border-gray-200 text-gray-300"
                      } ${active ? "ring-4 ring-brand/15" : ""}`}
                    >
                      <Icon size={16} strokeWidth={completed ? 2.5 : 2} />
                    </div>

                    {/* Text */}
                    <div className="pb-7 last:pb-0 flex-1 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-[0.95rem] font-extrabold leading-tight ${completed ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        {active && (
                          <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-wider text-brand bg-brand-light px-2 py-0.5 rounded-full border border-brand/20">
                            <span className="w-1 h-1 rounded-full bg-brand animate-pulse" />
                            In progress
                          </span>
                        )}
                      </div>
                      <p className={`text-[0.8rem] mt-0.5 leading-snug ${completed ? "text-gray-500" : "text-gray-400"}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Items</p>
            <p className="text-[0.95rem] font-extrabold text-gray-900">{itemCount} units</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Total Paid</p>
            <p className="text-[0.95rem] font-extrabold text-brand">₹{order.totalAmount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex items-start gap-3 sm:col-span-1 col-span-1">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Shipping</p>
            <p className="text-[0.78rem] text-gray-700 leading-snug line-clamp-2">{order.shippingAddress}</p>
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card mb-5 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[0.92rem] font-extrabold text-gray-900">Order Contents</h2>
          <span className="text-[0.72rem] font-bold text-gray-400">{itemCount} units</span>
        </div>
        <ul className="p-2">
          {order.items.map((item, idx) => {
            const p = item.productId;
            return (
              <li
                key={p?._id || `${order._id}-${idx}`}
                className="flex gap-3 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <img
                  src={p?.image?.[0] || "/placeholder.jpg"}
                  alt={p?.name || "Product"}
                  className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[0.9rem] font-bold text-gray-900 line-clamp-2">
                    {p?.name || "Product no longer available"}
                  </h4>
                  <p className="text-[0.78rem] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-extrabold text-brand whitespace-nowrap text-[0.92rem]">
                  ₹{item.quantity * item.price}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <Link
          to={`/orders/${order._id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold no-underline transition-all hover:bg-gray-50 hover:border-gray-300 text-[0.88rem]"
        >
          View full details
          <ChevronRight size={14} />
        </Link>

        {order.status === "pending" && (
          <button
            onClick={handleCancel}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500 text-[0.88rem]"
          >
            <XCircle size={14} />
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
