import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductRow({
  title,
  subtitle,
  icon: Icon,
  accent = "from-brand to-brand-medium",
  products = [],
  viewAllHref,
  viewAllLabel = "View All",
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products.length]);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.9), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="mb-10 md:mb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-1.5 h-9 rounded-full bg-gradient-to-b ${accent} flex-shrink-0`} />
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 leading-tight flex items-center gap-2">
              {Icon && <Icon size={18} className="text-brand" />}
              {title}
            </h2>
            {subtitle && (
              <p className="text-[0.78rem] md:text-[0.82rem] text-gray-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Scroll buttons (desktop only) */}
          <div className="hidden md:flex gap-1.5">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="flex items-center gap-1 px-3.5 py-1.5 text-[0.8rem] font-bold text-brand bg-brand-light border border-brand/25 rounded-full no-underline transition-all hover:bg-brand hover:text-white whitespace-nowrap"
            >
              {viewAllLabel}
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* SCROLLER */}
      <div className="relative -mx-4 md:-mx-6">
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 md:px-6"
        >
          {products.map((p) => (
            <div
              key={p._id}
              className="w-[170px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0 snap-start"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
