import type { MenuId } from "../data/permissions";
import { ASSIGNABLE_MENUS } from "../data/permissions";

type Props = {
  menuId: MenuId;
};

export default function AdminContentSection({ menuId }: Props) {
  const menu = ASSIGNABLE_MENUS.find((m) => m.id === menuId);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold admin-page-title mb-2">
        {menu?.label ?? "Content"}
      </h1>
      <p className="text-sm admin-card-muted mb-8">
        Content editing for this section will connect to the CMS API. Your
        account has access to manage this page when publishing is enabled.
      </p>
      <div className="admin-card rounded-2xl p-8">
        <p className="text-[#332C26] text-sm leading-relaxed">
          Placeholder workspace for <strong>{menu?.label}</strong>. Super admins
          can assign this menu to team members from Users.
        </p>
      </div>
    </div>
  );
}
