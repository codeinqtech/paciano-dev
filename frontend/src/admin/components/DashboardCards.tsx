import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export type DashboardCard = {
  icon: LucideIcon;
  label: string;
  value: string;
  valueSuffix?: string;
  path: string;
  trend?: string;
};

export default function DashboardCards({ cards }: { cards: DashboardCard[] }) {
  if (cards.length === 0) {
    return (
      <p className="admin-card rounded-2xl p-8 text-sm admin-card-muted">
        No sections assigned to your account yet. Contact a super admin.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.path}
            to={card.path}
            className="admin-card group rounded-2xl p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8FAA42]/12 text-[#5A6B32]">
                <Icon className="h-5 w-5" />
              </span>
              {card.trend ? (
                <span className="text-xs text-[#8FAA42]">{card.trend}</span>
              ) : null}
            </div>
            <p className="text-sm admin-card-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold admin-page-title">
              {card.value}
              {card.valueSuffix ? (
                <span className="ml-2 text-sm font-normal admin-card-muted">
                  {card.valueSuffix}
                </span>
              ) : null}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
