import { toast } from "react-toastify";
import {
  CheckCircle2, XCircle, Info, AlertTriangle, Sparkles,
  ShoppingCart, Heart, Package,
} from "lucide-react";
import { createElement } from "react";
import { Link } from "react-router-dom";

/**
 * Branded toast helpers for NexKart.
 * Each toast renders a custom card with a colored accent bar, icon tile,
 * title + optional description, and optional action link.
 *
 * Usage:
 *   import { notify } from "../utils/notify";
 *   notify.success("Added to cart");
 *   notify.success({ title: "Saved!", desc: "Find it in your wishlist", action: { label: "View", to: "/wishlist" } });
 *   notify.error("Couldn't load cart");
 *   notify.info("Free delivery unlocked");
 *   notify.warn("Only 2 left in stock");
 *   notify.promo("New sale dropped — 60% off!");
 *
 *   notify.cart("Wireless headphones added");
 *   notify.wishlist("Saved for later");
 */

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    accent: "bg-emerald-500",
    iconBg: "bg-white",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    cls: "nexkart-toast--success",
  },
  error: {
    Icon: XCircle,
    accent: "bg-red-500",
    iconBg: "bg-white",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    cls: "nexkart-toast--error",
  },
  info: {
    Icon: Info,
    accent: "bg-brand",
    iconBg: "bg-white",
    iconColor: "text-brand",
    titleColor: "text-brand-dark",
    cls: "nexkart-toast--info",
  },
  warn: {
    Icon: AlertTriangle,
    accent: "bg-amber-500",
    iconBg: "bg-white",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    cls: "nexkart-toast--warn",
  },
  promo: {
    Icon: Sparkles,
    accent: "bg-gradient-to-b from-brand to-[#7c3aed]",
    iconBg: "bg-white",
    iconColor: "text-[#7c3aed]",
    titleColor: "text-brand-dark",
    cls: "nexkart-toast--promo",
  },
  cart: {
    Icon: ShoppingCart,
    accent: "bg-brand",
    iconBg: "bg-white",
    iconColor: "text-brand",
    titleColor: "text-brand-dark",
    cls: "nexkart-toast--cart",
  },
  wishlist: {
    Icon: Heart,
    accent: "bg-pink-500",
    iconBg: "bg-white",
    iconColor: "text-pink-600",
    titleColor: "text-pink-900",
    cls: "nexkart-toast--wishlist",
  },
  order: {
    Icon: Package,
    accent: "bg-blue-500",
    iconBg: "bg-white",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    cls: "nexkart-toast--order",
  },
};

/* Inline-styled toast body — minimalist, no accent bar, compact */
function Body({ variant, title, desc, action }) {
  const v = VARIANTS[variant] || VARIANTS.info;
  return createElement(
    "div",
    { className: "flex items-center gap-2.5" },
    // icon
    createElement(v.Icon, { size: 17, className: `${v.iconColor} flex-shrink-0`, strokeWidth: 2.2 }),
    // text
    createElement(
      "div",
      { className: "flex-1 min-w-0" },
      createElement(
        "p",
        { className: `text-[0.85rem] font-bold leading-tight ${v.titleColor}` },
        title
      ),
      desc &&
        createElement(
          "p",
          { className: "text-[0.74rem] text-gray-600 mt-0.5 leading-snug truncate" },
          desc
        ),
      action &&
        action.to &&
        createElement(
          Link,
          {
            to: action.to,
            className:
              "inline-block mt-0.5 text-[0.74rem] font-bold text-brand no-underline hover:underline",
          },
          `${action.label} →`
        )
    )
  );
}

function build(variant, args) {
  const opts =
    typeof args === "string"
      ? { title: args }
      : args || { title: "" };
  return createElement(Body, {
    variant,
    title: opts.title,
    desc: opts.desc,
    action: opts.action,
  });
}

const optionsFor = (variant, autoClose) => ({
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  className: `nexkart-toast ${VARIANTS[variant]?.cls || ""}`,
  bodyClassName: "nexkart-toast__body",
  progressClassName: "nexkart-toast__progress",
  closeButton: false,
  autoClose,
});

export const notify = {
  success: (args) => toast(build("success", args), optionsFor("success", 2500)),
  error:   (args) => toast(build("error",   args), optionsFor("error",   3500)),
  info:    (args) => toast(build("info",    args), optionsFor("info",    2500)),
  warn:    (args) => toast(build("warn",    args), optionsFor("warn",    3000)),
  promo:   (args) => toast(build("promo",   args), optionsFor("promo",   4000)),
  cart:    (args) => toast(build("cart",    args), optionsFor("cart",    2500)),
  wishlist:(args) => toast(build("wishlist",args), optionsFor("wishlist",2000)),
  order:   (args) => toast(build("order",   args), optionsFor("order",   3000)),
};

export default notify;
