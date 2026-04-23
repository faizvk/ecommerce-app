import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../redux/slice/productSlice";
import { adminFetchOrdersThunk } from "../redux/slice/orderSlice";
import { fetchAllUsersThunk } from "../redux/slice/userSlice";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const StatCard = ({ value, label, color = "brand" }) => (
  <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card flex flex-col gap-1">
    <h2 className={`text-3xl font-extrabold text-${color} sm:text-2xl`}>{value}</h2>
    <p className="text-[0.85rem] text-gray-500 font-medium">{label}</p>
  </div>
);

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
    });
  }, [users, products, adminOrders]);

  if (loading || !stats) {
    return <p className="text-center py-12 text-xl text-brand">Loading dashboard...</p>;
  }

  const revenueChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ label: "Revenue (₹)", data: stats.revenueByDay, backgroundColor: "rgba(56,89,139,0.5)", borderRadius: 6 }],
  };

  const ordersChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ label: "Orders", data: stats.ordersByDay, borderColor: "#38598b", backgroundColor: "rgba(56,89,139,0.1)", tension: 0.3, fill: true }],
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">Dashboard Overview</h1>
        <p className="text-[0.875rem] text-gray-500 mt-1">Store activity summary</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-5 lg:grid-cols-2 sm:grid-cols-1">
        <StatCard value={stats.products} label="Total Products" />
        <StatCard value={stats.orders} label="Total Orders" />
        <StatCard value={stats.users} label="Total Users" />
        <StatCard value={stats.todayOrders} label="Today's Orders" color="blue-600" />
        <StatCard value={stats.pendingOrders} label="Pending Orders" color="yellow-600" />
        <StatCard value={`₹${stats.weeklyRevenue}`} label="Weekly Revenue" color="green-600" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
          <h3 className="text-base font-bold text-gray-800 mb-4">Weekly Revenue</h3>
          <Bar data={revenueChartData} options={{ plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
          <h3 className="text-base font-bold text-gray-800 mb-4">Daily Orders</h3>
          <Line data={ordersChartData} options={{ plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* RECENT USERS */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Users</h2>
        <ul className="flex flex-col gap-2">
          {stats.recentUsers.map((u) => (
            <li key={u._id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
              <span className="font-semibold text-[0.9rem] text-gray-900">{u.name}</span>
              <span className="text-[0.85rem] text-gray-500">{u.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* TOP PRODUCTS */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Top Selling Products</h2>
        <ul className="flex flex-col gap-3">
          {stats.topProducts.map((p) => (
            <li key={p.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
              <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[0.9rem] font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-[0.8rem] text-brand font-semibold">₹{p.price}</p>
              </div>
              <span className="text-[0.8rem] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                Sold: {p.qty}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
