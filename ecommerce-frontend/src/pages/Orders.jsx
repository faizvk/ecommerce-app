import { useEffect, useMemo, memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrdersThunk } from "../redux/slice/orderSlice";
import { fadeIn } from "../animations/fadeIn";
import { Package } from "lucide-react";

const statusStyle = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped:    "bg-blue-50 text-blue-700 border-blue-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-600 border-red-200",
};

const statusLabel = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

const OrderCard = memo(function OrderCard({ order }) {
  return (
    <div
      className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-card flex gap-5 items-start sm:flex-col sm:gap-4 hover:border-brand/20 transition-colors"
      {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}
    >
      <div className="flex-1 flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.875rem] font-bold text-gray-900 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </span>
          <span className={`text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
            {statusLabel[order.status] || order.status.toUpperCase()}
          </span>
        </div>

        <p className="text-[0.82rem] text-gray-400">
          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl font-extrabold text-brand">₹{order.totalAmount}</span>
          <span className="text-[0.8rem] text-gray-400">{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
        </div>

        <div className="flex gap-2 flex-wrap mt-1">
          {order.items.slice(0, 4).map((item, idx) => {
            const p = item.productId;
            return (
              <img
                key={p?._id || `${order._id}-${idx}`}
                src={p?.image?.[0] || "/placeholder.jpg"}
                alt={p?.name || "Product"}
                className="w-11 h-11 object-cover rounded-lg border border-gray-200 bg-gray-50"
              />
            );
          })}
          {order.items.length > 4 && (
            <span className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 text-[0.72rem] font-bold text-gray-500">
              +{order.items.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:w-full">
        <Link
          to={`/track/${order._id}`}
          className="px-4 py-2.5 bg-brand text-white rounded-xl text-[0.83rem] font-semibold no-underline text-center transition-all hover:bg-brand-dark sm:flex-1"
        >
          Track Order
        </Link>
        <Link
          to={`/orders/${order._id}`}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[0.83rem] font-semibold no-underline text-center transition-all hover:bg-gray-200 sm:flex-1"
        >
          Details
        </Link>
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

  const tabs = ["pending", "shipped", "delivered", "cancelled"];

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-8 sm:px-4">
        <h1 className="text-2xl font-extrabold text-brand-dark mb-8">My Orders</h1>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 sm:px-4 sm:py-6">
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6 sm:text-xl">My Orders</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* STATUS TABS */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1"
        {...fadeIn({ direction: "left", distance: 30, duration: 0.5 })}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-full text-[0.83rem] font-semibold border-0 cursor-pointer whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-brand text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
            {categorized[tab].length > 0 && (
              <span className={`ml-2 text-[0.72rem] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {categorized[tab].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {categorized[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package size={28} className="text-gray-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-600">No {activeTab} orders</p>
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
        <div className="flex flex-col gap-4">
          {categorized[activeTab].map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
