import { NavLink } from "react-router-dom";
import logo from "@/images/paciano-logo.png";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { menusForUser } from "../data/permissions";

export default function AdminSidebar() {
  const { user, logout, isSuperAdmin, hasPermission } = useAuth();
  const menus = menusForUser(isSuperAdmin, hasPermission);

  return (
    <aside className="admin-sidebar fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-[#1e3328]/40 lg:flex">
      <div className="px-6 pt-8 pb-6 border-b border-[#C8BC82]/15">
        <img src={logo} alt="Paciano" className="h-12 w-auto object-contain" />
        <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[#C8BC82]/80">
          Admin
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {menus.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "admin-nav-active"
                    : "text-[#E8E2D4]/75 hover:bg-[#C8BC82]/10 hover:text-[#FFFDF5]"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#C8BC82]/15 p-4">
        <p className="truncate px-2 text-xs text-[#E8E2D4]/60 mb-3">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-[#E8E2D4]/80 hover:bg-[#C8BC82]/10 hover:text-[#FFFDF5] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
