import { useEffect, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { Package, ShoppingCart, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";

import { fetchProductsThunk } from "../redux/slice/productSlice";
import { adminFetchOrdersThunk } from "../redux/slice/orderSlice";
import { fetchAllUsersThunk } from "../redux/slice/userSlice";
import { computeDashboardStats } from "./utils/dashboardStats";
import PageHeader from "./components/PageHeader";
import AdminLoader from "./components/AdminLoader";
import StatCard from "./components/StatCard";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const CHART_OPTIONS = {
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false } },
  },
  responsive: true,
  maintainAspectRatio: true,
};

export default function AdminHome() {
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.product);
  const { adminOrders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchAllUsersThunk());
    dispatch(fetchProductsThunk());
    dispatch(adminFetchOrdersThunk());
  }, [dispatch]);

  const stats = useMemo(() => {
    if (!users || !products || !adminOrders) return null;
    return computeDashboardStats({ users, products, orders: adminOrders });
  }, [users, products, adminOrders]);

  if (loading || !stats) return <AdminLoader />;

  const revenueChartData = {
    labels: stats.daysOfWeek,
    datasets: [{
      label: "Revenue (₹)",
      data: stats.revenueByDay,
      backgroundColor: "rgba(79,70,229,0.55)",
      borderRadius: 6,
    }],
  };

  const ordersChartData = {
    labels: stats.daysOfWeek,
    datasets: [{
      label: "Orders",
      data: stats.ordersByDay,
      borderColor: "#4f46e5",
      backgroundColor: "rgba(79,70,229,0.08)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#4f46e5",
      pointRadius: 4,
    }],
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader title="Dashboard" subtitle="Store performance overview" />

      {/* STATS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard value={stats.products} label="Total Products" icon={Package} />
        <StatCard value={stats.orders} label="Total Orders" icon={ShoppingCart} />
        <StatCard value={stats.users} label="Total Users" icon={Users} />
        <StatCard
          value={stats.todayOrders}
          label="Today's Orders"
          icon={Clock}
          color="text-blue-600"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          value={stats.pendingOrders}
          label="Pending Orders"
          icon={AlertTriangle}
          color="text-amber-600"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          value={`₹${stats.weeklyRevenue.toLocaleString("en-IN")}`}
          label="Weekly Revenue"
          icon={TrendingUp}
          color="text-green-600"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h3 className="text-[0.92rem] font-bold text-gray-700 mb-4">Weekly Revenue</h3>
          <Bar data={revenueChartData} options={CHART_OPTIONS} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h3 className="text-[0.92rem] font-bold text-gray-700 mb-4">Daily Orders</h3>
          <Line data={ordersChartData} options={CHART_OPTIONS} />
        </div>
      </div>

      {/* RECENT USERS + LOW STOCK */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* RECENT USERS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h2 className="text-[0.92rem] font-bold text-gray-700 mb-4">Recent Users</h2>
          {stats.recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No users yet</p>
          ) : (
            <ul className="flex flex-col">
              {stats.recentUsers.map((u) => (
                <li key={u._id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-[0.78rem] flex-shrink-0">
                      {u.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[0.875rem] text-gray-900 truncate">{u.name}</p>
                      <p className="text-[0.75rem] text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* LOW STOCK */}
        <div className={`bg-white rounded-2xl border p-5 shadow-card ${stats.lowStock.length > 0 ? "border-red-200" : "border-gray-100"}`}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className={stats.lowStock.length > 0 ? "text-red-500" : "text-gray-400"} />
            <h2 className={`text-[0.92rem] font-bold ${stats.lowStock.length > 0 ? "text-red-600" : "text-gray-700"}`}>
              Low Stock Alerts
            </h2>
            {stats.lowStock.length > 0 && (
              <span className="text-[0.7rem] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full ml-auto">
                {stats.lowStock.length}
              </span>
            )}
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">All products well stocked ✓</p>
          ) : (
            <div className="flex flex-col">
              {stats.lowStock.map((p) => (
                <div key={p._id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <img src={p.image?.[0] || "/placeholder.jpg"} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.85rem] font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[0.72rem] text-gray-400 capitalize">{p.category}</p>
                  </div>
                  <span className={`text-[0.72rem] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    p.stock === 0 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP PRODUCTS */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <h2 className="text-[0.92rem] font-bold text-gray-700 mb-4">Top Selling Products</h2>
          <ul className="flex flex-col">
            {stats.topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <span className="w-6 text-center text-[0.78rem] font-bold text-gray-400 flex-shrink-0">{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.875rem] font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-[0.78rem] text-brand font-semibold">₹{p.price}</p>
                </div>
                <span className="text-[0.72rem] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  {p.qty} sold
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
