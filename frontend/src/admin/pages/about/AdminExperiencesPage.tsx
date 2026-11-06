import { useCallback, useEffect, useState } from "react";
import { Home, ListOrdered, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiRequest, apiUpload } from "../../../api/client";
import {
  AdminCmsPageHeader,
  AdminCmsPageRoot,
  AdminCmsTabbedCard,
} from "../../components/AdminCmsPageLayout";
import {
  Field,
  cardGridClass,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
type ExperienceItem = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
};

type ExperiencesTabId = "home" | "items";

export function AdminExperiencesPage() {
  const [tab, setTab] = useState<ExperiencesTabId>("home");
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState<number | null>(null);
  const [headingMain, setHeadingMain] = useState("");
  const [headingAccent, setHeadingAccent] = useState("");
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [photoFiles, setPhotoFiles] = useState<Record<number, File | null>>(
    {},
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          section: { heading_main: string; heading_accent: string };
          items: ExperienceItem[];
        };
      }>("/admin/home/sections/experiences");
      setHeadingMain(res.data?.section?.heading_main ?? "");
      setHeadingAccent(res.data?.section?.heading_accent ?? "");
      setItems(res.data?.items ?? []);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveIntro = async () => {
    setSectionSaving(true);
    try {
      await apiRequest("/admin/home/sections/experiences/intro", {
        method: "POST",
        body: JSON.stringify({
          heading_main: headingMain,
          heading_accent: headingAccent,
        }),
      });
      toast.success("Intro saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSectionSaving(false);
    }
  };

  const saveItem = async (item: ExperienceItem) => {
    setItemSaving(item.id);
    try {
      const fd = new FormData();
      fd.append("title", item.title);
      fd.append("description", item.description ?? "");
      const file = photoFiles[item.id];
      if (file) fd.append("photo", file);
      const res = await apiUpload<{ data: ExperienceItem }>(
        `/admin/home/sections/experiences/items/${item.id}`,
        fd,
      );
      if (res.data) {
        setItems((list) =>
          list.map((i) => (i.id === item.id ? res.data! : i)),
        );
        setPhotoFiles((f) => ({ ...f, [item.id]: null }));
      }
      toast.success("Experience saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setItemSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full max-w-[1400px] items-center gap-2 py-6 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const inner = (
    <>
      {tab === "home" ? (
        <div>
          <p className="text-sm admin-card-muted mb-4">
            The small label “Experiences That Stay With You” stays fixed on the
            website. Edit the large heading here; use the “Each experience” tab
            for the five items.
          </p>
          <div className={formTwoColPairedRowClass}>
            <Field label="Main heading (first line)">
              <input
                className={inputClass}
                value={headingMain}
                onChange={(e) => setHeadingMain(e.target.value)}
              />
            </Field>
            <Field label="Main heading (green line)">
              <input
                className={inputClass}
                value={headingAccent}
                onChange={(e) => setHeadingAccent(e.target.value)}
              />
            </Field>
          </div>
          <button
            type="button"
            disabled={sectionSaving}
            onClick={saveIntro}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {sectionSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save intro
          </button>
        </div>
      ) : (
        <>
          <div className={cardGridClass}>
            {items.map((item) => (
              <div key={item.id} className="admin-card rounded-2xl p-6">
                <Field label="Experience name">
                  <input
                    className={inputClass}
                    value={item.title}
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((i) =>
                          i.id === item.id
                            ? { ...i, title: e.target.value }
                            : i,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Short description">
                  <textarea
                    className={`${inputClass} min-h-[88px] resize-y`}
                    rows={3}
                    value={item.description ?? ""}
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((i) =>
                          i.id === item.id
                            ? { ...i, description: e.target.value }
                            : i,
                        ),
                      )
                    }
                  />
                </Field>
                <AdminImageUpload
                  title="Photo"
                  file={photoFiles[item.id] ?? null}
                  existingUrl={item.image_url}
                  optional
                  onFileChange={(f) =>
                    setPhotoFiles((x) => ({ ...x, [item.id]: f }))
                  }
                />
                <button
                  type="button"
                  disabled={itemSaving === item.id}
                  onClick={() => saveItem(item)}
                  className={saveCardButtonClass}
                >
                  {itemSaving === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save this experience
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <AdminCmsPageRoot>
      <AdminCmsPageHeader
        title="Experiences"
        subtitle="The small label on the website stays fixed. Edit the large heading and the five experience cards here."
        badge="Page Settings"
      />
      <AdminCmsTabbedCard
        tabs={[
          { id: "home", label: "Section heading", icon: Home },
          { id: "items", label: "Each experience", icon: ListOrdered },
        ]}
        activeTab={tab}
        onTabChange={(id) => setTab(id as ExperiencesTabId)}
      >
        {inner}
      </AdminCmsTabbedCard>
    </AdminCmsPageRoot>
  );
}
