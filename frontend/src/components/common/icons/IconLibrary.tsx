
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import * as Icons from "./index";
import {
  PACIANO_VALUE_ICON_OPTIONS,
  PacianoValueIcon,
} from "./paciano";

type IconCategory = {
  name: string;
  icons: string[];
};

const lucideIconNames = Object.keys(Icons).filter(
  (key) => typeof Icons[key as keyof typeof Icons] === "function",
);

const categories: IconCategory[] = [
  {
    name: "All",
    icons: [
      ...lucideIconNames,
      ...PACIANO_VALUE_ICON_OPTIONS.map((o) => o.value),
    ],
  },
  {
    name: "Dashboard",
    icons: ["LayoutDashboard", "Home", "Globe"],
  },
  {
    name: "Users",
    icons: ["Users", "User"],
  },
  {
    name: "Media",
    icons: ["Image", "Video", "Camera", "Folder", "File"],
  },
  {
    name: "Communication",
    icons: ["MessageSquare", "Phone", "Mail", "Bell"],
  },
  {
    name: "Actions",
    icons: ["Plus", "Edit", "Trash2", "Eye", "Save", "Upload", "Download", "Search"],
  },
  {
    name: "Navigation",
    icons: ["Menu", "X", "ChevronDown", "ChevronUp", "ChevronLeft", "ChevronRight"],
  },
  {
    name: "Others",
    icons: ["Settings", "LogOut", "Calendar", "Clock", "Check", "XCircle", "AlertCircle", "Link", "Lock", "Unlock", "Star", "Heart", "FileText"],
  },
  {
    name: "Paciano (About)",
    icons: PACIANO_VALUE_ICON_OPTIONS.map((o) => o.value),
  },
];

const IconLibrary = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedIcon, setCopiedIcon] = useState("");

  const filteredIcons = useMemo(() => {
    const selectedCategory = categories.find(
      (category) => category.name === activeCategory
    );

    const iconNames = selectedCategory?.icons ?? [];

    return iconNames.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activeCategory]);

  const copyImport = async (name: string) => {
    const isPaciano = PACIANO_VALUE_ICON_OPTIONS.some((o) => o.value === name);
    const importText = isPaciano
      ? `import { PacianoValueIcon } from "@/components/common/icons/paciano";\n// <PacianoValueIcon type="${name}" />`
      : `import { ${name} } from "@/components/common/icons";`;

    try {
      await navigator.clipboard.writeText(importText);
      setCopiedIcon(name);

      window.setTimeout(() => setCopiedIcon(""), 2000);
    } catch {
      console.error("Unable to copy import statement");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Common Icon Library
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Search and reuse icons across Admin and Frontend.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        className="w-full md:w-96 border rounded-lg px-4 py-2 mb-5 outline-none focus:ring-2 focus:ring-gray-300"
      />

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeCategory === category.name
                ? "bg-gray-900 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {filteredIcons.map((name) => {
          const pacianoOpt = PACIANO_VALUE_ICON_OPTIONS.find(
            (o) => o.value === name,
          );
          const Lucide = !pacianoOpt
            ? (Icons[name as keyof typeof Icons] as LucideIcon | undefined)
            : undefined;

          return (
            <button
              key={name}
              type="button"
              onClick={() => copyImport(name)}
              title={`Copy ${name} import`}
              className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-100 hover:border-gray-400 transition"
            >
              {pacianoOpt ? (
                <span className="text-[#5F7138]">
                  <PacianoValueIcon type={pacianoOpt.value} />
                </span>
              ) : Lucide ? (
                <Lucide size={26} strokeWidth={1.8} />
              ) : null}

              <span className="text-xs text-center break-all">
                {pacianoOpt?.label ?? name}
              </span>

              <span className="text-[10px] text-gray-500">
                {copiedIcon === name ? "Copied!" : "Copy import"}
              </span>
            </button>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No icons found.
        </p>
      )}

      <p className="text-sm text-gray-500 mt-6">
        Showing {filteredIcons.length} icons
      </p>
    </div>
  );
};

export default IconLibrary;
