import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  AdminCmsCardBody,
  AdminCmsPageCard,
  AdminCmsPageHeader,
  AdminCmsPageRoot,
  AdminCmsTabBar,
  AdminCmsTabbedCard,
  adminPageWidthClass,
  type AdminCmsTabItem,
} from "./AdminCmsPageLayout";

export { adminPageWidthClass };

/** Two form fields per row from md breakpoint up. */
export const formTwoColClass =
  "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 items-start";

/**
 * Use only when pairing two similar controls (e.g. two single-line inputs).
 * If label length or control height differs (textarea vs input, upload vs text),
 * stack fields vertically instead — do not use this class for that row.
 */
export const formTwoColPairedRowClass =
  "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start";

export function AdminPageFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${adminPageWidthClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function TabbedPageShell({
  pageTitle,
  subtitle,
  badge = "Page Settings",
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  wide: _wide = false,
  hideTabs = false,
  children,
}: {
  pageTitle: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  headerActions?: ReactNode;
  tabs: readonly AdminCmsTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  wide?: boolean;
  hideTabs?: boolean;
  children: ReactNode;
}) {
  return (
    <AdminCmsPageRoot>
      <AdminCmsPageHeader
        title={pageTitle}
        subtitle={subtitle}
        badge={badge}
        actions={headerActions}
      />
      {hideTabs ? (
        <AdminCmsPageCard>
          <AdminCmsCardBody>{children}</AdminCmsCardBody>
        </AdminCmsPageCard>
      ) : (
        <AdminCmsTabbedCard
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        >
          {children}
        </AdminCmsTabbedCard>
      )}
    </AdminCmsPageRoot>
  );
}

export function SectionShell({
  pageTitle,
  subtitle,
  badge,
  children,
}: {
  pageTitle: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <TabbedPageShell
      pageTitle={pageTitle}
      subtitle={subtitle}
      badge={badge}
      tabs={[{ id: "home", label: "Home section" }]}
      activeTab="home"
      onTabChange={() => undefined}
      hideTabs
    >
      {children}
    </TabbedPageShell>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block mb-4">
      <span className="text-sm font-medium text-[#332C26] mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#E0D8CC] bg-white px-3 py-2.5 text-sm text-[#332C26] focus:outline-none focus:ring-2 focus:ring-[#71803F]/35";

export const cardGridClass =
  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start";

/** Two cards per row from md breakpoint (e.g. stays admin). */
export const cardGridTwoColClass =
  "grid grid-cols-1 md:grid-cols-2 gap-4 items-start";

export const saveCardButtonClass =
  "mt-6 inline-flex items-center gap-2 rounded-xl border border-[#71803F] px-4 py-2.5 text-sm font-semibold text-[#5F7138]";

export function AdminLoadingRow() {
  return (
    <div className="flex items-center gap-2 text-sm text-[#657067]">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}

export function AdminInlineTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: readonly AdminCmsTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <AdminCmsTabBar
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
}

export type { AdminCmsTabItem };
