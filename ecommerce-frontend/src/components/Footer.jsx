import { useLocation, Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-brand-dark text-white pt-14 pb-8 px-[8%] mt-14 shadow-[0_-4px_10px_rgba(0,0,0,0.08)]">
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-3">MyStore</h3>
          <p className="text-[#dcdcdc] text-sm leading-relaxed">Your trusted destination for premium products.</p>
        </div>

        <div className="flex flex-col">
          <h4 className="font-bold mb-3">Quick Links</h4>
          {[["Home", "/"], ["My Cart", "/cart"], ["My Orders", "/orders"], ["My Profile", "/profile"]].map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="text-[#f0f0f0] text-sm my-1 w-fit transition-all duration-200 hover:text-brand hover:translate-x-1"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col">
          <h4 className="font-bold mb-3">Support</h4>
          {["Help Center", "Refund Policy", "Shipping Info"].map((label) => (
            <a
              key={label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#f0f0f0] text-sm my-1 w-fit transition-all duration-200 hover:text-brand hover:translate-x-1"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex flex-col">
          <h4 className="font-bold mb-3">Contact Us</h4>
          <p className="text-[#dcdcdc] text-sm mb-2">Email: support@mystore.com</p>
          <p className="text-[#dcdcdc] text-sm">Phone: +91-9876543210</p>
        </div>
      </div>

      {/* SOCIAL */}
      <div className="flex justify-center gap-6 my-6 flex-wrap">
        {[
          [FaFacebookF, "https://facebook.com"],
          [FaInstagram, "https://instagram.com"],
          [FaTwitter, "https://twitter.com"],
          [FaLinkedinIn, "https://linkedin.com"],
          [FaYoutube, "https://youtube.com"],
        ].map(([Icon, href], i) => (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-white text-xl flex items-center justify-center transition-all duration-300 hover:text-brand hover:-translate-y-1"
          >
            <Icon />
          </a>
        ))}
      </div>

      {/* BOTTOM */}
      <div className="text-center border-t border-white/20 pt-5 text-sm opacity-85">
        <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
      </div>
    </footer>
  );
}
