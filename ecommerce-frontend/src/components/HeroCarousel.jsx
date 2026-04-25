import { useState, useEffect } from "react";
import { fadeIn } from "../animations/fadeIn";
import { slides } from "../utils/slides";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    /* mobile: 260px → tablet: 380px → desktop: 500px */
    <div className="relative w-full h-[260px] sm:h-[360px] lg:h-[500px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img src={slide.image} alt="" className="w-full h-full object-cover" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          <div className="absolute top-1/2 left-5 -translate-y-1/2 text-white z-10 max-w-[260px] sm:left-8 sm:max-w-[360px] lg:left-[8%] lg:max-w-[480px]">
            <h1
              className="text-xl font-extrabold leading-tight mb-2 sm:text-2xl sm:mb-3 lg:text-[2.8rem] lg:mb-4"
              {...fadeIn({ direction: "left", distance: 40, duration: 0.7 })}
            >
              {slide.title}
            </h1>

            <p className="hidden sm:block text-sm text-white/90 mb-4 lg:text-[1.05rem] lg:mb-6">
              {slide.text}
            </p>

            <button className="bg-white text-brand-dark py-2 px-5 rounded-full font-bold text-sm transition-all duration-200 hover:bg-brand hover:text-white sm:py-2.5 sm:px-7 lg:py-3 lg:px-8 lg:text-[0.95rem]">
              {slide.button}
            </button>
          </div>
        </div>
      ))}

      {/* Prev / Next */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 cursor-pointer z-20 transition-all duration-200 hover:bg-white/40"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 cursor-pointer z-20 transition-all duration-200 hover:bg-white/40"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full cursor-pointer transition-all duration-300 border-0 p-0 ${
              i === index ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
