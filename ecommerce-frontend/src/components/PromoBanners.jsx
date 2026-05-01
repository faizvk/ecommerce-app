import { Link } from "react-router-dom";
import { ChevronRight, Zap, Shirt, Coffee, Cpu } from "lucide-react";

const BANNERS = [
  {
    title: "Tech Mega Sale",
    subtitle: "Up to 60% off",
    accent: "Save big on the latest gadgets",
    icon: Cpu,
    gradient: "from-blue-500 via-indigo-500 to-violet-600",
    href: "/search?category=technology",
    cta: "Shop Tech",
    decorEmoji: "💻",
  },
  {
    title: "Fashion Frenzy",
    subtitle: "Up to 50% off",
    accent: "Refresh your wardrobe",
    icon: Shirt,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    href: "/search?category=fashion",
    cta: "Shop Fashion",
    decorEmoji: "👗",
  },
  {
    title: "Daily Essentials",
    subtitle: "Fresh & on time",
    accent: "Dairy delivered to your door",
    icon: Coffee,
    gradient: "from-amber-400 via-orange-400 to-red-400",
    href: "/search?category=dairy",
    cta: "Shop Dairy",
    decorEmoji: "🥛",
  },
  {
    title: "Smart Home",
    subtitle: "From ₹999",
    accent: "Modern living essentials",
    icon: Zap,
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    href: "/search?category=home%20appliances",
    cta: "Shop Now",
    decorEmoji: "🏠",
  },
];

export default function PromoBanners() {
  return (
    <section className="mb-10 md:mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {BANNERS.map((b) => {
          const Icon = b.icon;
          return (
            <Link
              key={b.title}
              to={b.href}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} text-white no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] shadow-md group`}
            >
              {/* Decorative blurs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

              {/* Big background emoji */}
              <span className="absolute -bottom-3 -right-2 text-7xl opacity-25 select-none transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {b.decorEmoji}
              </span>

              <div className="relative p-5 md:p-6 min-h-[150px] md:min-h-[170px] flex flex-col">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mb-3">
                  <Icon size={17} className="text-white" />
                </div>

                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/70 mb-1">
                  {b.accent}
                </p>
                <h3 className="text-lg md:text-xl font-extrabold leading-tight mb-1">{b.title}</h3>
                <p className="text-[0.92rem] md:text-base font-extrabold text-white/95">{b.subtitle}</p>

                <span className="mt-auto inline-flex items-center gap-1 text-[0.78rem] font-bold pt-3 group-hover:translate-x-1 transition-transform">
                  {b.cta}
                  <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
