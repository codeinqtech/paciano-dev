import type { ComponentType, ReactNode } from "react";

/** Full usable width beside the admin sidebar (up to ~1400px). */
export const adminPageWidthClass = "w-full max-w-[1400px]";

/** Matches Contact page pill badge. */
export const adminCmsBadgeClass =
  "rounded-full border border-[#C8BC82]/50 bg-[#C8BC82]/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#817344]";

export type AdminCmsTabItem = {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

export function AdminCmsPageHeader({
  title,
  subtitle,
  badge = "CMS",
  actions,
  className = "",
}: {
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-4 ${className}`.trim()}
    >
      <div>
        <h1 className="text-2xl font-bold admin-page-title">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-[#82776B]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {actions}
        {badge != null && badge !== false ? (
          typeof badge === "string" ? (
            <span className={adminCmsBadgeClass}>{badge}</span>
          ) : (
            badge
          )
        ) : null}
      </div>
    </div>
  );
}

const tabButtonActiveClass =
  "border-[#E8DFD0] border-b-white bg-white text-[#3D4A22]";
const tabButtonInactiveClass =
  "border-transparent text-[#6E655C] hover:bg-white/70 hover:text-[#332C26]";

export function AdminCmsTabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: readonly AdminCmsTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[#EDE4D8] bg-[#FAF7F2] px-3 pt-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg border px-4 py-3 text-sm font-medium transition-colors ${
              isActive ? tabButtonActiveClass : tabButtonInactiveClass
            }`}
          >
            {Icon ? <Icon size={16} /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function AdminCmsPageCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8DFD0] bg-white">
      {children}
    </div>
  );
}

export function AdminCmsCardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white p-5 md:p-8 ${className}`.trim()}>{children}</div>
  );
}

/**
 * Contact-style shell: cream tab strip + padded body inside bordered card.
 */
export function AdminCmsTabbedCard({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: readonly AdminCmsTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <AdminCmsPageCard>
      <AdminCmsTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <AdminCmsCardBody>{children}</AdminCmsCardBody>
    </AdminCmsPageCard>
  );
}

/**
 * Full-width container for CMS admin pages (same max width as Contact).
 */
export function AdminCmsPageRoot({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${adminPageWidthClass} space-y-7 ${className}`.trim()}>
      {children}
    </div>
  );
}
