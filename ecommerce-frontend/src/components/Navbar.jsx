import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/slice/authSlice";
import { clearCart } from "../redux/slice/cartSlice";
import { LogOut, LogIn } from "lucide-react";
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
    <nav className="w-full px-[4%] py-5 flex items-center justify-between bg-brand-dark text-white sticky top-0 z-50 shadow-card flex-wrap">
      {/* LOGO */}
      <Link
        to={isAdminPage ? "/admin" : "/"}
        className="text-[1.9rem] font-extrabold text-white no-underline tracking-wide transition-opacity hover:opacity-70 z-[101] sm:text-2xl"
      >
        {isAdminPage ? "Admin Panel" : "MyStore"}
      </Link>

      {/* SEARCH */}
      {!isAdminPage && (
        <div
          className="relative w-[40%] md:w-full md:order-3 md:mt-4"
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
              className="w-full px-3.5 py-2.5 rounded-l-md border-0 bg-white text-gray-900 text-[0.95rem] outline-none"
            />
            <button
              type="submit"
              className="px-4 py-[11px] bg-brand text-white rounded-r-md border-0 font-semibold cursor-pointer transition-all hover:bg-brand-dark"
            >
              Search
            </button>
          </form>

          {/* Suggestions dropdown */}
          {showSuggestions && searchText.trim() && (
            <div className="absolute top-12 w-full bg-brand-light rounded-md shadow-[0_6px_18px_rgba(0,0,0,0.15)] z-[200] max-h-64 overflow-y-auto animate-[fadeSlide_0.15s_ease-out]">
              {suggestions.length > 0 ? (
                suggestions.map((item) => {
                  const name = item.name.replace(
                    new RegExp(searchText, "i"),
                    (match) => `<strong>${match}</strong>`
                  );
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-100"
                      onClick={() => { navigate(`/product/${item._id}`); setShowSuggestions(false); }}
                    >
                      <img
                        src={item.image?.[0] || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-10 h-10 rounded-md object-cover bg-gray-200"
                      />
                      <div className="flex flex-col">
                        <p
                          className="text-[0.95rem] font-medium text-gray-900 m-0"
                          dangerouslySetInnerHTML={{ __html: name }}
                        />
                        <span className="text-[0.85rem] text-green-700 font-semibold">₹{item.salePrice}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-2.5">No results found</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* HAMBURGER */}
      <button
        className={`hidden md:flex flex-col gap-[5px] bg-transparent border-0 cursor-pointer p-[5px] z-[101] ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <span className={`block w-7 h-[3px] bg-white rounded transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block w-7 h-[3px] bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-7 h-[3px] bg-white rounded transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {/* NAV LINKS */}
      <div
        className={`flex items-center gap-4 md:fixed md:top-0 md:h-screen md:flex-col md:justify-center md:gap-7 md:bg-brand-dark md:shadow-[-5px_0_15px_rgba(0,0,0,0.2)] md:transition-all md:duration-400 md:z-[99] md:w-[70%] sm:w-full ${
          menuOpen ? "md:right-0" : "md:right-[-100%]"
        }`}
      >
        {user ? (
          <>
            <span className="text-[0.95rem] font-semibold opacity-90 sm:hidden">Hello, {firstName}</span>

            {user.role === "user" ? (
              <>
                <Link to="/profile" className="text-white no-underline font-medium text-base px-3 py-1.5 rounded-full transition-all hover:opacity-80">My Profile</Link>
                <Link to="/orders" className="text-white no-underline font-medium text-base px-3 py-1.5 rounded-full transition-all hover:opacity-80">My Orders</Link>
              </>
            ) : (
              <Link to={adminLinkTarget} className="text-white no-underline font-medium text-base px-3.5 py-2 transition-all hover:opacity-80">{adminLinkLabel}</Link>
            )}

            {user.role === "user" && !isAdminPage && (
              <Link to="/cart" className="relative text-[1.6rem] text-white no-underline transition-all hover:opacity-80 sm:text-2xl">
                🛒
                <span className="absolute -top-2 -right-3 bg-brand text-white rounded-full px-[7px] py-[3px] text-[0.75rem] font-bold min-w-[20px] text-center">
                  {count}
                </span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-transparent border-0 text-white cursor-pointer p-1 flex items-center justify-center text-2xl transition-all hover:opacity-70"
              title="Logout"
            >
              <LogOut size={25} />
            </button>
          </>
        ) : (
          <Link to="/login" className="text-white no-underline transition-all hover:opacity-70">
            <LogIn size={25} />
          </Link>
        )}
      </div>
    </nav>
  );
}
