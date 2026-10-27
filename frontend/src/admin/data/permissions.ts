import {
  Home,
  Mail,
  BedDouble,
  Sparkles,
  Leaf,
  UtensilsCrossed,
  Menu,
  PanelBottom,
  LayoutDashboard,
  Users,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export const ROLES = {
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const;

export type MenuId =
  | "dashboard"
  | "homepage"
  | "about"
  | "experiences"
  | "stays"
  | "dining"
  | "contact"
  | "stay"
  | "navbar"
  | "footer"
  | "users"
  | "profile";

export type AdminMenu = {
  id: MenuId;
  label: string;
  path: string;
  icon: LucideIcon;
};

export const ASSIGNABLE_MENUS: AdminMenu[] = [
  {
    id: "homepage",
    label: "Homepage",
    path: "/admin/homepage",
    icon: Home,
  },
  {
    id: "about",
    label: "About Paciano",
    path: "/admin/about",
    icon: Leaf,
  },
  {
    id: "experiences",
    label: "Experiences",
    path: "/admin/experiences",
    icon: Sparkles,
  },
  {
    id: "stays",
    label: "Our Stays",
    path: "/admin/stays",
    icon: BedDouble,
  },
  {
    id: "dining",
    label: "Dining at Paciano",
    path: "/admin/dining",
    icon: UtensilsCrossed,
  },
  {
    id: "contact",
    label: "Contact Page",
    path: "/admin/contact",
    icon: Mail,
  },
  {
    id: "stay",
    label: "Stay Page",
    path: "/admin/stay",
    icon: BedDouble,
  },
  {
    id: "navbar",
    label: "Navbar",
    path: "/admin/navbar",
    icon: Menu,
  },
  {
    id: "footer",
    label: "Footer",
    path: "/admin/footer",
    icon: PanelBottom,
  },
];

export const SUPERADMIN_MENUS: AdminMenu[] = [
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
];

export const PROFILE_MENU: AdminMenu = {
  id: "profile",
  label: "My Profile",
  path: "/admin/profile",
  icon: UserCircle,
};

export const DASHBOARD_MENU: AdminMenu = {
  id: "dashboard",
  label: "Dashboard",
  path: "/admin",
  icon: LayoutDashboard,
};

const PATH_TO_MENU: Record<string, MenuId> = {
  "/admin": "dashboard",
  "/admin/homepage": "homepage",
  "/admin/about": "about",
  "/admin/experiences": "experiences",
  "/admin/stays": "stays",
  "/admin/dining": "dining",
  "/admin/contact": "contact",
  "/admin/stay": "stay",
  "/admin/navbar": "navbar",
  "/admin/footer": "footer",
  "/admin/users": "users",
  "/admin/profile": "profile",
};

export function getMenuIdFromPath(pathname: string): MenuId | null {
  const normalized = pathname.replace(/\/+$/, "") || "/admin";
  return PATH_TO_MENU[normalized] ?? null;
}

export function menusForUser(
  isSuperAdmin: boolean,
  hasPermission: (id: MenuId) => boolean,
): AdminMenu[] {
  const items: AdminMenu[] = [DASHBOARD_MENU];
  for (const menu of ASSIGNABLE_MENUS) {
    if (hasPermission(menu.id)) {
      items.push(menu);
    }
  }
  if (isSuperAdmin) {
    items.push(...SUPERADMIN_MENUS);
  }
  items.push(PROFILE_MENU);
  return items;
}
