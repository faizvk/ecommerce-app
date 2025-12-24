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

import "./styles/AdminHome.css";

/* =========================
   CHART REGISTRATION
========================= */
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function AdminHome() {
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const { users } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.product);
  const { adminOrders, loading } = useSelector((state) => state.order);

  /* =========================
     LOCAL DERIVED STATS
  ========================= */
  const [stats, setStats] = useState(null);

  /* =========================
     LOAD RAW DATA
  ========================= */
  useEffect(() => {
    dispatch(fetchAllUsersThunk());
    dispatch(fetchProductsThunk());
    dispatch(adminFetchOrdersThunk());
  }, [dispatch]);

  /* =========================
     DERIVE DASHBOARD STATS
  ========================= */
  useEffect(() => {
    if (!users || !products || !adminOrders) return;

    const today = new Date().toDateString();

    const todayOrders = adminOrders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    ).length;

    const pendingOrders = adminOrders.filter(
      (o) => o.status === "pending"
    ).length;

    const now = new Date();
    const revenueByDay = Array(7).fill(0);
    const ordersByDay = Array(7).fill(0);

    adminOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 6) {
        const index = 6 - diffDays;

        if (order.status !== "cancelled") {
          revenueByDay[index] += order.totalAmount;
        }

        ordersByDay[index] += 1;
      }
    });

    const weeklyRevenue = revenueByDay.reduce((a, b) => a + b, 0);

    /* ---------- TOP PRODUCTS ---------- */
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

        return {
          id,
          qty,
          name: p.name,
          image: p.image?.[0] || "/placeholder.jpg",
          price: p.salePrice,
        };
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

  /* =========================
     LOADING
  ========================= */
  if (loading || !stats) {
    return <p className="loading">Loading dashboard...</p>;
  }

  /* =========================
     CHART DATA
  ========================= */
  const revenueChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue (₹)",
        data: stats.revenueByDay,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const ordersChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Orders",
        data: stats.ordersByDay,
        borderColor: "#1d4768",
        tension: 0.3,
      },
    ],
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="admin-home">
      <h1>Dashboard Overview</h1>
      <p className="subtitle">Store activity summary</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.products}</h2>
          <p>Total Products</p>
        </div>

        <div className="stat-card">
          <h2>{stats.orders}</h2>
          <p>Total Orders</p>
        </div>

        <div className="stat-card">
          <h2>{stats.users}</h2>
          <p>Total Users</p>
        </div>

        <div className="stat-card">
          <h2>{stats.todayOrders}</h2>
          <p>Today's Orders</p>
        </div>

        <div className="stat-card">
          <h2>{stats.pendingOrders}</h2>
          <p>Pending Orders</p>
        </div>

        <div className="stat-card">
          <h2>₹{stats.weeklyRevenue}</h2>
          <p>Weekly Revenue</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h3>Weekly Revenue</h3>
          <Bar data={revenueChartData} />
        </div>

        <div className="chart-box">
          <h3>Daily Orders</h3>
          <Line data={ordersChartData} />
        </div>
      </div>

      <h2 className="section-title">Recent Users</h2>
      <ul className="user-list">
        {stats.recentUsers.map((u) => (
          <li key={u._id} className="user-item">
            <strong className="user-info">{u.name}</strong>
            <span>{u.email}</span>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Top Selling Products</h2>
      <ul className="product-list">
        {stats.topProducts.map((p) => (
          <li key={p.id} className="product-item">
            <img src={p.image} alt={p.name} className="thumb" />
            <div className="product-info">
              <strong className="product-name">{p.name}</strong>
              <span className="sold-count">Sold: {p.qty}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
