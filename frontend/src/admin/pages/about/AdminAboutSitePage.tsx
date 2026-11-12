import { useState } from "react";
import {
  BookOpen,
  Info,
  LayoutTemplate,
  MapPin,
  Tags,
} from "lucide-react";
import {
  AdminAboutBlockEditor,
  AdminAboutHeroEditor,
  AdminAboutIntroEditor,
  AdminAboutValuesEditor,
} from "./AdminAboutEditors";
import {
  AdminCmsPageHeader,
  AdminCmsPageRoot,
  AdminCmsTabbedCard,
} from "../../components/AdminCmsPageLayout";

type AboutSiteTabId =
  | "page_banner"
  | "about_paciano"
  | "our_place"
  | "story"
  | "values";

export function AdminAboutSitePage() {
  const [tab, setTab] = useState<AboutSiteTabId>("page_banner");

  const tabs: {
    id: AboutSiteTabId;
    label: string;
    icon: typeof LayoutTemplate;
  }[] = [
    { id: "page_banner", label: "Page banner", icon: LayoutTemplate },
    { id: "about_paciano", label: "About Paciano", icon: Info },
    { id: "our_place", label: "Our Place", icon: MapPin },
    { id: "story", label: "The Paciano Story", icon: BookOpen },
    { id: "values", label: "Icons and slogans", icon: Tags },
  ];

  return (
    <AdminCmsPageRoot>
      <AdminCmsPageHeader
        title="About page"
        subtitle={
          <>
            Edit About page sections here.{" "}
            <strong>Experiences</strong> is under its own submenu.
          </>
        }
        badge="Page Settings"
      />
      <AdminCmsTabbedCard
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => setTab(id as AboutSiteTabId)}
      >
        {tab === "page_banner" ? <AdminAboutHeroEditor /> : null}
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
      </AdminCmsTabbedCard>
    </AdminCmsPageRoot>
  );
}
