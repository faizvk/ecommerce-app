import { NavLink, Outlet } from "react-router-dom";
import "./styles/AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin Panel</h2>

        <nav className="admin-nav">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            📦 Products
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            📑 Orders
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            👤 Users
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
