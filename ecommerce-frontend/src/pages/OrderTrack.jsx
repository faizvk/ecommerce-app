import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { trackOrderThunk, cancelOrderThunk } from "../redux/slice/orderSlice";
import Button from "../components/Button";
import "./styles/OrderTrack.css";

export default function OrderTrack() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const {
    currentOrder: order,
    loading: orderLoading,
    error,
    message,
  } = useSelector((state) => state.order);

  if (!authLoading && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (authLoading) return;
    dispatch(trackOrderThunk(id));
  }, [id, authLoading, dispatch]);

  const handleCancel = () => {
    dispatch(cancelOrderThunk(id));
  };

  if (authLoading || orderLoading) {
    return <p className="loading">Loading...</p>;
  }

  if (!order) {
    return (
      <div className="ot-error">
        <h2>Order Not Found</h2>
        <p>{error || "The order ID may be invalid or removed."}</p>
      </div>
    );
  }

  const steps = ["Ordered", "Shipped", "Delivered"];
  const currentStep =
    order.status === "pending"
      ? 0
      : order.status === "shipped"
      ? 1
      : order.status === "delivered"
      ? 2
      : -1;

  return (
    <div className="container ot-wrapper">
      <h1 className="ot-title">Track Your Order</h1>

      {message && <p className="ot-msg">{message}</p>}

      {/* ---------------- TOP SECTION ---------------- */}
      <div className="ot-top">
        {/* ----- ORDER TIMELINE ----- */}
        <div className="ot-timeline">
          {order.status === "cancelled" ? (
            <div className="ot-cancelled">
              <div className="ot-cancel-icon">✖</div>
              <p>Order Cancelled</p>
            </div>
          ) : (
            steps.map((label, i) => (
              <div key={i} className="ot-step">
                <span
                  className={`ot-label ${i <= currentStep ? "active" : ""}`}
                >
                  {label}
                </span>
                <div
                  className={`ot-circle ${i <= currentStep ? "done" : ""}`}
                ></div>
                {i < steps.length - 1 && (
                  <div
                    className={`ot-line ${i < currentStep ? "done" : ""}`}
                  ></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ----- ORDER DETAILS ----- */}
        <div className="ot-details">
          <p className="ot-id-p">
            <strong className="ot-id">Order ID:</strong> {order._id}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span className={`ot-status ${order.status}`}>
              {order.status.toUpperCase()}
            </span>
          </p>

          <p className="ot-amount">
            <strong>Total Amount:</strong> ₹{order.totalAmount}
          </p>

          <p className="ot-address">
            <strong>Shipping Address:</strong> {order.shippingAddress}
          </p>

          {order.status === "pending" && (
            <Button variant="danger" onClick={handleCancel}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* ---------------- ORDER ITEMS ---------------- */}
      <h2 className="ot-items-title">Items in Your Order</h2>

      <div className="ot-items-box">
        {order.items.map((item, idx) => {
          const product = item.productId; // ✅ USE POPULATED PRODUCT

          return (
            <div key={product?._id || idx} className="ot-item">
              <img
                src={product?.image?.[0] || "/placeholder.jpg"}
                alt={product?.name || "Product removed"}
                className="ot-item-img"
              />

              <div className="ot-item-info">
                <h4>{product?.name || "Product Unavailable"}</h4>
                <p>Qty: {item.quantity}</p>
              </div>

              <div className="ot-item-price">₹{item.quantity * item.price}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
