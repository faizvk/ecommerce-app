import { useEffect, useState } from "react";
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
import { fetchProductsThunk } from "../redux/slice/productSlice";
import { adminFetchOrdersThunk } from "../redux/slice/orderSlice";
import { fetchAllUsersThunk } from "../redux/slice/userSlice";
import { Package, ShoppingCart, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";

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

const StatCard = ({ value, label, icon: Icon, color = "text-brand" }) => (
  <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card flex items-start gap-4">
    {Icon && (
      <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-brand" />
      </div>
    )}
    <div>
      <h2 className={`text-2xl font-extrabold ${color} leading-none mb-1`}>{value}</h2>
      <p className="text-[0.8rem] text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminHome() {
  const dispatch = useDispatch();

  const { users } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.product);
  const { adminOrders, loading } = useSelector((state) => state.order);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsersThunk());
    dispatch(fetchProductsThunk());
    dispatch(adminFetchOrdersThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!users || !products || !adminOrders) return;

    const today = new Date().toDateString();
    const todayOrders = adminOrders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
    const pendingOrders = adminOrders.filter((o) => o.status === "pending").length;
    const now = new Date();
    const revenueByDay = Array(7).fill(0);
    const ordersByDay = Array(7).fill(0);

    adminOrders.forEach((order) => {
      const diffDays = Math.floor((now - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 6) {
        const index = 6 - diffDays;
        if (order.status !== "cancelled") revenueByDay[index] += order.totalAmount;
        ordersByDay[index] += 1;
      }
    });

    const weeklyRevenue = revenueByDay.reduce((a, b) => a + b, 0);

    const productCount = {};
    adminOrders.forEach((order) => {
      order.items.forEach((item) => {
        const pid = item.productId?._id || item.productId;
        if (!pid) return;
        productCount[pid] = (productCount[pid] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => {
        const p = products.find((x) => x._id === id);
        if (!p) return null;
        return { id, qty, name: p.name, image: p.image?.[0] || "/placeholder.jpg", price: p.salePrice };
      })
      .filter(Boolean);

    const lowStock = products
      .filter((p) => !p.deleted && p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8);

    setStats({
      users: users.length,
      products: products.length,
      orders: adminOrders.length,
      todayOrders,
      pendingOrders,
      weeklyRevenue,
      revenueByDay,
      ordersByDay,
      recentUsers: users.slice(0, 5),
      topProducts,
      lowStock,
    });
  }, [users, products, adminOrders]);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  const revenueChartData = {
    labels: DAYS,
    datasets: [{
      label: "Revenue (₹)",
      data: stats.revenueByDay,
      backgroundColor: "rgba(56,89,139,0.55)",
      borderRadius: 6,
    }],
  };

  const ordersChartData = {
    labels: DAYS,
    datasets: [{
      label: "Orders",
      data: stats.ordersByDay,
      borderColor: "#38598b",
      backgroundColor: "rgba(56,89,139,0.08)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#38598b",
      pointRadius: 4,
    }],
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">Dashboard</h1>
        <p className="text-[0.875rem] text-gray-400 mt-0.5">Store performance overview</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 sm:grid-cols-1">
        <StatCard value={stats.products} label="Total Products" icon={Package} />
        <StatCard value={stats.orders} label="Total Orders" icon={ShoppingCart} />
        <StatCard value={stats.users} label="Total Users" icon={Users} />
        <StatCard value={stats.todayOrders} label="Today's Orders" icon={Clock} color="text-blue-600" />
        <StatCard value={stats.pendingOrders} label="Pending Orders" icon={AlertTriangle} color="text-yellow-600" />
        <StatCard value={`₹${stats.weeklyRevenue.toLocaleString("en-IN")}`} label="Weekly Revenue" icon={TrendingUp} color="text-green-600" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-1">
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
          <h3 className="text-[0.9rem] font-bold text-gray-700 mb-4">Weekly Revenue</h3>
          <Bar data={revenueChartData} options={CHART_OPTIONS} />
        </div>
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
          <h3 className="text-[0.9rem] font-bold text-gray-700 mb-4">Daily Orders</h3>
          <Line data={ordersChartData} options={CHART_OPTIONS} />
        </div>
      </div>

      {/* RECENT USERS */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
        <h2 className="text-[0.9rem] font-bold text-gray-700 mb-4">Recent Users</h2>
        <ul className="flex flex-col">
          {stats.recentUsers.map((u) => (
            <li key={u._id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
                  {u.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-semibold text-[0.875rem] text-gray-900">{u.name}</span>
              </div>
              <span className="text-[0.82rem] text-gray-400">{u.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* LOW STOCK ALERTS */}
      {stats.lowStock.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-[0.9rem] font-bold text-red-600">Low Stock Alert</h2>
            <span className="text-[0.72rem] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full ml-auto">
              {stats.lowStock.length} items
            </span>
          </div>
          <div className="flex flex-col">
            {stats.lowStock.map((p) => (
              <div key={p._id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <img src={p.image?.[0] || "/placeholder.jpg"} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-[0.72rem] text-gray-400 capitalize">{p.category}</p>
                </div>
                <span className={`text-[0.75rem] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  p.stock === 0
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP PRODUCTS */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
          <h2 className="text-[0.9rem] font-bold text-gray-700 mb-4">Top Selling Products</h2>
          <ul className="flex flex-col">
            {stats.topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <span className="w-6 text-center text-[0.75rem] font-bold text-gray-400">{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.875rem] font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-[0.78rem] text-brand font-semibold">₹{p.price}</p>
                </div>
                <span className="text-[0.75rem] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
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
