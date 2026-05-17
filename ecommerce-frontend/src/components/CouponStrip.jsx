import { useState } from "react";
import { Copy, Check, Ticket, Sparkles } from "lucide-react";
import { notify } from "../utils/notify";

/**
 * Coupon strip — horizontally scrolling promo codes the user can copy with
 * a single click. Codes are display-only marketing copy; real validation
 * happens at checkout against the offers system.
 *
 * Each coupon shows: code, headline discount, fine print, copy button.
 * Click copies the code to clipboard + flips the icon to a checkmark for
 * 2 seconds + fires a toast.
 */

const COUPONS = [
  { code: "WELCOME10",  headline: "10% OFF",       sub: "On your first order",     accent: "from-emerald-500 to-teal-600" },
  { code: "NEXKART20",  headline: "20% OFF",       sub: "On orders above ₹1,499",  accent: "from-brand to-violet-600" },
  { code: "BIGSAVE500", headline: "₹500 OFF",      sub: "On orders above ₹2,999",  accent: "from-amber-500 to-orange-600" },
  { code: "FREESHIP",   headline: "Free Shipping", sub: "On any order",            accent: "from-sky-500 to-blue-600" },
  { code: "DIWALI25",   headline: "25% OFF",       sub: "Festive special — ends soon", accent: "from-rose-500 to-pink-600" },
];

function CouponCard({ coupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      notify.success({ title: "Code copied!", desc: `${coupon.code} ready to paste at checkout` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Couldn't copy — please copy manually");
    }
  };

  return (
    <div
      className={`relative snap-start flex-shrink-0 w-[260px] sm:w-[280px] rounded-2xl overflow-hidden bg-gradient-to-br ${coupon.accent} text-white shadow-card`}
    >
      {/* Decorative blur orbs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-black/10 blur-2xl" />

      {/* Perforation dots — visual cue this is a tear-off coupon */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white" />
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white" />

      <div className="relative p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <Ticket size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold leading-tight">{coupon.headline}</p>
          <p className="text-[0.72rem] text-white/85 leading-tight line-clamp-1">{coupon.sub}</p>
        </div>
      </div>

      <div className="relative px-4 pb-4 pt-1 flex items-center justify-between gap-2">
        <code className="bg-white/15 border border-dashed border-white/40 rounded-md px-2.5 py-1 text-[0.82rem] font-extrabold tracking-wider tabular-nums">
          {coupon.code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy coupon code ${coupon.code}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-gray-900 text-[0.75rem] font-extrabold cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function CouponStrip() {
  return (
    <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} className="text-brand" />
        <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Available Offers</h2>
        <span className="text-[0.72rem] text-gray-400">· Tap to copy</span>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-2 px-2 md:-mx-4 md:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {COUPONS.map((c) => (
          <CouponCard key={c.code} coupon={c} />
        ))}
      </div>
    </section>
  );
}
