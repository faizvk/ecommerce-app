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
    <div className="relative w-full h-[500px] overflow-hidden md:h-[380px] sm:h-[280px]">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent sm:from-black/60 sm:via-black/40" />

          <div className="absolute top-1/2 left-[8%] -translate-y-1/2 text-white max-w-[480px] z-10 md:max-w-[340px] sm:left-5 sm:right-5 sm:max-w-full">
            <h1
              className="text-[2.8rem] font-extrabold leading-tight mb-4 md:text-2xl sm:text-xl sm:mb-2"
              {...fadeIn({ direction: "left", distance: 40, duration: 0.7 })}
            >
              {slide.title}
            </h1>

            <p className="text-[1.05rem] text-white/90 mb-6 md:text-sm sm:text-sm sm:mb-4 sm:hidden">
              {slide.text}
            </p>

            <button
              className="bg-white text-brand-dark py-3 px-8 rounded-full font-bold text-[0.95rem] transition-all duration-200 hover:bg-brand hover:text-white sm:py-2.5 sm:px-6 sm:text-sm"
            >
              {slide.button}
            </button>
          </div>
        </div>
      ))}

      {/* Prev / Next */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 cursor-pointer z-20 transition-all duration-200 hover:bg-white/40 sm:w-8 sm:h-8"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 cursor-pointer z-20 transition-all duration-200 hover:bg-white/40 sm:w-8 sm:h-8"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full cursor-pointer transition-all duration-300 border-0 p-0 ${
              i === index
                ? "w-6 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
