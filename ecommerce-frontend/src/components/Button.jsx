const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-dark active:scale-95",
  outline:
    "bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-white active:scale-95",
  danger:
    "bg-red-600 text-white hover:bg-red-800 active:scale-95",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`w-full py-3 px-5 rounded-lg cursor-pointer font-semibold border-0 transition-all duration-200 text-base inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
