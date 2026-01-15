import "./styles/Navbar.css";
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

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const isAdminPage = location.pathname.startsWith("/admin");

  const adminLinkLabel = isAdminPage ? "Home" : "Admin Panel";
  const adminLinkTarget = isAdminPage ? "/" : "/admin";

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isAuthPage || isAdminPage) return;

    const delay = setTimeout(() => {
      if (!searchText.trim()) {
        setSuggestions([]);
        return;
      }

      api
        .get("/product/search", {
          params: {
            name: searchText,
            limit: 5,
            page: 1,
          },
        })
        .then((res) => {
          setSuggestions(res.data.products || []);
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText, isAuthPage, isAdminPage]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      // ignore backend failure
    }

    dispatch(clearCart());
    navigate("/login", { replace: true });
  };

  if (isAuthPage) return null;

  let hideTimeout;
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <nav className={`navbar ${isAdminPage ? "admin-navbar" : "fourth-color"}`}>
      <div className="navbar-left">
        <Link to={isAdminPage ? "/admin" : "/"} className="logo">
          {isAdminPage ? "Admin Panel" : "MyStore"}
        </Link>
      </div>

      {!isAdminPage && (
        <div
          className="navbar-search-wrapper"
          onMouseEnter={() => {
            clearTimeout(hideTimeout);
            setShowSuggestions(true);
          }}
          onMouseLeave={() => {
            hideTimeout = setTimeout(() => setShowSuggestions(false), 150);
          }}
        >
          <form
            className="navbar-search"
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
            />
            <button type="submit">Search</button>
          </form>

          {showSuggestions && searchText.trim() !== "" && (
            <div className="search-suggestions">
              {suggestions.length > 0 ? (
                suggestions.map((item) => {
                  const name = item.name.replace(
                    new RegExp(searchText, "i"),
                    (match) => `<strong>${match}</strong>`
                  );

                  return (
                    <div
                      key={item._id}
                      className="suggestion-item enhanced"
                      onClick={() => {
                        navigate(`/product/${item._id}`);
                        setShowSuggestions(false);
                      }}
                    >
                      <img
                        src={item.image?.[0] || "/placeholder.jpg"}
                        alt={item.name}
                        className="suggestion-thumb"
                      />

                      <div className="suggestion-text">
                        <p
                          className="suggestion-name"
                          dangerouslySetInnerHTML={{ __html: name }}
                        />
                        <span className="suggestion-price">
                          ₹{item.salePrice}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-suggestions">No results found</p>
              )}
            </div>
          )}
        </div>
      )}

      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-right ${menuOpen ? "active" : ""}`}>
        {user ? (
          <>
            <span className="nav-hello">Hello, {firstName}</span>

            {user.role === "user" ? (
              <>
                <Link to="/profile" className="nav-link">
                  My Profile
                </Link>
                <Link to="/orders" className="nav-link">
                  My Orders
                </Link>
              </>
            ) : (
              <Link to={adminLinkTarget} className="admin-shortcut-link">
                {adminLinkLabel}
              </Link>
            )}

            {user.role === "user" && !isAdminPage && (
              <Link to="/cart" className="cart-link">
                🛒 <span className="cart-badge">{count}</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="logout-icon-btn"
              title="Logout"
            >
              <LogOut size={25} />
            </button>
          </>
        ) : (
          <Link to="/login" className="login-btn">
            <LogIn size={25} />
          </Link>
        )}
      </div>
    </nav>
  );
}
