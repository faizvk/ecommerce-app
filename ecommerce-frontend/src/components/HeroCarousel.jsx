import { useState, useEffect } from "react";
import { fadeIn } from "../animations/fadeIn";
import { slides } from "../utils/slides";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[520px] overflow-hidden shadow-card mt-6 md:h-[400px] sm:h-[320px] xs:h-[250px]">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ${
            i === index ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
            {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
          />

          {/* Overlay on small screens */}
          <div className="absolute inset-0 bg-black/0 sm:bg-black/30" />

          <div className="absolute top-1/2 left-[8%] -translate-y-1/2 text-white max-w-[450px] [text-shadow:0_3px_8px_rgba(0,0,0,0.4)] z-10 md:max-w-[320px] sm:left-[5%] sm:right-[5%] sm:max-w-full sm:text-center">
            <h1
              className="text-[2.6rem] font-extrabold leading-tight md:text-3xl sm:text-2xl"
              {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
            >
              {slide.title.split(" ").slice(0, 3).join(" ")}{" "}
              <span className="text-brand">{slide.title.split(" ").slice(3).join(" ")}</span>
            </h1>

            <p className="my-3 text-[1.1rem] md:text-base sm:text-sm sm:my-2">{slide.text}</p>

            <button
              className="bg-brand text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:bg-brand-dark"
              {...fadeIn({ direction: "right", distance: 80, duration: 0.9 })}
            >
              {slide.button}
            </button>
          </div>
        </div>
      ))}

      {/* Prev / Next */}
      <button
        onClick={prevSlide}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white text-3xl px-3.5 py-2 bg-transparent border-0 rounded-full cursor-pointer z-20 transition-all duration-200 hover:bg-gray-500/55 sm:text-2xl sm:px-2.5 sm:py-1"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white text-3xl px-3.5 py-2 bg-transparent border-0 rounded-full cursor-pointer z-20 transition-all duration-200 hover:bg-gray-500/55 sm:text-2xl sm:px-2.5 sm:py-1"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <span
            key={i}
            onClick={() => setIndex(i)}
            className={`block rounded-full cursor-pointer transition-all duration-300 ${
              i === index
                ? "w-3 h-3 bg-brand scale-125"
                : "w-3 h-3 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
