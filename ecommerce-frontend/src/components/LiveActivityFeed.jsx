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
      <div className="relative overflow-hidden rounded-full bg-white border border-gray-100 shadow-card">
        {/* Animated dot — signals 'live' */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-emerald-700">Live</span>
        </div>

        <div className="px-[78px] py-2.5 flex items-center gap-2 text-[0.78rem] md:text-[0.85rem]">
          <ShoppingBag size={14} className="text-brand flex-shrink-0" />
          {/* The text element gets a key change on every tick so React replays
              the CSS fade-in keyframes — cheap crossfade without a heavy lib. */}
          <p key={index} className="text-gray-700 truncate animate-[fadeIn_0.4s_ease-out]">
            <span className="font-extrabold text-gray-900">{line.name}</span>
            <span className="text-gray-400"> in </span>
            <span className="inline-flex items-center gap-0.5 font-bold text-gray-600">
              <MapPin size={11} /> {line.city}
            </span>
            <span className="text-gray-400"> just bought </span>
            <span className="font-bold text-brand">{line.product.name}</span>
            <span className="text-gray-300 ml-2">· {line.time}</span>
          </p>
        </div>
      </div>

      {/* Local keyframe — small enough not to deserve a tailwind config entry */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
