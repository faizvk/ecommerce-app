import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Users } from "lucide-react";

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
    <div className="flex min-h-screen bg-[#f3f5f9]">
      {/* SIDEBAR */}
      <aside className="w-56 bg-brand-dark flex flex-col py-6 px-3 gap-1 sticky top-0 h-screen shrink-0 md:hidden">
        <p className="text-white/40 text-[0.65rem] font-bold tracking-widest uppercase mb-3 px-3">Navigation</p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkCls}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* MOBILE NAV */}
      <div className="hidden md:flex w-full fixed bottom-0 left-0 bg-brand-dark z-50 border-t border-white/10">
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
      <main className="flex-1 overflow-auto p-8 md:p-5 md:pb-24">
        <Outlet />
      </main>
    </div>
  );
}
