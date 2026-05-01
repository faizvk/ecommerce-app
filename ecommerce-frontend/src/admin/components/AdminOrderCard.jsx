import { memo } from "react";
import { User, MapPin, Clock } from "lucide-react";
import { ORDER_STATUS_CONFIG, NEXT_STATUS } from "../constants";

const AdminOrderCard = memo(function AdminOrderCard({ order, busy, onAdvance, onCancel }) {
  const status = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const next = NEXT_STATUS[order.status];
  const canCancel = order.status === "pending" || order.status === "processing";
  const date = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/60 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[0.78rem] font-bold text-gray-500 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.72rem] text-gray-400 whitespace-nowrap">
          <Clock size={11} />
          {date}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 flex flex-col gap-4">
        {/* CUSTOMER */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.875rem] font-semibold text-gray-900">
              {order.userId?.name || "Guest"}
              {order.userId?.email && (
                <span className="font-normal text-gray-400 text-[0.78rem] ml-1">
                  ({order.userId.email})
                </span>
              )}
            </p>
            <div className="flex items-start gap-1 mt-1">
              <MapPin size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-[0.78rem] text-gray-500 leading-relaxed">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div>
          <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img
                  src={item.productId?.image?.[0] || "/placeholder.jpg"}
                  alt={item.productId?.name || "Product"}
                  className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] font-semibold text-gray-900 truncate">
                    {item.productId?.name || "Product unavailable"}
                  </p>
                  <p className="text-[0.75rem] text-gray-400">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="font-bold text-brand text-[0.875rem] whitespace-nowrap">
                  ₹{item.quantity * item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL + ACTIONS */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-gray-100">
          <div>
            <p className="text-[0.72rem] text-gray-400">Total Amount</p>
            <p className="text-xl font-extrabold text-brand">₹{order.totalAmount}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {next && (
              <button
                disabled={busy}
                className={`px-4 py-2 text-white border-0 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all disabled:opacity-50 ${
                  next.next === "delivered" ? "bg-green-600 hover:bg-green-700" : "bg-brand hover:bg-brand-dark"
                }`}
                onClick={() => onAdvance(order._id, next.next)}
              >
                {next.label}
              </button>
            )}
            {canCancel && (
              <button
                disabled={busy}
                className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-50"
                onClick={() => onCancel(order._id)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminOrderCard;
