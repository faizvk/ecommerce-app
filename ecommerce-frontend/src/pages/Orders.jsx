import { useEffect, useMemo, memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrdersThunk } from "../redux/slice/orderSlice";
import { fadeIn } from "../animations/fadeIn";
import { Package, MapPin, Clock, ChevronRight } from "lucide-react";

const STATUS_CONFIG = {
  pending:    { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  processing: { label: "Processing", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  shipped:    { label: "Shipped", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  delivered:  { label: "Delivered", cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-400" },
  cancelled:  { label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
};

const TAB_CONFIG = [
  { key: "pending", label: "Active" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const OrderCard = memo(function OrderCard({ order }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden hover:border-brand/20 hover:shadow-hover transition-all duration-200"
      {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2.5">
          <span className="text-[0.78rem] font-bold text-gray-500 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.75rem] text-gray-400">
          <Clock size={12} />
          {date}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-0 sm:flex-row sm:items-center p-5 gap-4">
        {/* Product thumbnails */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, idx) => {
              const p = item.productId;
              return (
                <img
                  key={p?._id || `${order._id}-${idx}`}
                  src={p?.image?.[0] || "/placeholder.jpg"}
                  alt={p?.name || "Product"}
                  className="w-12 h-12 object-cover rounded-xl border-2 border-white bg-gray-50 shadow-sm"
                />
              );
            })}
            {order.items.length > 3 && (
              <span className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-white bg-gray-100 text-[0.7rem] font-bold text-gray-500 shadow-sm">
                +{order.items.length - 3}
              </span>
            )}
          </div>

          <div className="ml-3 min-w-0">
            <p className="text-[0.82rem] text-gray-500">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
            <p className="text-lg font-extrabold text-brand">₹{order.totalAmount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:flex-shrink-0">
          <Link
            to={`/track/${order._id}`}
            className="flex items-center gap-1 px-4 py-2.5 bg-brand text-white rounded-xl text-[0.8rem] font-semibold no-underline transition-all hover:bg-brand-dark"
          >
            Track
            <ChevronRight size={13} />
          </Link>
          <Link
            to={`/orders/${order._id}`}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[0.8rem] font-semibold no-underline text-center transition-all hover:bg-gray-200"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
});

export default function Orders() {
  const dispatch = useDispatch();
  const { orders = [], loading, error } = useSelector((state) => state.order);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    dispatch(fetchOrdersThunk());
  }, [dispatch]);

  const categorized = useMemo(() => ({
    pending:   orders.filter((o) => o.status === "pending" || o.status === "processing"),
    shipped:   orders.filter((o) => o.status === "shipped"),
    delivered: orders.filter((o) => o.status === "delivered"),
    cancelled: orders.filter((o) => o.status === "cancelled"),
  }), [orders]);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track and manage all your orders</p>
        </div>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 md:py-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-[0.82rem] text-gray-400 mt-0.5">
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* TABS */}
      <div
        className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-0.5"
        {...fadeIn({ direction: "left", distance: 30, duration: 0.5 })}
      >
        {TAB_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-semibold border cursor-pointer whitespace-nowrap transition-all ${
              activeTab === key
                ? "bg-brand text-white border-brand shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand/30 hover:text-brand"
            }`}
            onClick={() => setActiveTab(key)}
          >
            {label}
            {categorized[key].length > 0 && (
              <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                activeTab === key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {categorized[key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {categorized[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package size={28} className="text-gray-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">
              No {TAB_CONFIG.find(t => t.key === activeTab)?.label.toLowerCase()} orders
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              {activeTab === "pending" ? "Place an order to get started." : `Your ${activeTab} orders will appear here.`}
            </p>
          </div>
          {activeTab === "pending" && (
            <Link
              to="/"
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm"
            >
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categorized[activeTab].map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
