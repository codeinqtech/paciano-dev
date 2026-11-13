import type { ContactTabId } from "./contact.types";
import { contactTabs } from "./contact.constants";

interface Props {
  activeTab: ContactTabId;
  onTabChange: (tab: ContactTabId) => void;
}

export default function ContactPageTabs({
  activeTab,
  onTabChange,
}: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[#EDE4D8] bg-[#FAF7F2] px-3 pt-3">
      {contactTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg border px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-[#E8DFD0] border-b-white bg-white text-[#3D4A22]"
                : "border-transparent text-[#6E655C] hover:bg-white/70 hover:text-[#332C26]"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
