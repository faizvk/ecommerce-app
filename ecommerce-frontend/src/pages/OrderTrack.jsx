import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { trackOrderThunk, cancelOrderThunk } from "../redux/slice/orderSlice";

const statusStyle = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped:    "bg-blue-100 text-blue-700 border-blue-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-600 border-red-200",
};

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
    dispatch(cancelOrderThunk(id));
  };

  if (authLoading || orderLoading) {
    return <p className="text-center py-12 text-xl text-brand">Loading...</p>;
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-5 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500">{error || "The order ID may be invalid or removed."}</p>
      </div>
    );
  }

  const steps = ["Ordered", "Shipped", "Delivered"];
  const currentStep =
    order.status === "pending" ? 0
    : order.status === "shipped" ? 1
    : order.status === "delivered" ? 2
    : -1;

  return (
    <div className="max-w-[900px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-8 sm:text-2xl sm:mb-6">Track Your Order</h1>

      {message && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-[0.875rem] font-medium text-green-700">{message}</p>
        </div>
      )}

      <div className="flex gap-6 items-start lg:flex-col">
        {/* ORDER TIMELINE */}
        <div className="w-[280px] bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card lg:w-full">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>

          {order.status === "cancelled" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 text-2xl font-bold flex items-center justify-center border-2 border-red-300">
                ✕
              </div>
              <p className="text-base font-semibold text-red-600">Order Cancelled</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {steps.map((label, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.875rem] font-bold border-2 transition-all ${
                        i <= currentStep
                          ? "bg-brand border-brand text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {i <= currentStep ? "✔" : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-8 ${i < currentStep ? "bg-brand" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <span className={`text-[0.9rem] font-semibold ${i <= currentStep ? "text-brand" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORDER DETAILS */}
        <div className="flex-1 bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[0.85rem] text-gray-500">Order ID</p>
            <p className="text-[0.875rem] font-mono font-semibold text-gray-800">{order._id}</p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 py-3 border-t border-gray-100">
            <p className="text-[0.85rem] text-gray-500">Status</p>
            <span className={`text-[0.8rem] font-bold px-3 py-1.5 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 py-3 border-t border-gray-100">
            <p className="text-[0.85rem] text-gray-500">Total Amount</p>
            <p className="text-xl font-extrabold text-brand">₹{order.totalAmount}</p>
          </div>

          <div className="py-3 border-t border-gray-100">
            <p className="text-[0.85rem] text-gray-500 mb-1.5">Shipping Address</p>
            <p className="text-[0.95rem] text-gray-700 leading-relaxed">{order.shippingAddress}</p>
          </div>

          {order.status === "pending" && (
            <button
              className="mt-2 py-3 px-5 bg-red-500 text-white border-0 rounded-xl font-semibold cursor-pointer transition-all hover:bg-red-700 hover:-translate-y-px"
              onClick={handleCancel}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* ORDER ITEMS */}
      <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">Items in Your Order</h2>

      <div className="bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card flex flex-col gap-4">
        {order.items.map((item, idx) => {
          const product = item.productId;
          return (
            <div key={product?._id || idx} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
              <img
                src={product?.image?.[0] || "/placeholder.jpg"}
                alt={product?.name || "Product removed"}
                className="w-16 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-[0.95rem] font-semibold text-gray-900 line-clamp-2">
                  {product?.name || "Product Unavailable"}
                </h4>
                <p className="text-[0.85rem] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-brand whitespace-nowrap">₹{item.quantity * item.price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
