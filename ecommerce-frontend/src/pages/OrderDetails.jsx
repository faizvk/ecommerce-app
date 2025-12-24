import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { trackOrderThunk } from "../redux/slice/orderSlice";
import "./styles/OrderDetails.css";

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    currentOrder: order,
    loading,
    error,
  } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(trackOrderThunk(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="container od-page">
        <h1>Order Details</h1>
        <p className="loading">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container od-page">
        <h1>Order Details</h1>
        <p className="od-error">{error || "Order not found"}</p>
      </div>
    );
  }

  const statusColors = {
    pending: "pending",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
    processing: "pending",
  };

  return (
    <div className="container od-page">
      <h1 className="od-title">Order Details</h1>

      {/* HEADER */}
      <div className="od-header">
        <div>
          <p className="od-id">Order ID: #{order._id.slice(-6)}</p>
          <p className="od-date">
            Ordered on:{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <span className={`od-status ${statusColors[order.status]}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* SHIPPING */}
      <div className="od-section">
        <h2>Shipping Address</h2>
        <p className="od-address">{order.shippingAddress}</p>
      </div>

      {/* ITEMS */}
      <div className="od-section">
        <h2>Items in this Order</h2>

        <div className="od-items">
          {order.items.map((item, idx) => {
            const p = item.productId;

            return (
              <div key={p?._id || `${order._id}-${idx}`} className="od-item">
                <img
                  src={p?.image?.[0] || "/placeholder.jpg"}
                  alt={p?.name || "Product removed"}
                  className="od-item-img"
                />

                <div className="od-item-info">
                  <h3>{p?.name || "Product Unavailable"}</h3>
                  <p>Qty: {item.quantity}</p>
                </div>

                <div className="od-item-price">
                  ₹{item.quantity * item.price}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOTAL */}
      <div className="od-section od-total-box">
        <h2>Total Paid</h2>
        <p className="od-total">₹{order.totalAmount}</p>
      </div>

      {/* ACTIONS */}
      <div className="od-actions">
        <Link to={`/track/${order._id}`} className="od-btn track">
          Track Order
        </Link>

        <Link to="/" className="od-btn shop">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
