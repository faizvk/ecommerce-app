import "./styles/Hero.css";
import useFadeIn from "../hooks/useFadeIn";

export default function Hero() {
  const fadeLeft = useFadeIn(500); // for text
  const fadeRight = useFadeIn(650); // for image

  return (
    <section className="hero-section">
      <div className="hero-content" style={fadeLeft.style}>
        <h1>
          Premium Products for <span>Modern Living</span>
        </h1>

        <p>
          Explore top-quality items at unbeatable prices. Shop now and enjoy
          fast delivery, excellent support, and a secure shopping experience.
        </p>

        <button
          className="btn btn-primary hero-btn"
          onClick={() => (window.location.href = "/#products")}
        >
          Shop Now
        </button>
      </div>

      <div className="hero-image" style={fadeRight.style}>
        <img src="/main.png" alt="Hero Banner" />
      </div>
    </section>
  );
}
