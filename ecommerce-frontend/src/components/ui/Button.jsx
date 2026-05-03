import { Link } from "react-router-dom";

/**
 * Button primitive — unifies the button styles that previously lived as
 * one-off Tailwind class strings on every page.
 *
 *   <Button>Save</Button>
 *   <Button variant="primary" size="lg">Buy Now</Button>
 *   <Button variant="outline" leftIcon={<Plus />}>Add</Button>
 *   <Button as="link" to="/cart" variant="ghost">View cart</Button>
 *
 * Variants:
 *  - primary  — gradient brand→violet (default for main CTAs)
 *  - solid    — solid brand bg
 *  - outline  — gray border, light bg
 *  - ghost    — text-only, hover bg
 *  - danger   — red
 *  - subtle   — brand-light bg, brand text
 *
 * Sizes:
 *  - sm  → py-1.5 px-3 text-[0.78rem]
 *  - md  → py-2.5 px-4 text-[0.85rem]   (default)
 *  - lg  → py-3.5 px-6 text-[0.92rem]
 */

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-brand to-[#7c3aed] text-white border-0 shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:opacity-90 hover:-translate-y-px",
  solid:
    "bg-brand text-white border-0 hover:bg-brand-dark hover:-translate-y-px",
  outline:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300",
  ghost:
    "bg-transparent text-brand border-0 hover:text-brand-dark hover:underline underline-offset-2",
  danger:
    "bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500",
  subtle:
    "bg-brand-light text-brand border-0 hover:bg-brand hover:text-white",
};

const SIZES = {
  sm: "py-1.5 px-3 text-[0.78rem] rounded-lg gap-1",
  md: "py-2.5 px-4 text-[0.85rem] rounded-xl gap-1.5",
  lg: "py-3.5 px-6 text-[0.92rem] rounded-xl gap-2",
};

const BASE =
  "inline-flex items-center justify-center font-bold cursor-pointer transition-all no-underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  className = "",
  as,
  to,
  href,
  type = "button",
  disabled,
  ...rest
}) {
  const cls = [
    BASE,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  const content = (
    <>
      {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
      {loading ? "Working…" : children}
      {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
    </>
  );

  if (as === "link" && to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  if (as === "a" || href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
