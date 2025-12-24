import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/Button";
import {
  adminFetchOrdersThunk,
  adminUpdateOrderStatusThunk,
  cancelOrderThunk,
} from "../redux/slice/orderSlice";
import "./styles/AdminOrders.css";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

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

    adminOrders.forEach((o) => {
      if (map[o.status]) {
        map[o.status].push(o);
      }
    });

    return map;
  }, [adminOrders]);

  const updateStatus = (orderId, newStatus) => {
    dispatch(
      adminUpdateOrderStatusThunk({
        orderId,
        status: newStatus,
      })
    );
  };

  const handleCancelOrder = (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmed) return;

    dispatch(cancelOrderThunk(orderId));
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <h1 className="admin-page-title">Manage Orders</h1>
        <p className="loading">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <h1 className="admin-page-title">Manage Orders</h1>

      {/* STATUS TABS */}
      <div className="order-tabs">
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`order-tab ${activeTab === status ? "active" : ""}`}
            onClick={() => setActiveTab(status)}
          >
            {status.toUpperCase()} ({ordersByStatus[status].length})
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      {ordersByStatus[activeTab].length === 0 ? (
        <p className="no-orders">No {activeTab} orders</p>
      ) : (
        <div className="admin-orders-list">
          {ordersByStatus[activeTab].map((order) => (
            <div className="admin-order-card" key={order._id}>
              {/* HEADER */}
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className={`order-status ${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* CUSTOMER */}
              <div className="order-section">
                <h4>Customer</h4>
                <p>
                  <strong>{order.userId?.name}</strong> ({order.userId?.email})
                </p>
                <p className="order-address">
                  <strong>Address:</strong> {order.shippingAddress}
                </p>
              </div>

              {/* ITEMS */}
              <div className="order-section">
                <h4>Items</h4>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div className="order-item" key={item._id}>
                      <img
                        src={item.productId?.image?.[0] || "/placeholder.jpg"}
                        className="order-item-img"
                        alt={item.productId?.name || "Product"}
                      />

                      <div className="order-item-info">
                        <strong>{item.productId?.name}</strong>
                        <p>Qty: {item.quantity}</p>
                        <p>₹ {item.quantity * item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL */}
              <div className="order-total">
                <span>Total Amount:</span>
                <strong>₹ {order.totalAmount}</strong>
              </div>

              {/* ACTIONS */}
              <div className="order-actions">
                {order.status === "pending" && (
                  <Button
                    variant="primary"
                    onClick={() => updateStatus(order._id, "processing")}
                  >
                    Mark Processing
                  </Button>
                )}

                {order.status === "processing" && (
                  <Button
                    variant="primary"
                    onClick={() => updateStatus(order._id, "shipped")}
                  >
                    Mark Shipped
                  </Button>
                )}

                {order.status === "shipped" && (
                  <Button
                    variant="primary"
                    onClick={() => updateStatus(order._id, "delivered")}
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
