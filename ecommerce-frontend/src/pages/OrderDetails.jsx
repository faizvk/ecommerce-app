import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { trackOrderThunk } from "../redux/slice/orderSlice";
import { MapPin, Package } from "lucide-react";

const statusStyle = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped:    "bg-blue-50 text-blue-700 border-blue-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-600 border-red-200",
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
      <div className="max-w-[900px] mx-auto px-6 py-8 sm:px-4">
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-16 sm:px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error || "This order may not exist or has been removed."}</p>
        <Link to="/orders" className="px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 sm:px-4 sm:py-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-xl">Order Details</h1>
        <span className={`text-[0.75rem] font-bold px-3 py-1 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card mb-4 flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
        <div>
          <p className="text-[0.8rem] text-gray-400 mb-0.5">Order ID</p>
          <p className="text-base font-bold text-gray-900 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right sm:text-left">
          <p className="text-[0.8rem] text-gray-400 mb-0.5">Placed On</p>
          <p className="text-[0.9rem] font-semibold text-gray-700">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* SHIPPING */}
      <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-brand" />
          <h2 className="text-[0.9rem] font-bold text-gray-800">Shipping Address</h2>
        </div>
        <p className="text-[0.9rem] text-gray-600 leading-relaxed">{order.shippingAddress}</p>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card mb-4">
        <h2 className="text-[0.9rem] font-bold text-gray-800 mb-4">Items in this Order</h2>

        <div className="flex flex-col gap-3">
          {order.items.map((item, idx) => {
            const p = item.productId;
            return (
              <div key={p?._id || `${order._id}-${idx}`} className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0">
                <img
                  src={p?.image?.[0] || "/placeholder.jpg"}
                  alt={p?.name || "Product removed"}
                  className="w-14 h-14 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.9rem] font-semibold text-gray-900 line-clamp-2">
                    {p?.name || "Product Unavailable"}
                  </h3>
                  <p className="text-[0.8rem] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-brand whitespace-nowrap">₹{item.quantity * item.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOTAL */}
      <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card mb-6 flex justify-between items-center">
        <span className="text-[0.9rem] font-semibold text-gray-600">Total Paid</span>
        <span className="text-2xl font-extrabold text-brand">₹{order.totalAmount}</span>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 sm:flex-col">
        <Link
          to={`/track/${order._id}`}
          className="px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline text-center transition-all hover:bg-brand-dark text-sm"
        >
          Track Order
        </Link>
        <Link
          to="/orders"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold no-underline text-center transition-all hover:bg-gray-200 text-sm"
        >
          All Orders
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold no-underline text-center transition-all hover:bg-gray-50 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
