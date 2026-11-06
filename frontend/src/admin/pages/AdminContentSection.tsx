import type { MenuId } from "../data/permissions";
import { ASSIGNABLE_MENUS } from "../data/permissions";
import {
  AdminCmsCardBody,
  AdminCmsPageCard,
  AdminCmsPageHeader,
  AdminCmsPageRoot,
} from "../components/AdminCmsPageLayout";

type Props = {
  menuId: MenuId;
};

export default function AdminContentSection({ menuId }: Props) {
  const menu = ASSIGNABLE_MENUS.find((m) => m.id === menuId);

  return (
    <AdminCmsPageRoot>
      <AdminCmsPageHeader
        title={menu?.label ?? "Content"}
        subtitle="Content editing for this section will connect to the CMS API. Your account has access to manage this page when publishing is enabled."
        badge="Coming soon"
      />
      <AdminCmsPageCard>
        <AdminCmsCardBody>
          <p className="text-[#332C26] text-sm leading-relaxed">
            Placeholder workspace for <strong>{menu?.label}</strong>. Super
            admins can assign this menu to team members from Users.
          </p>
        </AdminCmsCardBody>
      </AdminCmsPageCard>
    </AdminCmsPageRoot>
  );
}
