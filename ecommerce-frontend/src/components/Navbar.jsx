import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/slice/authSlice";
import { clearCart } from "../redux/slice/cartSlice";
import { LogOut, LogIn, ShoppingCart, X, Menu, ShoppingBag, Heart } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isAdminPage = location.pathname.startsWith("/admin");

  const adminLinkLabel = isAdminPage ? "Home" : "Admin Panel";
  const adminLinkTarget = isAdminPage ? "/" : "/admin";

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    if (isAuthPage || isAdminPage) return;
    const delay = setTimeout(() => {
      if (!searchText.trim()) { setSuggestions([]); return; }
      api.get("/product/search", { params: { name: searchText, limit: 5, page: 1 } })
        .then((res) => setSuggestions(res.data.products || []))
        .catch(() => setSuggestions([]));
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
          className="order-3 w-full md:order-2 md:w-[42%] md:flex-1 md:max-w-[520px] relative"
          onMouseEnter={() => { clearTimeout(hideTimeout); setShowSuggestions(true); }}
          onMouseLeave={() => { hideTimeout = setTimeout(() => setShowSuggestions(false), 150); }}
        >
          <form
            className="flex items-center w-full"
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchText.trim()) return;
              navigate(`/search?query=${encodeURIComponent(searchText)}`);
              setShowSuggestions(false);
            }}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 md:py-2.5 rounded-l-lg border-0 bg-white/95 text-gray-900 text-[0.9rem] outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-3 md:px-4 py-[9px] md:py-[11px] bg-brand text-white rounded-r-lg border-0 font-semibold text-sm cursor-pointer transition-all hover:bg-white hover:text-brand-dark whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {showSuggestions && searchText.trim() && (
            <div className="absolute top-[calc(100%+6px)] w-full bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] z-[200] max-h-64 overflow-y-auto border border-gray-100">
              {suggestions.length > 0 ? (
                suggestions.map((item) => {
                  const name = item.name.replace(
                    new RegExp(searchText, "i"),
                    (match) => `<strong>${match}</strong>`
                  );
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 transition-colors hover:bg-brand-light"
                      onClick={() => { navigate(`/product/${item._id}`); setShowSuggestions(false); setSearchText(""); }}
                    >
                      <img
                        src={item.image?.[0] || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <p
                          className="text-[0.9rem] font-medium text-gray-900 truncate m-0"
                          dangerouslySetInnerHTML={{ __html: name }}
                        />
                        <span className="text-[0.8rem] text-brand font-semibold">₹{item.salePrice}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 py-5 text-sm">No results found</p>
              )}
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
