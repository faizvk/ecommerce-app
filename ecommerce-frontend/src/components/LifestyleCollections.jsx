import { Link } from "react-router-dom";
import { Briefcase, Dumbbell, Gift, CloudRain, Plane, Heart, ChevronRight } from "lucide-react";

/**
 * Lifestyle collections — curated tiles that reframe the catalog around
 * shopping INTENT instead of categories. A user looking for "work from home
 * essentials" doesn't want to dig through Electronics + Home + Books — they
 * want a hand-picked bundle. Each tile maps to a pre-built search URL.
 *
 * The underlying queries combine category + text-query so they work with
 * the existing search backend without any new endpoints.
 */

const COLLECTIONS = [
  {
    title: "Work from Home",
    sub: "Desk · chair · webcam · more",
    icon: Briefcase,
    href: "/search?query=desk",
    accent: "from-sky-400 to-blue-600",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&auto=format",
  },
  {
    title: "Gym Starter Kit",
    sub: "Dumbbells · mats · bands",
    icon: Dumbbell,
    href: "/search?category=sports",
    accent: "from-orange-400 to-red-600",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format",
  },
  {
    title: "Gifts under ₹999",
    sub: "Thoughtful, on budget",
    icon: Gift,
    href: "/search?max=999&sort=salePrice-desc",
    accent: "from-pink-400 to-rose-600",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80&auto=format",
  },
  {
    title: "Monsoon Ready",
    sub: "Stay dry · stay cosy",
    icon: CloudRain,
    href: "/search?query=jacket",
    accent: "from-slate-500 to-indigo-700",
    image: "https://images.unsplash.com/photo-1438786657495-640937046d24?w=600&q=80&auto=format",
  },
  {
    title: "Travel Essentials",
    sub: "Backpacks · earbuds · power banks",
    icon: Plane,
    href: "/search?query=backpack",
    accent: "from-amber-400 to-yellow-600",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80&auto=format",
  },
  {
    title: "Self-Care Sunday",
    sub: "Skincare · candles · cosy reads",
    icon: Heart,
    href: "/search?category=beauty",
    accent: "from-violet-400 to-purple-600",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80&auto=format",
  },
];

export default function LifestyleCollections() {
  return (
    <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-8">
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-brand to-[#7c3aed]" />
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 leading-tight">Shop by Mood</h2>
            <p className="text-[0.8rem] text-gray-400 mt-0.5">Curated picks for every occasion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {COLLECTIONS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.href}
              className="group relative rounded-2xl overflow-hidden text-white no-underline shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all"
            >
              <img
                src={c.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-85`} />
              <div className="relative p-4 md:p-5 min-h-[120px] md:min-h-[140px] flex flex-col justify-end">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center mb-2 self-start">
                  <Icon size={17} />
                </div>
                <h3 className="text-base md:text-lg font-extrabold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                  {c.title}
                </h3>
                <p className="text-[0.74rem] md:text-[0.8rem] text-white/85 mt-0.5 line-clamp-1">{c.sub}</p>
                <span className="mt-2 inline-flex items-center gap-0.5 text-[0.74rem] font-extrabold opacity-90 group-hover:translate-x-1 transition-transform">
                  Explore <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
