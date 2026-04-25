import { useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { trackOrderThunk, cancelOrderThunk } from "../redux/slice/orderSlice";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

const statusStyle = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped:    "bg-blue-50 text-blue-700 border-blue-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-600 border-red-200",
};

const steps = [
  { label: "Ordered", desc: "Your order has been placed" },
  { label: "Shipped", desc: "Your order is on the way" },
  { label: "Delivered", desc: "Order delivered successfully" },
];

export default function OrderTrack() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { currentOrder: order, loading: orderLoading, error, message } = useSelector((state) => state.order);

  if (!authLoading && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (authLoading) return;
    dispatch(trackOrderThunk(id));
  }, [id, authLoading, dispatch]);

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
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
      <div className="max-w-[900px] mx-auto px-4 py-16 md:px-6 text-center">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error || "The order ID may be invalid or removed."}</p>
        <Link to="/orders" className="px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm">
          My Orders
        </Link>
      </div>
    );
  }

  const currentStep =
    order.status === "pending" || order.status === "processing" ? 0
    : order.status === "shipped" ? 1
    : order.status === "delivered" ? 2
    : -1;

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-xl md:text-2xl font-extrabold text-brand-dark">Track Order</h1>
        <span className={`text-[0.75rem] font-bold px-3 py-1 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {message && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-[0.875rem] font-medium text-green-700">{message}</p>
        </div>
      )}

      {/* Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        {/* ORDER TIMELINE */}
        <div className="w-full md:w-[260px] bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card flex-shrink-0">
          <h2 className="text-[0.9rem] font-bold text-gray-800 mb-5">Order Status</h2>

          {order.status === "cancelled" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={24} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.8rem] font-bold border-2 transition-all flex-shrink-0 ${
                        i <= currentStep
                          ? "bg-brand border-brand text-white"
                          : "bg-gray-100 border-gray-200 text-gray-400"
                      }`}
                    >
                      {i <= currentStep ? "✔" : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-0.5 ${i < currentStep ? "bg-brand" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-8 last:pb-0">
                    <p className={`text-[0.875rem] font-semibold ${i <= currentStep ? "text-brand-dark" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {i <= currentStep && (
                      <p className="text-[0.75rem] text-gray-400 mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORDER DETAILS */}
        <div className="flex-1 bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[0.8rem] text-gray-400">Order ID</p>
            <p className="text-[0.875rem] font-mono font-bold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-gray-100">
            <p className="text-[0.8rem] text-gray-400">Total Amount</p>
            <p className="text-xl font-extrabold text-brand">₹{order.totalAmount}</p>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin size={14} className="text-brand" />
              <p className="text-[0.8rem] text-gray-400">Shipping Address</p>
            </div>
            <p className="text-[0.9rem] text-gray-700 leading-relaxed">{order.shippingAddress}</p>
          </div>

          <div className="flex flex-col gap-2 mt-1 sm:flex-row">
            <Link
              to={`/orders/${order._id}`}
              className="flex-1 py-2.5 text-center bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold no-underline transition-all hover:bg-gray-200"
            >
              View Details
            </Link>
            {order.status === "pending" && (
              <button
                className="flex-1 py-2.5 bg-red-500 text-white border-0 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-600 text-sm"
                onClick={handleCancel}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ORDER ITEMS */}
      <h2 className="text-lg font-bold text-brand-dark mt-8 mb-4">Items in Your Order</h2>

      <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card flex flex-col gap-3">
        {order.items.map((item, idx) => {
          const product = item.productId;
          return (
            <div key={product?._id || idx} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
              <img
                src={product?.image?.[0] || "/placeholder.jpg"}
                alt={product?.name || "Product removed"}
                className="w-14 h-14 object-cover rounded-xl bg-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-[0.9rem] font-semibold text-gray-900 line-clamp-2">
                  {product?.name || "Product Unavailable"}
                </h4>
                <p className="text-[0.8rem] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-brand whitespace-nowrap text-sm">₹{item.quantity * item.price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
