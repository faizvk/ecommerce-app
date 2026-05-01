import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Tag, Clock, ChevronRight, Sparkles } from "lucide-react";
import { fetchActiveOffersThunk, pruneExpiredOffers } from "../redux/slice/offerSlice";

function formatTimeLeft(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export default function OfferBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeOffers } = useSelector((state) => state.offer);
  const [now, setNow] = useState(Date.now());
  const [index, setIndex] = useState(0);

  // Live tick every second for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Filter out expired offers locally based on current time
  const liveOffers = useMemo(
    () => activeOffers.filter((o) => new Date(o.endTime).getTime() > now),
    [activeOffers, now]
  );

  // When an offer expires, prune from store and refetch
  useEffect(() => {
    if (activeOffers.length > liveOffers.length) {
      dispatch(pruneExpiredOffers());
      dispatch(fetchActiveOffersThunk());
    }
  }, [activeOffers.length, liveOffers.length, dispatch]);

  // Auto-rotate between offers if multiple
  useEffect(() => {
    if (liveOffers.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % liveOffers.length), 6000);
    return () => clearInterval(id);
  }, [liveOffers.length]);

  if (liveOffers.length === 0) return null;

  const offer = liveOffers[index % liveOffers.length];
  const timeLeft = new Date(offer.endTime).getTime() - now;
  const productCount = offer.productIds?.length || 0;
  const discountLabel =
    offer.discountType === "fixed"
      ? `₹${offer.discountValue} OFF`
      : `${offer.discountValue}% OFF`;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-[#7c3aed] text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)]">
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

          {offer.bannerImage && (
            <img
              src={offer.bannerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6">
            {/* Discount pill */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-white/15 border border-white/25 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <Sparkles size={18} className="text-white" />
                <span className="text-xl md:text-2xl font-extrabold tracking-tight whitespace-nowrap">
                  {discountLabel}
                </span>
              </div>
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-extrabold leading-tight">{offer.title}</h3>
              {offer.description && (
                <p className="text-[0.82rem] text-white/80 mt-0.5 line-clamp-1">{offer.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[0.78rem] text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <Tag size={11} />
                  {productCount} product{productCount !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono font-bold tabular-nums">
                  <Clock size={11} />
                  Ends in {formatTimeLeft(timeLeft)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("/search?offer=" + offer._id)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-brand-dark rounded-xl font-bold text-sm transition-all hover:bg-brand-light hover:scale-105 shadow-md flex-shrink-0"
            >
              Shop Sale
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Slide indicators (only if multiple) */}
          {liveOffers.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {liveOffers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`rounded-full transition-all ${
                    i === index ? "w-4 h-1 bg-white" : "w-1 h-1 bg-white/40"
                  }`}
                  aria-label={`Show offer ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
