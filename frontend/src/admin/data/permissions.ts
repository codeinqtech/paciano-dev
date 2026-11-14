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
  MessageSquareQuote,
  MessageCircle,
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
  | "google_reviews"
  | "users"
  | "profile"
  | "whatsapp_settings";

export type AdminMenu = {
  id: MenuId;
  label: string;
  path: string;
  icon: LucideIcon;
};

/** Submenus under About Paciano in the sidebar. */
export const ABOUT_CHILD_MENUS = [
  { label: "About page", path: "/admin/about/page" },
  { label: "Experiences", path: "/admin/about/experiences" },
] as const;

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
    path: "/admin/about/page",
    icon: Leaf,
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
  {
    id: "google_reviews",
    label: "Google reviews",
    path: "/admin/google-reviews",
    icon: MessageSquareQuote,
  },
  {
    id: "whatsapp_settings",
    label: "WhatsApp Management",
    path: "/admin/whatsapp-settings",
    icon: MessageCircle,
  }
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
  "/admin/about/page": "about",
  "/admin/about/experiences": "about",
  "/admin/about/story": "about",
  "/admin/about/our-place": "about",
  "/admin/experiences": "about",
  "/admin/stays": "stays",
  "/admin/dining": "dining",
  "/admin/contact": "contact",
  "/admin/stay": "stay",
  "/admin/navbar": "navbar",
  "/admin/footer": "footer",
  "/admin/google-reviews": "google_reviews",
  "/admin/users": "users",
  "/admin/profile": "profile",
  "/admin/whatsapp-settings": "whatsapp_settings",
};

export function getMenuIdFromPath(pathname: string): MenuId | null {
  const normalized = pathname.replace(/\/+$/, "") || "/admin";
  if (PATH_TO_MENU[normalized]) {
    return PATH_TO_MENU[normalized];
  }
  if (normalized.startsWith("/admin/about")) {
    return "about";
  }
  return null;
}

export function menusForUser(
  isSuperAdmin: boolean,
  hasPermission: (id: MenuId) => boolean,
): AdminMenu[] {
  const items: AdminMenu[] = [DASHBOARD_MENU];
  for (const menu of ASSIGNABLE_MENUS) {
    if (menu.id === "whatsapp_settings" ? isSuperAdmin || hasPermission(menu.id)  : hasPermission(menu.id) ) {
      items.push(menu);
    }
  }
  if (isSuperAdmin) {
    items.push(...SUPERADMIN_MENUS);
  }
  items.push(PROFILE_MENU);
  return items;
}
