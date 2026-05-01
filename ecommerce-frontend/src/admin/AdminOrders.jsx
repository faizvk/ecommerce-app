import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Package } from "lucide-react";
import {
  adminFetchOrdersThunk,
  adminUpdateOrderStatusThunk,
  cancelOrderThunk,
} from "../redux/slice/orderSlice";
import { ORDER_STATUSES, ORDER_STATUS_CONFIG } from "./constants";
import PageHeader from "./components/PageHeader";
import AdminLoader from "./components/AdminLoader";
import EmptyState from "./components/EmptyState";
import ConfirmDialog from "./components/ConfirmDialog";
import AdminOrderCard from "./components/AdminOrderCard";

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { adminOrders, loading } = useSelector((state) => state.order);
  const [activeTab, setActiveTab] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    dispatch(adminFetchOrdersThunk());
  }, [dispatch]);

  const ordersByStatus = useMemo(() => {
    const map = Object.fromEntries(ORDER_STATUSES.map((s) => [s, []]));
    adminOrders.forEach((o) => { if (map[o.status]) map[o.status].push(o); });
    return map;
  }, [adminOrders]);

  const handleAdvance = async (orderId, nextStatus) => {
    setBusyId(orderId);
    try {
      await dispatch(adminUpdateOrderStatusThunk({ orderId, status: nextStatus })).unwrap();
      toast.success(`Order marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget);
    try {
      await dispatch(cancelOrderThunk(cancelTarget)).unwrap();
      toast.success("Order cancelled");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err || "Failed to cancel order");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Orders"
        subtitle={`${adminOrders.length} total orders`}
      />

      {/* STATUS TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {ORDER_STATUSES.map((status) => {
          const cfg = ORDER_STATUS_CONFIG[status];
          const count = ordersByStatus[status]?.length || 0;
          const isActive = activeTab === status;
          return (
            <button
              key={status}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-semibold border cursor-pointer whitespace-nowrap transition-all ${
                isActive
                  ? "bg-brand text-white border-brand shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand/30 hover:text-brand"
              }`}
              onClick={() => setActiveTab(status)}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : cfg.dot}`} />
              {cfg.label}
              <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <AdminLoader />
      ) : ordersByStatus[activeTab].length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No ${ORDER_STATUS_CONFIG[activeTab].label.toLowerCase()} orders`}
          description={`Orders with status "${activeTab}" will appear here.`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {ordersByStatus[activeTab].map((order) => (
            <AdminOrderCard
              key={order._id}
              order={order}
              busy={busyId === order._id}
              onAdvance={handleAdvance}
              onCancel={(id) => setCancelTarget(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this order?"
        message="The order will be marked as cancelled and the customer will be notified."
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        loading={busyId === cancelTarget}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
