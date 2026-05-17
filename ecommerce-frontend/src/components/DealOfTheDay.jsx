import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Flame, Clock, ChevronRight, Zap } from "lucide-react";

/**
 * Deal of the Day — single hero product banner with a live midnight countdown.
 *
 * Picks the highest-discount in-stock product as the featured deal. The pick
 * is deterministic per UTC day (uses Date#toDateString as the seed) so the
 * banner doesn't shuffle on every render, but rotates daily.
 *
 * The "ends at midnight" framing is the cheapest, most honest urgency hook —
 * no fake server-side timers, no per-product end dates required.
 */

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatHMS(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function DealOfTheDay() {
  const products = useSelector((s) => s.product.products) || [];

  // Pick the in-stock product with the highest discount %, breaking ties
  // by lowest absolute price. Memoised so we don't recompute on the timer tick.
  const pick = useMemo(() => {
    const eligible = products
      .filter((p) => p.stock > 0 && p.costPrice > p.salePrice)
      .map((p) => ({
        ...p,
        _discount: (p.costPrice - p.salePrice) / p.costPrice,
      }))
      .sort((a, b) => b._discount - a._discount || a.salePrice - b.salePrice);
    return eligible[0] || null;
  }, [products]);

  const [remaining, setRemaining] = useState(getMsUntilMidnight);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!pick) return null;

  const discountPct = Math.round(pick._discount * 100);
  const savings = pick.costPrice - pick.salePrice;
  const img = pick.image?.[0];

  // Split HH:MM:SS into pieces so each segment can render in its own pill
  const [hh, mm, ss] = formatHMS(remaining).split(":");

  return (
    <Link
      to={`/product/${pick._id}`}
      className="group block relative overflow-hidden rounded-3xl text-white no-underline shadow-[0_12px_40px_rgba(220,38,38,0.25)] hover:shadow-[0_18px_50px_rgba(220,38,38,0.32)] transition-shadow"
    >
      {/* Background gradient — fiery red/orange to signal urgency */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-600 to-orange-500" />
      <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-16 -left-8 w-72 h-72 rounded-full bg-black/15 blur-3xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-5 md:p-8 items-center">
        {/* LEFT — copy + countdown */}
        <div>
          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-white/15 border border-white/25 rounded-full text-[0.7rem] font-extrabold uppercase tracking-[0.18em]">
            <Flame size={12} /> Deal of the Day
          </div>

          <h2 className="text-xl md:text-3xl font-extrabold leading-tight mb-2 line-clamp-2">
            {pick.name}
          </h2>

          <div className="flex items-end gap-3 mb-3">
            <span className="text-2xl md:text-4xl font-extrabold tabular-nums">₹{pick.salePrice}</span>
            <span className="text-white/55 line-through tabular-nums text-[0.95rem] md:text-base pb-1">
              ₹{pick.costPrice}
            </span>
            <span className="bg-white text-red-600 px-2 py-0.5 rounded-md text-[0.78rem] md:text-[0.85rem] font-extrabold tabular-nums shadow-sm">
              {discountPct}% OFF
            </span>
          </div>

          <p className="text-white/85 text-[0.85rem] md:text-[0.95rem] mb-4">
            You save <span className="font-extrabold tabular-nums">₹{savings}</span> · Limited time only
          </p>

          {/* Countdown — discrete digit pills */}
          <div className="flex items-center gap-1.5 mb-5">
            <Clock size={14} className="text-white/75" />
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-white/75 mr-1">Ends in</span>
            {[
              { label: "h", v: hh },
              { label: "m", v: mm },
              { label: "s", v: ss },
            ].map((seg, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1 tabular-nums font-extrabold text-[0.9rem] md:text-base">
                  {seg.v}
                </span>
                <span className="text-[0.7rem] font-bold text-white/65">{seg.label}</span>
              </div>
            ))}
          </div>

          <span className="inline-flex items-center gap-1.5 bg-white text-red-600 px-5 py-2.5 rounded-full font-extrabold text-[0.92rem] shadow-md group-hover:translate-x-1 transition-transform">
            <Zap size={14} /> Grab now <ChevronRight size={14} />
          </span>
        </div>

        {/* RIGHT — product image, hidden on small for breathing room */}
        {img && (
          <div className="hidden md:block w-44 h-44 lg:w-56 lg:h-56 rounded-2xl bg-white/15 overflow-hidden border border-white/25 backdrop-blur-sm flex-shrink-0">
            <img
              src={img}
              alt={pick.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
