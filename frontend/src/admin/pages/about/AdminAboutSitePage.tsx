import { useState } from "react";
import {
  AdminAboutBlockEditor,
  AdminAboutIntroEditor,
  AdminAboutValuesEditor,
} from "./aboutAdminEditors";
import {
  AdminInlineTabs,
  AdminPageFrame,
} from "../../components/AdminSectionLayout";

type AboutSiteTabId = "about_paciano" | "our_place" | "story" | "values";

export function AdminAboutSitePage() {
  const [tab, setTab] = useState<AboutSiteTabId>("about_paciano");

  const tabs: { id: AboutSiteTabId; label: string }[] = [
    { id: "about_paciano", label: "About Paciano" },
    { id: "our_place", label: "Our Place" },
    { id: "story", label: "The Paciano Story" },
    { id: "values", label: "Values" },
  ];

  return (
    <AdminPageFrame>
      <h1 className="text-2xl font-bold admin-page-title mb-2">About page</h1>
      <p className="text-sm text-[#6E655C] mb-4 max-w-3xl">
        Edit About page sections here.{" "}
        <strong>Experiences</strong> is under its own submenu.
      </p>
      <AdminInlineTabs
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => setTab(id as AboutSiteTabId)}
      />
      {tab === "about_paciano" ? <AdminAboutIntroEditor /> : null}
      {tab === "our_place" ? (
        <AdminAboutBlockEditor
          sectionKey="our_place"
          showImage={false}
          imageHint="The wide background landscape stays fixed in the design. Edit text only."
        />
      ) : null}
      {tab === "story" ? (
        <AdminAboutBlockEditor sectionKey="story" showImage />
      ) : null}
      {tab === "values" ? <AdminAboutValuesEditor /> : null}
    </AdminPageFrame>
  );
}
