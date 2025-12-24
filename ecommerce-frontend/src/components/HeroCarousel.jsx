import { useState, useEffect } from "react";
import { fadeIn } from "../animations/FadeIn";
import "./styles/HeroCarousel.css";

const slides = [
  {
    id: 1,
    title: "Premium Products for Modern Living",
    text: "Shop top-quality items with unbeatable prices and fast delivery.",
    image: "/main.png",
    button: "Shop Now",
  },
  {
    id: 2,
    title: "Unbeatable Deals",
    text: "Exclusive discounts on your favorite items. Limited time only!",
    image: "/main.png",
    button: "Grab Offer",
  },
  {
    id: 3,
    title: "New Arrivals",
    text: "Explore the latest products handpicked just for you.",
    image: "/main.png",
    button: "Explore Now",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  // Auto-slide every 4 seconds
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
    <div className="carousel-container">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`carousel-slide ${i === index ? "active" : ""}`}
        >
          <img
            src={slide.image}
            alt=""
            className="carousel-img"
            {...fadeIn({
              direction: "up",
              distance: 80,
              duration: 0.9,
            })}
          />

          <div className="carousel-content">
            <h1
              {...fadeIn({
                direction: "left",
                distance: 80,
                duration: 0.9,
              })}
            >
              {slide.title.split(" ").slice(0, 3).join(" ")}{" "}
              <span>{slide.title.split(" ").slice(3).join(" ")}</span>
            </h1>

            <p>{slide.text}</p>

            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/#products")}
              {...fadeIn({
                direction: "right",
                distance: 80,
                duration: 0.9,
              })}
            >
              {slide.button}
            </button>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button className="carousel-btn prev" onClick={prevSlide}>
        ❮
      </button>
      <button className="carousel-btn next" onClick={nextSlide}>
        ❯
      </button>

      {/* Dots */}
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
