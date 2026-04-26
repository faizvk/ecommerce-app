import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Users, ShoppingBag } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminDashboard() {
  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-[0.875rem] font-semibold no-underline transition-all ${
      isActive
        ? "bg-brand text-white shadow-md"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-[#f4f3ff]">
      {/* SIDEBAR — hidden on mobile, shown on desktop */}
      <aside className="hidden md:flex w-56 bg-gradient-to-b from-brand-dark via-[#2d2a6e] to-brand-dark flex-col py-6 px-3 gap-1 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-2.5 px-3 mb-5">
          <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
            <ShoppingBag size={14} className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight">
            <span className="text-white">Nex</span><span className="text-brand-medium">Kart</span>
            <span className="text-white/40 text-xs font-semibold ml-1">Admin</span>
          </span>
        </div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkCls}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* MOBILE BOTTOM NAV — shown on mobile, hidden on desktop */}
      <div className="flex md:hidden w-full fixed bottom-0 left-0 bg-gradient-to-r from-brand-dark via-[#2d2a6e] to-brand-dark z-50 border-t border-white/10">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 flex-1 py-2.5 text-[0.68rem] font-semibold no-underline transition-all ${
                isActive ? "text-white bg-white/10" : "text-white/60"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
