import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminFetchOrdersThunk,
  adminUpdateOrderStatusThunk,
  cancelOrderThunk,
} from "../redux/slice/orderSlice";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusStyle = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-600 border-red-200",
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
        <p className="text-center py-12 text-brand text-xl">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-brand-dark">Manage Orders</h1>

      {/* STATUS TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-wrap">
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer whitespace-nowrap transition-all ${
              activeTab === status
                ? "bg-brand text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
            }`}
            onClick={() => setActiveTab(status)}
          >
            {status.toUpperCase()} ({ordersByStatus[status].length})
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      {ordersByStatus[activeTab].length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-400 text-lg">No {activeTab} orders</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordersByStatus[activeTab].map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-card flex flex-col gap-5">
              {/* HEADER */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Order #{order._id.slice(-6)}</h3>
                  <p className="text-[0.8rem] text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-[0.75rem] font-bold px-3 py-1.5 rounded-full border ${statusStyle[order.status] || statusStyle.pending}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* CUSTOMER */}
              <div className="py-4 border-t border-gray-100">
                <p className="text-[0.8rem] font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</p>
                <p className="text-[0.9rem] font-semibold text-gray-900">
                  {order.userId?.name}{" "}
                  <span className="font-normal text-gray-500">({order.userId?.email})</span>
                </p>
                <p className="text-[0.85rem] text-gray-600 mt-1">
                  <span className="font-semibold">Address:</span> {order.shippingAddress}
                </p>
              </div>

              {/* ITEMS */}
              <div className="py-4 border-t border-gray-100">
                <p className="text-[0.8rem] font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</p>
                <div className="flex flex-col gap-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img
                        src={item.productId?.image?.[0] || "/placeholder.jpg"}
                        alt={item.productId?.name || "Product"}
                        className="w-12 h-12 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.9rem] font-semibold text-gray-900 truncate">{item.productId?.name}</p>
                        <p className="text-[0.8rem] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-brand text-[0.9rem] whitespace-nowrap">
                        ₹{item.quantity * item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-[0.9rem] font-semibold text-gray-600">Total Amount</span>
                <strong className="text-xl font-extrabold text-brand">₹{order.totalAmount}</strong>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 flex-wrap border-t border-gray-100 pt-3">
                {order.status === "pending" && (
                  <button
                    className="px-5 py-2.5 bg-brand text-white border-0 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-brand-dark"
                    onClick={() => updateStatus(order._id, "processing")}
                  >
                    Mark Processing
                  </button>
                )}
                {order.status === "processing" && (
                  <button
                    className="px-5 py-2.5 bg-brand text-white border-0 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-brand-dark"
                    onClick={() => updateStatus(order._id, "shipped")}
                  >
                    Mark Shipped
                  </button>
                )}
                {order.status === "shipped" && (
                  <button
                    className="px-5 py-2.5 bg-brand text-white border-0 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-brand-dark"
                    onClick={() => updateStatus(order._id, "delivered")}
                  >
                    Mark Delivered
                  </button>
                )}
                {(order.status === "pending" || order.status === "processing") && (
                  <button
                    className="px-5 py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
