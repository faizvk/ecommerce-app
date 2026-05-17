import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { User, MapPin, Clock, StickyNote, Send } from "lucide-react";
import { ORDER_STATUS_CONFIG, NEXT_STATUS } from "../constants";
import { adminAddOrderNoteThunk } from "../../redux/slice/orderSlice";
import { notify } from "../../utils/notify";

function NotesPanel({ order }) {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const notes = order.adminNotes || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await dispatch(adminAddOrderNoteThunk({ orderId: order._id, text: trimmed })).unwrap();
      setText("");
      notify.success("Note added", { autoClose: 1500 });
    } catch (err) {
      notify.error(err || "Couldn't add note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3 flex items-center justify-between gap-2 text-[0.78rem] font-bold text-gray-600 hover:text-brand cursor-pointer border-0 bg-transparent"
      >
        <span className="inline-flex items-center gap-2">
          <StickyNote size={13} />
          Internal Notes
          {notes.length > 0 && (
            <span className="bg-brand text-white text-[0.62rem] font-extrabold px-1.5 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </span>
        <span className="text-[0.7rem] text-gray-400">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="px-5 pb-4 flex flex-col gap-3">
          {notes.length > 0 && (
            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {notes.map((n, i) => (
                <li key={i} className="bg-white border border-gray-100 rounded-xl p-3">
                  <p className="text-[0.82rem] text-gray-700 whitespace-pre-wrap break-words">{n.text}</p>
                  <p className="text-[0.65rem] text-gray-400 mt-1.5 font-medium">
                    {n.author || "admin"} · {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAdd} className="flex gap-2 items-start">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              placeholder="Add an internal note (not visible to customer)…"
              rows={2}
              maxLength={1000}
              disabled={saving}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[0.82rem] bg-white outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)] resize-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={saving || !text.trim()}
              aria-label="Add note"
              className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0 flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const AdminOrderCard = memo(function AdminOrderCard({ order, busy, onAdvance, onCancel }) {
  const status = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const next = NEXT_STATUS[order.status];
  const canCancel = order.status === "pending" || order.status === "processing";
  const date = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/60 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[0.78rem] font-bold text-gray-500 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.72rem] text-gray-400 whitespace-nowrap">
          <Clock size={11} />
          {date}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 flex flex-col gap-4">
        {/* CUSTOMER */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.875rem] font-semibold text-gray-900">
              {order.userId?.name || "Guest"}
              {order.userId?.email && (
                <span className="font-normal text-gray-400 text-[0.78rem] ml-1">
                  ({order.userId.email})
                </span>
              )}
            </p>
            <div className="flex items-start gap-1 mt-1">
              <MapPin size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-[0.78rem] text-gray-500 leading-relaxed">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div>
          <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img
                  src={item.productId?.image?.[0] || "/placeholder.jpg"}
                  alt={item.productId?.name || "Product"}
                  className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] font-semibold text-gray-900 truncate">
                    {item.productId?.name || "Product unavailable"}
                  </p>
                  <p className="text-[0.75rem] text-gray-400">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="font-bold text-brand text-[0.875rem] whitespace-nowrap">
                  ₹{item.quantity * item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL + ACTIONS */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-gray-100">
          <div>
            <p className="text-[0.72rem] text-gray-400">Total Amount</p>
            <p className="text-xl font-extrabold text-brand">₹{order.totalAmount}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {next && (
              <button
                disabled={busy}
                className={`px-4 py-2 text-white border-0 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all disabled:opacity-50 ${
                  next.next === "delivered" ? "bg-green-600 hover:bg-green-700" : "bg-brand hover:bg-brand-dark"
                }`}
                onClick={() => onAdvance(order._id, next.next)}
              >
                {next.label}
              </button>
            )}
            {canCancel && (
              <button
                disabled={busy}
                className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-50"
                onClick={() => onCancel(order._id)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <NotesPanel order={order} />
    </div>
  );
});

export default AdminOrderCard;
