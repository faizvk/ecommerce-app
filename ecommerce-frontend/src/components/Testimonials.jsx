import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Order arrived a day early, packaging was excellent and the product quality matched the photos. NexKart's become my go-to for electronics.",
    name: "Priya S.",
    location: "Bengaluru",
    rating: 5,
    avatarBg: "from-brand to-[#7c3aed]",
  },
  {
    quote:
      "Best prices I found anywhere — and the delivery tracker actually works. Returned one item and got a full refund within 3 days.",
    name: "Rohit K.",
    location: "Mumbai",
    rating: 5,
    avatarBg: "from-amber-400 to-orange-500",
  },
  {
    quote:
      "The wishlist feature saved me a fortune during the sale. Stocked up on all the items I'd been eyeing for weeks. Smooth experience.",
    name: "Ananya M.",
    location: "Delhi",
    rating: 4,
    avatarBg: "from-emerald-400 to-teal-500",
  },
];

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? "currentColor" : "none"}
          className={i < rating ? "text-amber-400" : "text-gray-200"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="mb-10 md:mb-14">
      <div className="text-center mb-7">
        <span className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand mb-2">
          Customer Stories
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Loved by shoppers across India
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => {
          const initials = t.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("");
          return (
            <div
              key={i}
              className="relative bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-card hover:border-brand/20 hover:shadow-hover transition-all"
            >
              <Quote
                size={28}
                className="absolute top-4 right-4 text-brand-light"
                fill="currentColor"
                strokeWidth={0}
              />
              <StarRow rating={t.rating} />
              <p className="text-[0.92rem] text-gray-700 leading-relaxed mt-3 mb-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.88rem] font-bold text-gray-900 leading-tight">{t.name}</p>
                  <p className="text-[0.75rem] text-gray-400">{t.location}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
