import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { trackOrderThunk } from "../redux/slice/orderSlice";
import {
  MapPin, Package, Calendar, CreditCard, Hash, ArrowLeft,
  Truck, ChevronRight, ShoppingBag, Receipt,
} from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge";
import Breadcrumbs from "../components/Breadcrumbs";

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder: order, loading, error } = useSelector((s) => s.order);

  useEffect(() => {
    dispatch(trackOrderThunk(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error || "This order may not exist or has been removed."}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand text-white rounded-xl font-semibold no-underline transition-all hover:bg-brand-dark text-sm"
        >
          <ArrowLeft size={14} />
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderId = order._id.slice(-8).toUpperCase();
  const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const placedTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit",
  });
  const itemCount = order.items.reduce((n, it) => n + (it.quantity || 0), 0);

  return (
    <div className="max-w-[900px] mx-auto px-4 py-5 md:px-5 md:py-7">
      <Breadcrumbs
        items={[
          { label: "My Orders", to: "/orders" },
          { label: `#${orderId}` },
        ]}
        className="mb-4"
      />

      {/* GRADIENT HEADER CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark via-brand to-[#7c3aed] text-white mb-5 shadow-[0_12px_30px_rgba(79,70,229,0.25)]">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-12 w-52 h-52 rounded-full bg-white/5 blur-2xl" />

        <div className="relative p-5 md:p-7">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/70 mb-1">Order receipt</p>
              <h1 className="text-2xl md:text-[1.75rem] font-extrabold tracking-tight leading-tight font-mono">#{orderId}</h1>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-white/65 flex items-center gap-1 mb-0.5">
                <Calendar size={10} />
                Placed
              </p>
              <p className="text-[0.85rem] font-bold leading-tight">{placedDate}</p>
              <p className="text-[0.7rem] text-white/65">{placedTime}</p>
            </div>

            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-white/65 flex items-center gap-1 mb-0.5">
                <ShoppingBag size={10} />
                Items
              </p>
              <p className="text-[0.85rem] font-bold leading-tight">{itemCount}</p>
              <p className="text-[0.7rem] text-white/65">{order.items.length} {order.items.length === 1 ? "product" : "products"}</p>
            </div>

            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-white/65 flex items-center gap-1 mb-0.5">
                <CreditCard size={10} />
                Payment
              </p>
              <p className="text-[0.85rem] font-bold leading-tight capitalize">{order.paymentStatus || "paid"}</p>
              <p className="text-[0.7rem] text-white/65">Razorpay</p>
            </div>

            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-white/65 flex items-center gap-1 mb-0.5">
                <Receipt size={10} />
                Total
              </p>
              <p className="text-[0.95rem] font-extrabold leading-tight">₹{order.totalAmount}</p>
              <p className="text-[0.7rem] text-white/65">Inc. taxes</p>
            </div>
          </div>
        </div>
      </div>

      {/* SHIPPING ADDRESS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card mb-4">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-brand" />
            <h2 className="text-[0.92rem] font-extrabold text-gray-900">Shipping Address</h2>
          </div>
        </div>
        <div className="p-5">
          <p className="text-[0.92rem] text-gray-700 leading-relaxed">{order.shippingAddress}</p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card mb-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-brand" />
            <h2 className="text-[0.92rem] font-extrabold text-gray-900">Items in this Order</h2>
          </div>
          <span className="text-[0.72rem] font-bold text-gray-400">{itemCount} units</span>
        </div>

        <ul className="p-2">
          {order.items.map((item, idx) => {
            const p = item.productId;
            return (
              <li
                key={p?._id || `${order._id}-${idx}`}
                className="flex gap-3 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {p?._id ? (
                  <Link to={`/product/${p._id}`} className="flex-shrink-0">
                    <img
                      src={p?.image?.[0] || "/placeholder.jpg"}
                      alt={p?.name || "Product"}
                      className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100"
                    />
                  </Link>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.9rem] font-bold text-gray-900 line-clamp-2">
                    {p?.name || "Product no longer available"}
                  </h3>
                  <p className="text-[0.78rem] text-gray-500 mt-0.5">
                    Qty: <span className="font-semibold text-gray-700">{item.quantity}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    ₹{item.price} each
                  </p>
                </div>
                <span className="font-extrabold text-brand whitespace-nowrap text-[0.95rem]">
                  ₹{item.quantity * item.price}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card mb-5 p-5">
        <h2 className="text-[0.92rem] font-extrabold text-gray-900 mb-3 flex items-center gap-2">
          <Receipt size={16} className="text-brand" />
          Price Breakdown
        </h2>
        <dl className="flex flex-col gap-2 text-[0.88rem]">
          <div className="flex justify-between items-center">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="font-semibold text-gray-800">₹{order.totalAmount}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-gray-500 inline-flex items-center gap-1.5">
              <Truck size={12} className="text-green-500" />
              Delivery
            </dt>
            <dd className="font-semibold text-green-600">Free</dd>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          <div className="flex justify-between items-center pt-1">
            <dt className="text-[0.95rem] font-extrabold text-gray-900">Total Paid</dt>
            <dd className="text-2xl font-extrabold text-brand">₹{order.totalAmount}</dd>
          </div>
        </dl>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <Link
          to="/orders"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold no-underline transition-all hover:bg-gray-50 hover:border-gray-300 text-[0.88rem]"
        >
          <ArrowLeft size={14} />
          All Orders
        </Link>
        <Link
          to="/"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold no-underline transition-all hover:bg-gray-50 hover:border-gray-300 text-[0.88rem]"
        >
          Continue Shopping
        </Link>
        <Link
          to={`/track/${order._id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-brand to-[#7c3aed] text-white rounded-xl font-bold no-underline transition-all hover:opacity-90 hover:-translate-y-px shadow-[0_4px_14px_rgba(79,70,229,0.25)] text-[0.88rem]"
        >
          Track Order
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
