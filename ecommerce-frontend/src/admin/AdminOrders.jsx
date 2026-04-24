import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminFetchOrdersThunk,
  adminUpdateOrderStatusThunk,
  cancelOrderThunk,
} from "../redux/slice/orderSlice";
import { Package, MapPin, User } from "lucide-react";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusStyle = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-600 border-red-200",
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { adminOrders, loading } = useSelector((state) => state.order);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    dispatch(adminFetchOrdersThunk());
  }, [dispatch]);

  const ordersByStatus = useMemo(() => {
    const map = {};
    STATUSES.forEach((s) => (map[s] = []));
    adminOrders.forEach((o) => { if (map[o.status]) map[o.status].push(o); });
    return map;
  }, [adminOrders]);

  const updateStatus = (orderId, newStatus) => {
    dispatch(adminUpdateOrderStatusThunk({ orderId, status: newStatus }));
  };

  const handleCancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    dispatch(cancelOrderThunk(orderId));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-brand-dark">Manage Orders</h1>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand-dark">Manage Orders</h1>

      {/* STATUS TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-full text-[0.8rem] font-semibold border-0 cursor-pointer whitespace-nowrap transition-all ${
              activeTab === status
                ? "bg-brand text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
            }`}
            onClick={() => setActiveTab(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className={`ml-1.5 text-[0.7rem] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === status ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {ordersByStatus[status].length}
            </span>
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      {ordersByStatus[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Package size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No {activeTab} orders</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordersByStatus[activeTab].map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card flex flex-col gap-4">
              {/* HEADER */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-[0.75rem] text-gray-400">Order ID</span>
                  <h3 className="text-[0.9rem] font-bold text-gray-900 font-mono">
                    #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-[0.78rem] text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className={`text-[0.72rem] font-bold px-3 py-1 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* CUSTOMER */}
              <div className="flex items-start gap-2 py-3 border-t border-gray-100">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[0.875rem] font-semibold text-gray-900">
                    {order.userId?.name}{" "}
                    <span className="font-normal text-gray-400 text-[0.8rem]">({order.userId?.email})</span>
                  </p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[0.8rem] text-gray-500">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="py-3 border-t border-gray-100">
                <p className="text-[0.72rem] font-bold text-gray-400 uppercase tracking-wider mb-3">Items</p>
                <div className="flex flex-col gap-2.5">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img
                        src={item.productId?.image?.[0] || "/placeholder.jpg"}
                        alt={item.productId?.name || "Product"}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.875rem] font-semibold text-gray-900 truncate">{item.productId?.name}</p>
                        <p className="text-[0.78rem] text-gray-400">Qty: {item.quantity}</p>
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
                <span className="text-xl font-extrabold text-brand">₹{order.totalAmount}</span>

                <div className="flex gap-2 flex-wrap">
                  {order.status === "pending" && (
                    <button
                      className="px-4 py-2 bg-brand text-white border-0 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-brand-dark"
                      onClick={() => updateStatus(order._id, "processing")}
                    >
                      Mark Processing
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button
                      className="px-4 py-2 bg-brand text-white border-0 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-brand-dark"
                      onClick={() => updateStatus(order._id, "shipped")}
                    >
                      Mark Shipped
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white border-0 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-green-700"
                      onClick={() => updateStatus(order._id, "delivered")}
                    >
                      Mark Delivered
                    </button>
                  )}
                  {(order.status === "pending" || order.status === "processing") && (
                    <button
                      className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500"
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
