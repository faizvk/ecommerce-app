import { useLocation, Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { ShoppingBag, Mail } from "lucide-react";

const socialLinks = [
  [FaInstagram, "https://instagram.com", "Instagram"],
  [FaFacebookF, "https://facebook.com", "Facebook"],
  [FaTwitter, "https://twitter.com", "Twitter"],
  [FaLinkedinIn, "https://linkedin.com", "LinkedIn"],
  [FaYoutube, "https://youtube.com", "YouTube"],
];

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-gradient-to-br from-brand-dark via-[#2d2a6e] to-brand-dark text-white mt-16">
      {/* NEWSLETTER STRIP */}
      <div className="border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 md:px-[6%] py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[0.92rem] font-bold text-white">Get exclusive deals in your inbox</p>
              <p className="text-[0.75rem] text-white/50">No spam, unsubscribe anytime.</p>
            </div>
          </div>
          <form
            className="flex gap-2 w-full sm:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 sm:w-56 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[0.85rem] outline-none focus:border-brand-medium transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand rounded-xl text-white text-[0.85rem] font-semibold border-0 cursor-pointer transition-all hover:bg-brand-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-[6%] pt-10 pb-6">
        <div className="grid grid-cols-1 gap-8 mb-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <ShoppingBag size={17} className="text-white" />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">
                <span className="text-white">Nex</span><span className="text-brand-medium">Kart</span>
              </h3>
            </div>
            <p className="text-white/50 text-xs font-medium mb-3 tracking-wide uppercase">Shop Smart, Live Better</p>
            <p className="text-white/55 text-sm leading-relaxed max-w-[200px]">
              Your one-stop destination for electronics, fashion, home appliances and more.
            </p>
            <div className="flex gap-2.5 mt-5">
              {socialLinks.map(([Icon, href, label], i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm transition-all hover:bg-brand hover:text-white hover:scale-110"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-bold text-[0.7rem] uppercase tracking-[0.12em] text-white/40 mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[["Home", "/"], ["My Cart", "/cart"], ["My Orders", "/orders"], ["My Profile", "/profile"]].map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  className="text-white/60 text-sm w-fit no-underline transition-all hover:text-white hover:translate-x-1 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-brand-medium inline-block" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="font-bold text-[0.7rem] uppercase tracking-[0.12em] text-white/40 mb-4">Support</h4>
            <div className="flex flex-col gap-2.5">
              {["Help Center", "Refund Policy", "Shipping Info", "Privacy Policy"].map((label) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-white/60 text-sm w-fit no-underline transition-all hover:text-white hover:translate-x-1 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-brand-medium inline-block" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-bold text-[0.7rem] uppercase tracking-[0.12em] text-white/40 mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3 text-white/60 text-sm">
              <a href="mailto:support@nexkart.com" className="no-underline text-white/60 hover:text-white transition-colors">
                support@nexkart.com
              </a>
              <span>+91-9876543210</span>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 mt-1">
                <p className="text-[0.7rem] font-bold text-white/50 uppercase tracking-wider mb-0.5">Working Hours</p>
                <p className="text-white/70 text-[0.82rem]">Mon–Sat, 9am–6pm IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 flex-wrap gap-3">
          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} NexKart. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/25 text-xs">Made with ♥ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
