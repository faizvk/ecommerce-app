import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/slice/authSlice";
import { clearCart } from "../redux/slice/cartSlice";
import { LogOut, LogIn, ShoppingCart, X, Menu, ShoppingBag, Heart, Search, Sparkles, ArrowRight } from "lucide-react";
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
  const searchInputRef = useRef(null);

  // Keyboard shortcut: "/" focuses search (desktop only)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isAdminPage = location.pathname.startsWith("/admin");

  const adminLinkLabel = isAdminPage ? "Home" : "Admin Panel";
  const adminLinkTarget = isAdminPage ? "/" : "/admin";

  useEffect(() => { setMenuOpen(false); }, [location]);

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
    try { await dispatch(logoutThunk()).unwrap(); } catch { /* ignore */ }
    dispatch(clearCart());
    navigate("/login", { replace: true });
  };

  if (isAuthPage) return null;

  let hideTimeout;
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <nav className="w-full px-4 md:px-[4%] py-3 md:py-4 flex flex-wrap items-center gap-x-3 gap-y-2 bg-gradient-to-r from-brand-dark via-[#2d2a6e] to-brand-dark text-white sticky top-0 z-50 shadow-[0_2px_20px_rgba(79,70,229,0.35)]">
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

      {/* SEARCH — wraps to row 2 on mobile, middle of row 1 on desktop */}
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
            <div className={`relative flex items-center w-full transition-all duration-200 rounded-2xl ${
              searchFocused
                ? "bg-white shadow-[0_0_0_3px_rgba(129,140,248,0.4),0_8px_24px_rgba(0,0,0,0.12)]"
                : "bg-white/95 hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
            }`}>
              {/* Leading search icon */}
              <div className="flex items-center justify-center pl-3.5 flex-shrink-0">
                {searchLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-brand-medium/30 border-t-brand animate-spin" />
                ) : (
                  <Search size={16} className={searchFocused ? "text-brand" : "text-gray-400"} />
                )}
              </div>

              {/* Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products, brands, categories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 min-w-0 px-3 py-2.5 md:py-3 bg-transparent border-0 text-gray-900 text-[0.9rem] outline-none placeholder:text-gray-400"
              />

              {/* Trailing actions: clear button or kbd hint */}
              {searchText ? (
                <button
                  type="button"
                  onClick={() => { setSearchText(""); searchInputRef.current?.focus(); }}
                  aria-label="Clear search"
                  className="mr-2 w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer border-0 hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd className="hidden md:inline-flex items-center gap-0.5 mr-2.5 px-1.5 py-0.5 text-[0.65rem] font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded">
                  /
                </kbd>
              )}

              {/* Submit button — visible on desktop, hidden on mobile (Enter key still works) */}
              <button
                type="submit"
                disabled={!searchText.trim()}
                aria-label="Search"
                className="hidden md:flex items-center justify-center gap-1 px-4 mr-1 py-1.5 bg-gradient-to-r from-brand to-[#7c3aed] text-white rounded-xl border-0 font-bold text-[0.82rem] cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Search
                <ArrowRight size={13} />
              </button>
            </div>
          </form>

          {/* SUGGESTIONS DROPDOWN */}
          {showSuggestions && searchText.trim() && (
            <div className="absolute top-[calc(100%+8px)] w-full bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] z-[200] overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-gray-500">
                  {searchLoading ? "Searching..." : suggestions.length > 0 ? `Top ${suggestions.length} matches` : "No matches"}
                </span>
                {suggestions.length > 0 && (
                  <span className="text-[0.62rem] text-gray-400 font-medium hidden sm:inline">
                    Press Enter to see all
                  </span>
                )}
              </div>

              {/* Body */}
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
                          <img
                            src={item.image?.[0] || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-11 h-11 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-100"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <p
                              className="text-[0.88rem] text-gray-900 truncate m-0"
                              dangerouslySetInnerHTML={{ __html: name }}
                            />
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

                    {/* See all results footer */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/search?query=${encodeURIComponent(searchText)}`);
                        setShowSuggestions(false);
                      }}
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

      {/* RIGHT SIDE — hamburger on mobile, nav links on desktop */}
      <div className="order-2 ml-auto md:order-3 flex items-center gap-4">
        {/* HAMBURGER — mobile only */}
        <button
          className="flex md:hidden bg-transparent border-0 cursor-pointer p-1 z-[101] text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <span className="text-[0.9rem] font-semibold text-white/80">
                Hello, {firstName}
              </span>

              {user.role === "user" ? (
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

              {user.role === "user" && !isAdminPage && (
                <>
                  <Link
                    to="/wishlist"
                    title="Wishlist"
                    className="relative text-white no-underline transition-all hover:text-brand-medium"
                  >
                    <Heart size={22} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.65rem] font-bold leading-none">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className="relative text-white no-underline transition-all hover:text-brand-medium">
                    <ShoppingCart size={24} />
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2.5 bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.65rem] font-bold leading-none">
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </Link>
                </>
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
      </div>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[98] bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE SLIDE PANEL */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 flex flex-col items-center justify-center gap-7 bg-gradient-to-b from-brand-dark to-[#2d2a6e] shadow-[-8px_0_32px_rgba(79,70,229,0.4)] transition-transform duration-300 z-[99] md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-5 right-5 bg-transparent border-0 cursor-pointer text-white/70 hover:text-white"
          onClick={() => setMenuOpen(false)}
        >
          <X size={24} />
        </button>

        {user ? (
          <>
            <span className="text-base font-semibold text-white">
              Hello, {firstName}
            </span>

            {user.role === "user" ? (
              <>
                <Link to="/profile" className="text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                  My Profile
                </Link>
                <Link to="/orders" className="text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                  My Orders
                </Link>
                <Link to="/wishlist" className="flex items-center gap-1.5 text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                  <Heart size={16} />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link to={adminLinkTarget} className="text-white no-underline font-medium text-[0.95rem] hover:text-brand-medium transition-colors">
                {adminLinkLabel}
              </Link>
            )}

            {user.role === "user" && !isAdminPage && (
              <Link to="/cart" className="relative text-white no-underline transition-all hover:text-brand-medium">
                <ShoppingCart size={26} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.65rem] font-bold leading-none">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-transparent border-0 text-white/80 cursor-pointer transition-all hover:text-white text-base font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 text-white no-underline font-semibold text-base transition-all hover:text-brand-medium"
          >
            <LogIn size={22} />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
