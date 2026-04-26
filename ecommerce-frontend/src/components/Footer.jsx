import { useLocation, Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const socialLinks = [
  [FaInstagram, "https://instagram.com"],
  [FaFacebookF, "https://facebook.com"],
  [FaTwitter, "https://twitter.com"],
  [FaLinkedinIn, "https://linkedin.com"],
  [FaYoutube, "https://youtube.com"],
];

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-brand-dark text-white pt-10 pb-6 px-5 md:px-[6%] mt-16">
      {/* GRID — 1 col mobile → 2 cols tablet → 4 cols desktop */}
      <div className="grid grid-cols-1 gap-8 mb-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* BRAND */}
        <div>
          <h3 className="text-xl font-extrabold mb-1 tracking-tight">
            <span className="text-white">Nex</span><span className="text-brand-medium">Kart</span>
          </h3>
          <p className="text-white/40 text-xs mb-2 font-medium tracking-wide">Shop Smart, Live Better</p>
          <p className="text-white/60 text-sm leading-relaxed max-w-[220px]">
            Your one-stop destination for electronics, fashion, home appliances and more.
          </p>
          <div className="flex gap-3 mt-5">
            {socialLinks.map(([Icon, href], i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-sm transition-all hover:bg-brand hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider text-white/50 mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2.5">
            {[["Home", "/"], ["My Cart", "/cart"], ["My Orders", "/orders"], ["My Profile", "/profile"]].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="text-white/65 text-sm w-fit no-underline transition-all hover:text-white hover:translate-x-1"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider text-white/50 mb-4">Support</h4>
          <div className="flex flex-col gap-2.5">
            {["Help Center", "Refund Policy", "Shipping Info", "Privacy Policy"].map((label) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-white/65 text-sm w-fit no-underline transition-all hover:text-white hover:translate-x-1"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider text-white/50 mb-4">Contact</h4>
          <div className="flex flex-col gap-2.5 text-white/65 text-sm">
            <span>support@nexkart.com</span>
            <span>+91-9876543210</span>
            <span className="mt-1 text-white/40 text-xs leading-relaxed">
              Mon–Sat, 9am–6pm IST
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6 flex-wrap gap-3">
        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} NexKart. All rights reserved.
        </p>
        <p className="text-white/30 text-xs">
          Made with ♥ in India
        </p>
      </div>
    </footer>
  );
}
