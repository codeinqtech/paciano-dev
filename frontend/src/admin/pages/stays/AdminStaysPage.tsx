import { useCallback, useEffect, useState } from "react";
import { BedDouble, Home, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiRequest, apiUpload } from "../../../api/client";
import {
  Field,
  TabbedPageShell,
  cardGridTwoColClass,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
type StayItem = {
  id: number;
  slug: string;
  menu_label: string | null;
  button_descriptor: string | null;
  title: string;
  photo_label: string | null;
  description: string | null;
  photo_1_url: string | null;
  photo_2_url: string | null;
  photo_3_url: string | null;
};

type StaysTabId = "home" | "items";

export function AdminStaysPage() {
  const [tab, setTab] = useState<StaysTabId>("home");
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState<number | null>(null);
  const [headingMain, setHeadingMain] = useState("");
  const [headingAccent, setHeadingAccent] = useState("");
  const [introText, setIntroText] = useState("");
  const [items, setItems] = useState<StayItem[]>([]);
  const [photoFiles, setPhotoFiles] = useState<
    Record<number, { p1?: File | null; p2?: File | null; p3?: File | null }>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          section: {
            heading_main: string;
            heading_accent: string;
            intro_text: string;
          };
          items: StayItem[];
        };
      }>("/admin/home/sections/stays");
      setHeadingMain(res.data?.section?.heading_main ?? "");
      setHeadingAccent(res.data?.section?.heading_accent ?? "");
      setIntroText(res.data?.section?.intro_text ?? "");
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
      await apiRequest("/admin/home/sections/stays/intro", {
        method: "POST",
        body: JSON.stringify({
          heading_main: headingMain,
          heading_accent: headingAccent,
          intro_text: introText,
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

  const saveItem = async (item: StayItem) => {
    setItemSaving(item.id);
    try {
      const fd = new FormData();
      fd.append("menu_label", item.menu_label ?? "");
      fd.append("button_descriptor", item.button_descriptor ?? "");
      fd.append("title", item.title);
      fd.append("photo_label", item.photo_label ?? "");
      fd.append("description", item.description ?? "");
      const pf = photoFiles[item.id] ?? {};
      if (pf.p1) fd.append("photo_1", pf.p1);
      if (pf.p2) fd.append("photo_2", pf.p2);
      if (pf.p3) fd.append("photo_3", pf.p3);
      const res = await apiUpload<{ data: StayItem }>(
        `/admin/home/sections/stays/items/${item.id}`,
        fd,
      );
      if (res.data) {
        setItems((list) =>
          list.map((i) => (i.id === item.id ? res.data! : i)),
        );
        setPhotoFiles((f) => {
          const next = { ...f };
          delete next[item.id];
          return next;
        });
      }
      toast.success("Stay saved");
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

  return (
    <TabbedPageShell
      pageTitle="Our Stays"
      subtitle="Edit the stays section intro on the home page and each stay card."
      wide={tab === "items"}
      tabs={[
        { id: "home", label: "Home section", icon: Home },
        { id: "items", label: "Each stay", icon: BedDouble },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as StaysTabId)}
    >
      {tab === "home" ? (
        <div>
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
          <Field label="Intro paragraph">
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
            />
          </Field>
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
          <div className={cardGridTwoColClass}>
            {items.map((item) => (
              <div key={item.id} className="admin-card rounded-2xl p-6">
              <p className="mb-3 text-sm font-medium capitalize text-[#332C26]">
                {item.slug.replace(/-/g, " ")} stay
              </p>
              <div className={formTwoColPairedRowClass}>
                <Field label="Button name (large text on the home page tabs)">
                  <input
                    className={inputClass}
                    value={item.menu_label ?? ""}
                    placeholder="e.g. Premium Suites"
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((i) =>
                          i.id === item.id
                            ? { ...i, menu_label: e.target.value }
                            : i,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Short line under the button name">
                  <input
                    className={inputClass}
                    value={item.button_descriptor ?? ""}
                    placeholder="e.g. RIVER & MOUNTAINS"
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((i) =>
                          i.id === item.id
                            ? { ...i, button_descriptor: e.target.value }
                            : i,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
              <div className={formTwoColPairedRowClass}>
                <Field label="Small line above the photo title">
                  <input
                    className={inputClass}
                    value={item.photo_label ?? ""}
                    placeholder="e.g. RIVERSIDE SUITE"
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((i) =>
                          i.id === item.id
                            ? { ...i, photo_label: e.target.value }
                            : i,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Main title on the photo">
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
              </div>
              <Field label="Description on the photo">
                <textarea
                  className={`${inputClass} min-h-[88px]`}
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
              <div className="grid gap-4 sm:grid-cols-3">
                <AdminImageUpload
                  title="Photo 1"
                  file={photoFiles[item.id]?.p1 ?? null}
                  existingUrl={item.photo_1_url}
                  optional
                  onFileChange={(f) =>
                    setPhotoFiles((x) => ({
                      ...x,
                      [item.id]: { ...x[item.id], p1: f },
                    }))
                  }
                />
                <AdminImageUpload
                  title="Photo 2"
                  file={photoFiles[item.id]?.p2 ?? null}
                  existingUrl={item.photo_2_url}
                  optional
                  onFileChange={(f) =>
                    setPhotoFiles((x) => ({
                      ...x,
                      [item.id]: { ...x[item.id], p2: f },
                    }))
                  }
                />
                <AdminImageUpload
                  title="Photo 3"
                  file={photoFiles[item.id]?.p3 ?? null}
                  existingUrl={item.photo_3_url}
                  optional
                  onFileChange={(f) =>
                    setPhotoFiles((x) => ({
                      ...x,
                      [item.id]: { ...x[item.id], p3: f },
                    }))
                  }
                />
              </div>
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
                Save this stay
              </button>
            </div>
            ))}
          </div>
        </>
      )}
    </TabbedPageShell>
  );
}
