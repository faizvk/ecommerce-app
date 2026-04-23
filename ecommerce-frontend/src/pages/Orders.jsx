import { useEffect, useMemo, memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrdersThunk } from "../redux/slice/orderSlice";
import { fadeIn } from "../animations/fadeIn";

const statusStyle = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped:    "bg-blue-100 text-blue-700 border-blue-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-600 border-red-200",
};

const OrderCard = memo(function OrderCard({ order }) {
  return (
    <div
      className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-card flex gap-5 items-start sm:flex-col sm:gap-4"
      {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
    >
      <div className="flex-1 flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base font-bold text-gray-900">#{order._id.slice(-6)}</span>
          <span className={`text-[0.75rem] font-bold px-2.5 py-1 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <p className="text-[0.85rem] text-gray-500">
          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>

        <p className="text-lg font-extrabold text-brand">₹{order.totalAmount}</p>
        <p className="text-[0.85rem] text-gray-500">{order.items.length} Items</p>

        <div className="flex gap-2 flex-wrap">
          {order.items.slice(0, 4).map((item, idx) => {
            const p = item.productId;
            return (
              <img
                key={p?._id || `${order._id}-${idx}`}
                src={p?.image?.[0] || "/placeholder.jpg"}
                alt={p?.name || "Product"}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-gray-50"
              />
            );
          })}
          {order.items.length > 4 && (
            <span className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 text-[0.75rem] font-bold text-gray-600">
              +{order.items.length - 4}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex flex-col gap-2 sm:flex-row sm:w-full"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        <Link
          to={`/track/${order._id}`}
          className="px-4 py-2.5 bg-brand text-white rounded-xl text-[0.85rem] font-semibold no-underline text-center transition-all hover:bg-brand-dark sm:flex-1"
        >
          Track Order
        </Link>
        <Link
          to={`/orders/${order._id}`}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[0.85rem] font-semibold no-underline text-center transition-all hover:bg-gray-200 sm:flex-1"
        >
          View Details
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
      <div className="max-w-[900px] mx-auto px-5 py-8 sm:px-4">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-8">My Orders</h1>
        <p className="text-center py-12 text-xl text-brand">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-5 py-8 sm:px-4 sm:py-6">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-8 sm:text-2xl sm:mb-6">My Orders</h1>

      {error && <p className="text-red-500 text-[0.875rem] mb-4">{error}</p>}

      {/* STATUS TABS */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2.5 rounded-full text-[0.875rem] font-semibold border-0 cursor-pointer whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-brand text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
            {categorized[tab].length > 0 && (
              <span className={`ml-2 text-[0.75rem] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20" : "bg-gray-200 text-gray-600"}`}>
                {categorized[tab].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {categorized[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <p className="text-lg text-gray-400">No {activeTab} orders yet.</p>
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
