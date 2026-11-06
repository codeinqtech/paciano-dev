import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/images/paciano-logo.png";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ABOUT_CHILD_MENUS, menusForUser } from "../data/permissions";

export default function AdminSidebar() {
  const { user, logout, isSuperAdmin, hasPermission } = useAuth();
  const location = useLocation();
  const menus = menusForUser(isSuperAdmin, hasPermission);
  const onAboutSection =
    location.pathname.startsWith("/admin/about") ||
    location.pathname === "/admin/experiences";

  const [aboutOpen, setAboutOpen] = useState(onAboutSection);

  useEffect(() => {
    if (onAboutSection) setAboutOpen(true);
  }, [onAboutSection]);

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
          if (item.id === "about" && hasPermission("about")) {
            return (
              <div key={item.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setAboutOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    onAboutSection
                      ? "text-[#FFFDF5]/90 bg-[#C8BC82]/08"
                      : "text-[#E8E2D4]/75 hover:bg-[#C8BC82]/10 hover:text-[#FFFDF5]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 opacity-70 transition-transform ${
                      aboutOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {aboutOpen ? (
                  <div className="ml-3 border-l border-[#C8BC82]/20 pl-2 space-y-0.5 pb-1">
                    {ABOUT_CHILD_MENUS.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-xs transition-colors ${
                            isActive
                              ? "text-[#FFFDF5] bg-[#C8BC82]/15 font-medium"
                              : "text-[#E8E2D4]/65 hover:text-[#FFFDF5] hover:bg-[#C8BC82]/08"
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }
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
