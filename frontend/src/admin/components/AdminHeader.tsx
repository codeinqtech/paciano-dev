import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { menusForUser } from "../data/permissions";

export default function AdminHeader() {
  const { isSuperAdmin, hasPermission } = useAuth();
  const menus = menusForUser(isSuperAdmin, hasPermission);

  return (
    <header className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[#6E655C] font-manrope lg:hidden">Paciano CMS</p>
        <Link
          to="/"
          className="text-sm text-[#8FAA42] hover:underline font-manrope ml-auto lg:ml-0"
        >
          View website
        </Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {menus.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1.5 text-xs font-manrope transition-colors ${
                isActive
                  ? "bg-[#8FAA42]/20 text-[#3D4A22]"
                  : "bg-white/80 text-[#6E655C] border border-[#E0D5C8]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
