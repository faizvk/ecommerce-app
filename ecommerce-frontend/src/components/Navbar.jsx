import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/slice/authSlice";
import { clearCart } from "../redux/slice/cartSlice";
import { LogOut, LogIn, ShoppingCart, X } from "lucide-react";
import api from "../api/api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { count } = useSelector((state) => state.cart);

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
    <nav className="w-full px-[4%] py-4 flex items-center justify-between bg-brand-dark text-white sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex-wrap gap-y-3">
      {/* LOGO */}
      <Link
        to={isAdminPage ? "/admin" : "/"}
        className="text-[1.75rem] font-extrabold text-white no-underline tracking-wide transition-opacity hover:opacity-80 z-[101] sm:text-xl"
      >
        {isAdminPage ? "Admin Panel" : "MyStore"}
      </Link>

      {/* SEARCH */}
      {!isAdminPage && (
        <div
          className="relative w-[40%] md:w-full md:order-3"
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
              className="w-full px-4 py-2.5 rounded-l-lg border-0 bg-white/95 text-gray-900 text-[0.9rem] outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-4 py-[11px] bg-brand text-white rounded-r-lg border-0 font-semibold text-sm cursor-pointer transition-all hover:bg-white hover:text-brand-dark"
            >
              Search
            </button>
          </form>

          {/* Suggestions dropdown */}
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

      {/* HAMBURGER */}
      <button
        className="hidden md:flex flex-col gap-[5px] bg-transparent border-0 cursor-pointer p-1.5 z-[101]"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <>
            <span className="block w-6 h-[2px] bg-white rounded transition-all duration-300" />
            <span className="block w-6 h-[2px] bg-white rounded transition-all duration-300" />
            <span className="block w-6 h-[2px] bg-white rounded transition-all duration-300" />
          </>
        )}
      </button>

      {/* Overlay — closes menu on tap outside */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[98] bg-black/40 md:block hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* NAV LINKS */}
      <div
        className={`flex items-center gap-5 md:fixed md:top-0 md:right-0 md:h-screen md:w-72 md:flex-col md:justify-center md:gap-7 md:bg-brand-dark md:shadow-[-8px_0_24px_rgba(0,0,0,0.3)] md:transition-transform md:duration-300 md:z-[99] sm:w-full ${
          menuOpen ? "md:translate-x-0" : "md:translate-x-full"
        }`}
      >
        {user ? (
          <>
            <span className="text-[0.9rem] font-semibold text-white/80 md:text-base md:text-white">
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
              <Link to="/cart" className="relative text-white no-underline transition-all hover:text-brand-medium">
                <ShoppingCart size={24} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.65rem] font-bold leading-none">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
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
    </nav>
  );
}
