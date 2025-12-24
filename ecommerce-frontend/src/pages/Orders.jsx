import { useEffect, useMemo, memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrdersThunk } from "../redux/slice/orderSlice";
import { fadeIn } from "../animations/FadeIn";
import "./styles/Orders.css";

/* -----------------------------------------
   MEMOIZED ORDER CARD
------------------------------------------ */
const OrderCard = memo(function OrderCard({ order }) {
  return (
    <div
      className="order-card"
      {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
    >
      <div className="order-main">
        <div className="order-header">
          <span className="order-id">#{order._id.slice(-6)}</span>
          <span className={`order-status-badge ${order.status}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <p className="order-date">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        <p className="order-total">₹{order.totalAmount}</p>
        <p className="order-items-count">{order.items.length} Items</p>

        <div className="order-thumbs">
          {order.items.slice(0, 4).map((item, idx) => {
            const p = item.productId;
            return (
              <img
                key={p?._id || `${order._id}-${idx}`}
                src={p?.image?.[0] || "/placeholder.jpg"}
                alt={p?.name || "Product"}
              />
            );
          })}

          {order.items.length > 4 && (
            <span className="more-items">+{order.items.length - 4} more</span>
          )}
        </div>
      </div>

      <div
        className="order-actions"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        <Link to={`/track/${order._id}`} className="track-btn">
          Track Order
        </Link>
        <Link to={`/orders/${order._id}`} className="details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
});

/* -----------------------------------------
   ORDERS PAGE
------------------------------------------ */
export default function Orders() {
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const { orders = [], loading, error } = useSelector((state) => state.order);

  const [activeTab, setActiveTab] = useState("pending");

  /* =========================
     LOAD ORDERS
  ========================= */
  useEffect(() => {
    dispatch(fetchOrdersThunk());
  }, [dispatch]);

  /* =========================
     TAB FILTERING
  ========================= */
  const categorized = useMemo(() => {
    return {
      pending: orders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      ),
      shipped: orders.filter((o) => o.status === "shipped"),
      delivered: orders.filter((o) => o.status === "delivered"),
      cancelled: orders.filter((o) => o.status === "cancelled"),
    };
  }, [orders]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="container orders-page">
        <h1 className="orders-title">My Orders</h1>
        <p className="loading">Loading your orders...</p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="container orders-page">
      <h1 className="orders-title">My Orders</h1>

      {error && <p className="orders-error">{error}</p>}

      {/* STATUS TABS */}
      <div
        className="orders-tabs"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        {["pending", "shipped", "delivered", "cancelled"].map((tab) => (
          <button
            key={tab}
            className={`orders-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {categorized[activeTab].length === 0 ? (
        <div className="orders-empty-tab">
          <p>No {activeTab} orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {categorized[activeTab].map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
