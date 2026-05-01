import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmCls =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-brand hover:bg-brand-dark";

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex gap-3 items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variant === "danger" ? "bg-red-100" : "bg-brand-light"}`}>
            <AlertTriangle size={18} className={variant === "danger" ? "text-red-500" : "text-brand"} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {message && <p className="text-[0.875rem] text-gray-500 mt-1 leading-relaxed">{message}</p>}
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-[0.85rem] font-semibold text-gray-700 bg-white border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-[0.85rem] font-semibold text-white border-0 cursor-pointer transition-all disabled:opacity-50 ${confirmCls}`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
