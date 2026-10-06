import { useEffect, useState } from "react";
import DashboardCards, { type DashboardCard } from "../components/DashboardCards";
import { useAuth } from "../../context/AuthContext";
import {
  ASSIGNABLE_MENUS,
  SUPERADMIN_MENUS,
  type MenuId,
} from "../data/permissions";
import { apiRequest } from "../../api/client";

type DashCounts = Record<string, number>;

export default function Dashboard() {
  const { hasPermission, isSuperAdmin } = useAuth();
  const [counts, setCounts] = useState<DashCounts>({});

  useEffect(() => {
    apiRequest<{ data: DashCounts }>("/dashboard")
      .then((res) => setCounts(res.data || {}))
      .catch(() => undefined);
  }, []);

  const order: MenuId[] = [
    "homepage",
    "contact",
    "stay",
    "navbar",
    "footer",
    "users",
  ];

  const cards: DashboardCard[] = order
    .filter((id) => id === "users" ? isSuperAdmin : hasPermission(id))
    .map((id) => {
      const menu = [...ASSIGNABLE_MENUS, ...SUPERADMIN_MENUS].find(
        (m) => m.id === id,
      );
      if (!menu) return null;
      return {
        icon: menu.icon,
        label: menu.label,
        value: String(counts[id] ?? 1),
        path: menu.path,
        trend: "Manage",
      } satisfies DashboardCard;
    })
    .filter((c): c is DashboardCard => c !== null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold admin-page-title">Dashboard</h1>
        <p className="text-sm admin-card-muted mt-1">
          Manage Paciano website sections you have access to.
        </p>
      </div>
      <DashboardCards cards={cards} />
    </div>
  );
}
