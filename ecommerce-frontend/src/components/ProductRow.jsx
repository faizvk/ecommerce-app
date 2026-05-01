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

        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="flex items-center gap-1 px-3.5 py-1.5 text-[0.8rem] font-bold text-brand bg-brand-light border border-brand/25 rounded-full no-underline transition-all hover:bg-brand hover:text-white whitespace-nowrap flex-shrink-0"
          >
            {viewAllLabel}
            <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {/* SCROLLER */}
      <div className="relative -mx-4 md:-mx-6">
        {/* Edge fade — left */}
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-r from-[#f0f0ff] via-[#f0f0ff]/80 to-transparent transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Edge fade — right */}
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-l from-[#f0f0ff] via-[#f0f0ff]/80 to-transparent transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Inline left hint */}
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className={`absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 text-gray-500 hover:text-brand bg-transparent border-0 cursor-pointer text-[0.72rem] font-bold uppercase tracking-wider transition-all ${
            canScrollLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={16} />
          Scroll
        </button>

        {/* Inline right hint */}
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className={`absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 text-gray-500 hover:text-brand bg-transparent border-0 cursor-pointer text-[0.72rem] font-bold uppercase tracking-wider transition-all ${
            canScrollRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          Scroll
          <ChevronRight size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 md:px-6 py-3"
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
