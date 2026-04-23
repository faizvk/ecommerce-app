import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { trackOrderThunk } from "../redux/slice/orderSlice";

const statusStyle = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped:    "bg-blue-100 text-blue-700 border-blue-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-600 border-red-200",
};

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder: order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(trackOrderThunk(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-5 py-8 sm:px-4">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-8">Order Details</h1>
        <p className="text-center py-12 text-xl text-brand">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-5 py-8 sm:px-4">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-4">Order Details</h1>
        <p className="text-red-500">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-8 sm:text-2xl sm:mb-6">Order Details</h1>

      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card mb-5 flex justify-between items-start sm:flex-col sm:gap-3">
        <div>
          <p className="text-lg font-bold text-gray-900">Order ID: #{order._id.slice(-6)}</p>
          <p className="text-[0.875rem] text-gray-500 mt-1">
            Ordered on:{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <span className={`text-[0.8rem] font-bold px-3 py-1.5 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* SHIPPING */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card mb-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping Address</h2>
        <p className="text-[0.95rem] text-gray-600 leading-relaxed">{order.shippingAddress}</p>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card mb-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Items in this Order</h2>

        <div className="flex flex-col gap-4">
          {order.items.map((item, idx) => {
            const p = item.productId;
            return (
              <div key={p?._id || `${order._id}-${idx}`} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
                <img
                  src={p?.image?.[0] || "/placeholder.jpg"}
                  alt={p?.name || "Product removed"}
                  className="w-16 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.95rem] font-semibold text-gray-900 line-clamp-2">
                    {p?.name || "Product Unavailable"}
                  </h3>
                  <p className="text-[0.85rem] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-brand whitespace-nowrap">₹{item.quantity * item.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOTAL */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-6 shadow-card mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Total Paid</h2>
        <span className="text-2xl font-extrabold text-brand">₹{order.totalAmount}</span>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 sm:flex-col">
        <Link
          to={`/track/${order._id}`}
          className="px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline text-center transition-all hover:bg-brand-dark hover:-translate-y-px"
        >
          Track Order
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold no-underline text-center transition-all hover:bg-gray-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
