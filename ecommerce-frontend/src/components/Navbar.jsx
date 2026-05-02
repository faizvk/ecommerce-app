import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/slice/authSlice";
import { clearCart } from "../redux/slice/cartSlice";
import {
  LogOut, LogIn, ShoppingCart, X, Menu, ShoppingBag, Heart, Search,
  ArrowRight, User as UserIcon, ClipboardList, Shield, ChevronRight,
} from "lucide-react";
import api from "../api/api";
import { useWishlist } from "../hooks/useWishlist";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { count } = useSelector((state) => state.cart);
  const { count: wishlistCount } = useWishlist();

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  // Track scroll position so navbar can shift to a glassy translucent state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isAdminPage = location.pathname.startsWith("/admin");

  const adminLinkLabel = isAdminPage ? "Home" : "Admin Panel";
  const adminLinkTarget = isAdminPage ? "/" : "/admin";

  useEffect(() => { setMenuOpen(false); }, [location]);

  // Click outside / Escape to close menu
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleEsc = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isAuthPage || isAdminPage) return;
    if (!searchText.trim()) { setSuggestions([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    const delay = setTimeout(() => {
      api.get("/product/search", { params: { name: searchText, limit: 5, page: 1 } })
        .then((res) => setSuggestions(res.data.products || []))
        .catch(() => setSuggestions([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchText, isAuthPage, isAdminPage]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try { await dispatch(logoutThunk()).unwrap(); } catch { /* ignore */ }
    dispatch(clearCart());
    navigate("/login", { replace: true });
  };

  if (isAuthPage) return null;

  let hideTimeout;
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const initials = user?.name ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "";
  const isCustomer = user?.role === "user";
  const showCartIcons = isCustomer && !isAdminPage;

  // Reusable dropdown item style
  const itemCls =
    "flex items-center gap-3 px-4 py-2.5 text-[0.88rem] font-medium text-gray-700 no-underline hover:bg-gray-50 transition-colors w-full bg-transparent border-0 cursor-pointer text-left";

  return (
    <nav className={`w-full px-4 md:px-[4%] py-2.5 md:py-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-white sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-brand-dark/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
        : "bg-gradient-to-r from-brand-dark via-[#2d2a6e] to-brand-dark shadow-[0_2px_20px_rgba(79,70,229,0.35)]"
    }`}>
      {/* LOGO */}
      <Link
        to={isAdminPage ? "/admin" : "/"}
        className="order-1 flex-shrink-0 flex items-center gap-2 no-underline transition-opacity hover:opacity-85 z-[101]"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <span className="text-xl md:text-[1.6rem] font-extrabold tracking-tight leading-none">
          {isAdminPage ? (
            <><span className="text-white">Nex</span><span className="text-brand-medium">Kart</span> <span className="text-white/50 font-semibold text-sm md:text-base">Admin</span></>
          ) : (
            <><span className="text-white">Nex</span><span className="text-brand-medium">Kart</span></>
          )}
        </span>
      </Link>

      {/* SEARCH */}
      {!isAdminPage && (
        <div
          className="order-3 w-full md:order-2 md:w-[42%] md:flex-1 md:max-w-[560px] relative"
          onMouseEnter={() => { clearTimeout(hideTimeout); setShowSuggestions(true); }}
          onMouseLeave={() => { hideTimeout = setTimeout(() => setShowSuggestions(false), 150); }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchText.trim()) return;
              navigate(`/search?query=${encodeURIComponent(searchText)}`);
              setShowSuggestions(false);
              searchInputRef.current?.blur();
            }}
          >
            <div className={`relative flex items-center w-full overflow-hidden transition-all duration-200 rounded-2xl ${
              searchFocused
                ? "bg-white shadow-[0_0_0_3px_rgba(129,140,248,0.4),0_8px_24px_rgba(0,0,0,0.12)]"
                : "bg-white/95 hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
            }`}>
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center justify-center pl-3 pr-1 flex-shrink-0 bg-transparent border-0 cursor-pointer"
              >
                <Search size={16} className={searchFocused ? "text-brand" : "text-gray-400"} />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 min-w-0 px-2.5 py-2 bg-transparent border-0 text-gray-900 text-[0.88rem] outline-none placeholder:text-gray-400"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => { setSearchText(""); searchInputRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="mr-2 w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer border-0 hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </form>

          {showSuggestions && searchText.trim() && (
            <div className="absolute top-[calc(100%+8px)] w-full bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] z-[200] overflow-hidden border border-gray-100">
              {suggestions.length > 0 && (
                <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50/70 border-b border-gray-100">
                  <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-gray-500">
                    {`Top ${suggestions.length} matches`}
                  </span>
                  <span className="text-[0.62rem] text-gray-400 font-medium hidden sm:inline">Press Enter to see all</span>
                </div>
              )}
              <div className="max-h-80 overflow-y-auto">
                {suggestions.length > 0 ? (
                  <>
                    {suggestions.map((item) => {
                      const name = item.name.replace(
                        new RegExp(searchText, "i"),
                        (match) => `<mark class="bg-yellow-100 text-gray-900 font-bold rounded px-0.5">${match}</mark>`
                      );
                      return (
                        <button
                          key={item._id}
                          type="button"
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors hover:bg-brand-light/60 w-full text-left bg-transparent"
                          onClick={() => { navigate(`/product/${item._id}`); setShowSuggestions(false); setSearchText(""); }}
                        >
                          <img src={item.image?.[0] || "/placeholder.jpg"} alt={item.name} className="w-11 h-11 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-100" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-[0.88rem] text-gray-900 truncate m-0" dangerouslySetInnerHTML={{ __html: name }} />
                            <span className="text-[0.72rem] text-gray-400 capitalize">{item.category}</span>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-[0.88rem] font-extrabold text-brand">₹{item.salePrice}</span>
                            {item.costPrice > item.salePrice && (
                              <span className="text-[0.65rem] text-gray-400 line-through">₹{item.costPrice}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => { navigate(`/search?query=${encodeURIComponent(searchText)}`); setShowSuggestions(false); }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-brand-light/60 to-[#f5f0ff] text-brand-dark text-[0.82rem] font-bold cursor-pointer border-0 hover:from-brand-light hover:to-brand-light transition-colors border-t border-gray-100"
                    >
                      See all results for "{searchText}"
                      <ArrowRight size={13} />
                    </button>
                  </>
                ) : !searchLoading ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Search size={18} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">No matches found</p>
                    <p className="text-[0.78rem] text-gray-400 mt-0.5">Try different keywords or check spelling</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-brand-medium/30 border-t-brand animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RIGHT SIDE */}
      <div className="order-2 ml-auto md:order-3 flex items-center gap-3 md:gap-5">
        {/* Wishlist & Cart — always visible for customers, on both mobile and desktop */}
        {showCartIcons && (
          <>
            <Link
              to="/wishlist"
              title="Wishlist"
              className="relative text-white no-underline transition-all hover:text-brand-medium"
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.62rem] font-bold leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              title="Cart"
              className="relative text-white no-underline transition-all hover:text-brand-medium"
            >
              <ShoppingCart size={23} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.62rem] font-bold leading-none">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </>
        )}

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <span className="text-[0.9rem] font-semibold text-white/80">Hello, {firstName}</span>
              {isCustomer ? (
                <>
                  <Link to="/profile" className="text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                    My Profile
                  </Link>
                  <Link to="/orders" className="text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                    My Orders
                  </Link>
                </>
              ) : (
                <Link to={adminLinkTarget} className="text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                  {adminLinkLabel}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-transparent border-0 text-white/80 cursor-pointer flex items-center justify-center transition-all hover:text-white"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-white no-underline font-semibold text-[0.9rem] transition-all hover:text-brand-medium"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* HAMBURGER + DROPDOWN — mobile only */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border transition-all ${
              menuOpen
                ? "bg-white text-brand-dark border-white"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
            }`}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          {/* Dropdown */}
          <div
            className={`absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.22)] border border-gray-100 overflow-hidden origin-top-right transition-all duration-200 ${
              menuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
            }`}
          >
            {user ? (
              <>
                {/* Header strip */}
                <div className="bg-gradient-to-r from-brand-dark via-brand to-[#7c3aed] text-white px-4 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center font-extrabold text-[0.78rem]">
                    {initials || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/70">Signed in as</p>
                    <p className="text-[0.88rem] font-bold leading-tight truncate">{firstName}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {isCustomer ? (
                    <>
                      <Link to="/profile" className={itemCls}>
                        <UserIcon size={15} className="text-brand" />
                        My Profile
                        <ChevronRight size={13} className="ml-auto text-gray-300" />
                      </Link>
                      <Link to="/orders" className={itemCls}>
                        <ClipboardList size={15} className="text-brand" />
                        My Orders
                        <ChevronRight size={13} className="ml-auto text-gray-300" />
                      </Link>
                      <Link to="/wishlist" className={itemCls}>
                        <Heart size={15} className="text-brand" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/cart" className={itemCls}>
                        <ShoppingCart size={15} className="text-brand" />
                        Cart
                        {count > 0 && (
                          <span className="ml-auto bg-brand text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </Link>
                    </>
                  ) : (
                    <Link to={adminLinkTarget} className={itemCls}>
                      <Shield size={15} className="text-brand" />
                      {adminLinkLabel}
                      <ChevronRight size={13} className="ml-auto text-gray-300" />
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-100">
                  <button onClick={handleLogout} className={`${itemCls} text-red-500`}>
                    <LogOut size={15} className="text-red-500" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand to-[#7c3aed] text-white rounded-xl font-bold text-[0.88rem] no-underline transition-all hover:opacity-90"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <p className="text-[0.78rem] text-gray-500 text-center mt-2">
                  New here?{" "}
                  <Link to="/signup" className="text-brand font-bold no-underline">Create account</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
