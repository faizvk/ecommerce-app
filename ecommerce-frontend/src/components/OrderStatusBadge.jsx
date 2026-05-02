const STATUS_CONFIG = {
  pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400" },
  processing: { label: "Processing", cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400" },
  shipped:    { label: "Shipped",    cls: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-400" },
  delivered:  { label: "Delivered",  cls: "bg-green-50 text-green-700 border-green-200",    dot: "bg-green-400" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-50 text-red-600 border-red-200",          dot: "bg-red-400" },
};

export default function OrderStatusBadge({ status, size = "md" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sz =
    size === "sm" ? "text-[0.62rem] px-2 py-0.5"
    : size === "lg" ? "text-[0.78rem] px-3 py-1.5"
    : "text-[0.7rem] px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${cfg.cls} ${sz}`}>
      <span className={`rounded-full ${cfg.dot} ${size === "lg" ? "w-1.5 h-1.5" : "w-1 h-1"} ${status === "pending" || status === "processing" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };
