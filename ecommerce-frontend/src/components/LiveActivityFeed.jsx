import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { ShoppingBag, MapPin } from "lucide-react";

/**
 * Live activity feed — a small social-proof ticker showing rotating
 * 'someone just bought X' lines. Builds confidence ('this site is
 * real, people are buying') without being intrusive.
 *
 * The names + cities are synthetic — randomized from a pool — paired
 * with real in-stock products pulled from the Redux store. The 'just
 * now' / '2 min ago' timestamps are derived from a per-line random
 * offset so they feel believable.
 *
 * Rotates every 4 seconds with a fade transition. If there are no
 * products yet, the component renders nothing.
 */

const FIRST_NAMES = [
  "Aarav", "Saanvi", "Vivaan", "Diya", "Rohan", "Anaya", "Ishaan", "Myra",
  "Kabir", "Aanya", "Arjun", "Pari", "Vihaan", "Riya", "Neel", "Tara",
  "Reyansh", "Aadhya", "Zayn", "Meera", "Faiz", "Sara", "Aryan", "Kiara",
];

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Indore", "Chandigarh", "Goa",
];

const TIME_PHRASES = [
  "just now", "1 min ago", "2 min ago", "3 min ago", "5 min ago", "7 min ago",
];

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

// Cheap deterministic-feeling pseudo-random for line variety based on index
function lineForProduct(product, i) {
  const seed = (product._id?.charCodeAt(0) || 0) + i * 31;
  return {
    name: pick(FIRST_NAMES, seed),
    city: pick(CITIES, seed + 7),
    time: pick(TIME_PHRASES, seed + 13),
    product,
  };
}

export default function LiveActivityFeed() {
  const products = useSelector((s) => s.product.products) || [];
  const [index, setIndex] = useState(0);

  // Pre-compute a stable rotation list. Pick 12 random in-stock products so
  // the feed cycles through some variety before repeating.
  const feed = useMemo(() => {
    const inStock = products.filter((p) => p.stock > 0);
    if (inStock.length === 0) return [];
    const shuffled = [...inStock].sort(() => 0.5 - Math.random()).slice(0, 12);
    return shuffled.map((p, i) => lineForProduct(p, i));
  }, [products]);

  useEffect(() => {
    if (feed.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % feed.length), 4000);
    return () => clearInterval(id);
  }, [feed.length]);

  if (feed.length === 0) return null;
  const line = feed[index];

  return (
    <section className="max-w-[1320px] mx-auto px-2 md:px-4 mt-3">
      <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_8px_24px_rgba(16,185,129,0.25)]">
        {/* Decorative bg orbs */}
        <div className="absolute -top-6 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-8 left-1/3 w-24 h-24 rounded-full bg-black/10 blur-2xl" />

        {/* Animated 'Live' pill — sits on a darker glass plate so it pops on the gradient */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-80 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-white">Live</span>
        </div>

        <div className="relative px-[88px] py-3 flex items-center gap-2 text-[0.78rem] md:text-[0.85rem] text-white">
          <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={13} className="text-white" />
          </div>
          {/* The text element gets a key change on every tick so React replays
              the CSS fade-in keyframes — cheap crossfade without a heavy lib. */}
          <p key={index} className="truncate animate-[fadeIn_0.4s_ease-out]">
            <span className="font-extrabold text-white">{line.name}</span>
            <span className="text-white/70"> in </span>
            <span className="inline-flex items-center gap-0.5 font-bold text-white/95">
              <MapPin size={11} /> {line.city}
            </span>
            <span className="text-white/70"> just bought </span>
            <span className="font-extrabold text-white underline decoration-white/40 underline-offset-2">{line.product.name}</span>
            <span className="text-white/55 ml-2">· {line.time}</span>
          </p>
        </div>
      </div>

      {/* Local keyframe — small enough not to deserve a tailwind config entry */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
