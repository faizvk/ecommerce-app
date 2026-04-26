import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fadeIn } from "../animations/fadeIn";
import { slides } from "../utils/slides";
import { ChevronLeft, ChevronRight } from "lucide-react";

const INTERVAL = 4500;

export default function HeroCarousel() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setProgress(0);
  };

  useEffect(() => {
    setProgress(0);
    const step = 100 / (INTERVAL / 100);
    const progressTimer = setInterval(() => setProgress((p) => Math.min(p + step, 100)), 100);
    const slideTimer = setTimeout(nextSlide, INTERVAL);
    return () => { clearInterval(progressTimer); clearTimeout(slideTimer); };
  }, [index, nextSlide]);

  return (
    <div className="relative w-full h-[260px] sm:h-[360px] lg:h-[500px] overflow-hidden bg-brand-dark">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />

          {/* Multi-layer gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* TEXT CONTENT */}
          <div className="absolute top-1/2 left-5 -translate-y-1/2 z-10 max-w-[260px] sm:left-8 sm:max-w-[360px] lg:left-[8%] lg:max-w-[520px]">
            {/* Category pill */}
            <span className="inline-block mb-2 text-[0.65rem] sm:text-[0.7rem] font-bold tracking-[0.12em] uppercase text-white/60 bg-white/10 border border-white/20 rounded-full px-3 py-1">
              {slide.category}
            </span>

            <h1
              className="text-xl font-extrabold leading-tight mb-2 text-white sm:text-2xl sm:mb-3 lg:text-[2.6rem] lg:leading-[1.15] lg:mb-4"
              {...fadeIn({ direction: "left", distance: 40, duration: 0.7 })}
            >
              {slide.title}
            </h1>

            <p className="hidden sm:block text-sm text-white/80 mb-4 lg:text-base lg:mb-6 leading-relaxed">
              {slide.text}
            </p>

            <button
              onClick={() => navigate(`/search?category=${encodeURIComponent(slide.category)}`)}
              className="bg-white text-brand-dark py-2 px-5 rounded-full font-bold text-sm transition-all duration-200 hover:bg-brand hover:text-white sm:py-2.5 sm:px-7 lg:py-3 lg:px-8 lg:text-[0.95rem] shadow-lg"
            >
              {slide.button}
            </button>
          </div>
        </div>
      ))}

      {/* NAV BUTTONS */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white rounded-full border border-white/25 cursor-pointer z-20 transition-all hover:bg-white/30 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white rounded-full border border-white/25 cursor-pointer z-20 transition-all hover:bg-white/30 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* SLIDE INDICATORS + PROGRESS BAR */}
      <div className="absolute bottom-4 left-5 sm:left-8 lg:left-[8%] z-20 flex items-center gap-3">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setProgress(0); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full cursor-pointer transition-all duration-300 border-0 p-0 ${
                i === index ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/65"
              }`}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-16 sm:w-24 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/80 rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slide count */}
      <div className="absolute bottom-4 right-4 z-20 text-white/50 text-[0.72rem] font-semibold tabular-nums hidden sm:block">
        {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </div>
  );
}
