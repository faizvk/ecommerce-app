export const PRODUCT_CATEGORIES = [
  { value: "electronics", label: "Electronics", emoji: "📱" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "dairy", label: "Dairy", emoji: "🥛" },
  { value: "technology", label: "Technology", emoji: "💻" },
  { value: "home appliances", label: "Home Appliances", emoji: "🏠" },
];

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const ORDER_STATUS_CONFIG = {
  pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400" },
  processing: { label: "Processing", cls: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-400" },
  shipped:    { label: "Shipped",    cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
  delivered:  { label: "Delivered",  cls: "bg-green-50 text-green-700 border-green-200",   dot: "bg-green-400" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-50 text-red-600 border-red-200",         dot: "bg-red-400" },
};

export const NEXT_STATUS = {
  pending: { next: "processing", label: "Mark Processing" },
  processing: { next: "shipped", label: "Mark Shipped" },
  shipped: { next: "delivered", label: "Mark Delivered" },
};

export const FORM_INPUT_CLS =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[0.9rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)]";

export const FORM_LABEL_CLS = "text-[0.85rem] font-semibold text-gray-700";
