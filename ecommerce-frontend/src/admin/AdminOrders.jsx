import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../utils/notify";
import { Package, Download, Search, X as XIcon } from "lucide-react";
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
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(adminFetchOrdersThunk());
  }, [dispatch]);

  // Apply text search across order id / customer name / email / product names
  const matchesQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (order) => {
      if (!q) return true;
      const userName = order.userId?.name || "";
      const userEmail = order.userId?.email || "";
      const productNames = (order.items || []).map((it) => it.productId?.name || "").join(" ");
      const hay = `${order._id} ${userName} ${userEmail} ${productNames}`.toLowerCase();
      return hay.includes(q);
    };
  }, [query]);

  const ordersByStatus = useMemo(() => {
    const map = Object.fromEntries(ORDER_STATUSES.map((s) => [s, []]));
    adminOrders.filter(matchesQuery).forEach((o) => { if (map[o.status]) map[o.status].push(o); });
    return map;
  }, [adminOrders, matchesQuery]);

  // Export the currently-visible tab to CSV. Cheaper than a backend endpoint
  // and the data is already on the client — Excel/Sheets opens it natively.
  const exportCSV = () => {
    const rows = ordersByStatus[activeTab];
    if (rows.length === 0) {
      notify.info("No orders to export in this tab");
      return;
    }
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const headers = ["Order ID", "Date", "Status", "Customer", "Email", "Items", "Total (₹)"];
    const lines = [
      headers.join(","),
      ...rows.map((o) => [
        esc(o._id),
        esc(new Date(o.createdAt).toISOString()),
        esc(o.status),
        esc(o.userId?.name),
        esc(o.userId?.email),
        esc((o.items || []).map((it) => `${it.productId?.name || it.productId} x${it.quantity}`).join(" | ")),
        esc(o.totalAmount),
      ].join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `orders-${activeTab}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify.success(`Exported ${rows.length} ${activeTab} orders`);
  };

  const handleAdvance = async (orderId, nextStatus) => {
    setBusyId(orderId);
    try {
      await dispatch(adminUpdateOrderStatusThunk({ orderId, status: nextStatus })).unwrap();
      notify.success(`Order marked as ${nextStatus}`);
    } catch (err) {
      notify.error(err || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget);
    try {
      await dispatch(cancelOrderThunk(cancelTarget)).unwrap();
      notify.success("Order cancelled");
      setCancelTarget(null);
    } catch (err) {
      notify.error(err || "Failed to cancel order");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Orders"
        subtitle={`${adminOrders.length} total orders`}
        action={
          <button
            onClick={exportCSV}
            disabled={ordersByStatus[activeTab].length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm transition-all hover:border-brand hover:text-brand cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download the current tab as CSV"
          >
            <Download size={15} />
            Export CSV
          </button>
        }
      />

      {/* SEARCH */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID, customer, email, or product…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)] transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

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
