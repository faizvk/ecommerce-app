import { NavLink, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const linkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-3 rounded-xl text-[0.9rem] font-semibold no-underline transition-all ${
      isActive
        ? "bg-brand text-white shadow-md"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-brand-light">
      {/* SIDEBAR */}
      <aside className="w-56 bg-brand-dark flex flex-col py-8 px-4 gap-2 sticky top-0 h-screen shrink-0 md:hidden">
        <p className="text-white/50 text-[0.7rem] font-bold tracking-widest uppercase mb-2 px-2">Navigation</p>
        <NavLink to="/admin" end className={linkCls}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/admin/products" className={linkCls}>
          📦 Products
        </NavLink>
        <NavLink to="/admin/orders" className={linkCls}>
          📑 Orders
        </NavLink>
        <NavLink to="/admin/users" className={linkCls}>
          👤 Users
        </NavLink>
      </aside>

      {/* MOBILE NAV */}
      <div className="hidden md:flex w-full fixed bottom-0 left-0 bg-brand-dark z-50 px-2 py-2 gap-1 justify-around">
        {[
          { to: "/admin", label: "Dashboard", icon: "📊", end: true },
          { to: "/admin/products", label: "Products", icon: "📦" },
          { to: "/admin/orders", label: "Orders", icon: "📑" },
          { to: "/admin/users", label: "Users", icon: "👤" },
        ].map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[0.7rem] font-semibold no-underline transition-all ${
                isActive ? "bg-brand text-white" : "text-white/70"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto p-8 md:p-5 md:pb-20">
        <Outlet />
      </main>
    </div>
  );
}
