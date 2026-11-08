import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

/** Full usable width beside the admin sidebar (up to ~1400px). */
export const adminPageWidthClass = "w-full max-w-[1400px]";

/** Two form fields per row from md breakpoint up. */
export const formTwoColClass =
  "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 items-start";

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
  tabs,
  activeTab,
  onTabChange,
  wide: _wide = false,
  hideTabs = false,
  children,
}: {
  pageTitle: string;
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  wide?: boolean;
  hideTabs?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={adminPageWidthClass}>
      <h1 className="text-2xl font-bold admin-page-title mb-2">{pageTitle}</h1>
      {!hideTabs ? (
        <div className="flex flex-wrap gap-1 border-b border-[#E8E0D4] mb-8">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-b-2 border-[#71803F] text-[#332C26]"
                    : "text-[#657067] hover:text-[#332C26]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2 border-b border-[#E8E0D4] mb-8">
          <span className="px-3 py-2 text-sm font-semibold border-b-2 border-[#71803F] text-[#332C26]">
            Home section
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionShell({
  pageTitle,
  children,
}: {
  pageTitle: string;
  children: ReactNode;
}) {
  return (
    <TabbedPageShell
      pageTitle={pageTitle}
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
  tabs: readonly { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[#E8E0D4] mb-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTabChange(t.id)}
          className={`px-3 py-2 text-sm font-semibold ${
            activeTab === t.id
              ? "border-b-2 border-[#71803F] text-[#332C26]"
              : "text-[#657067] hover:text-[#332C26]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
