import { useEffect, useState } from "react";
import { ImageIcon, LayoutList, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiUpload } from "../../../api/client";
import {
  Field,
  TabbedPageShell,
  cardGridTwoColClass,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
import {
  type CategoryPageForm,
  emptyCategoryPage,
  pageFormFromCms,
  useAdminEventsCms,
} from "./eventsAdminShared";

type CategoryTabId = "hero" | "experience" | "items";

type Props = {
  slug: "corporate" | "wedding";
  pageTitle: string;
  venuesSectionLabel: string;
  landingSectionLabel: string;
};

export function AdminEventsCategoryPage({
  slug,
  pageTitle,
  venuesSectionLabel,
  landingSectionLabel,
}: Props) {
  const { loading, cms, load } = useAdminEventsCms();
  const [tab, setTab] = useState<CategoryTabId>("hero");

  const [page, setPage] = useState<CategoryPageForm>(emptyCategoryPage());
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);

  const [experienceForms, setExperienceForms] = useState<
    Record<
      number,
      {
        title: string;
        description: string;
        icon_key: string;
        show_on_landing: boolean;
      }
    >
  >({});
  const [experienceFiles, setExperienceFiles] = useState<
    Record<string, File | null>
  >({});
  const [experienceSaving, setExperienceSaving] = useState<string | null>(null);

  const [venueForms, setVenueForms] = useState<
    Record<
      number,
      {
        title: string;
        description: string;
        capacity: string;
        setup: string;
      }
    >
  >({});
  const [venueFiles, setVenueFiles] = useState<Record<string, File | null>>({});
  const [venueSaving, setVenueSaving] = useState<string | null>(null);

  const cat = cms?.categories?.[slug];
  const items = cat?.experience_items ?? [];
  const venues = cat?.venue_items ?? [];

  useEffect(() => {
    if (!cms) return;
    setPage(pageFormFromCms(cms.categories?.[slug]));

    const exp: typeof experienceForms = {};
    for (const item of cms.categories?.[slug]?.experience_items ?? []) {
      exp[item.id] = {
        title: item.title,
        description: item.description ?? "",
        icon_key: item.icon_key ?? "",
        show_on_landing: item.show_on_landing,
      };
    }
    setExperienceForms(exp);

    const ven: typeof venueForms = {};
    for (const item of cms.categories?.[slug]?.venue_items ?? []) {
      ven[item.id] = {
        title: item.title,
        description: item.description ?? "",
        capacity: item.capacity ?? "",
        setup: item.setup ?? "",
      };
    }
    setVenueForms(ven);
  }, [cms, slug]);

  const saveCategoryPage = async () => {
    setCategorySaving(true);
    try {
      const fd = new FormData();
      Object.entries(page).forEach(([k, v]) => fd.append(k, v));
      if (heroFile) fd.append("hero_image", heroFile);
      await apiUpload(`/admin/events/categories/${slug}/page`, fd);
      setHeroFile(null);
      toast.success("Saved");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setCategorySaving(false);
    }
  };

  const saveExperience = async (id: number) => {
    const key = `${slug}-${id}`;
    setExperienceSaving(key);
    const form = experienceForms[id];
    if (!form) return;
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("icon_key", form.icon_key);
      fd.append("show_on_landing", form.show_on_landing ? "1" : "0");
      const file = experienceFiles[key];
      if (file) fd.append("image", file);
      await apiUpload(
        `/admin/events/categories/${slug}/experience-items/${id}`,
        fd,
      );
      setExperienceFiles((f) => ({ ...f, [key]: null }));
      toast.success("Experience item saved");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setExperienceSaving(null);
    }
  };

  const saveVenue = async (id: number) => {
    const key = `${slug}-${id}`;
    setVenueSaving(key);
    const form = venueForms[id];
    if (!form) return;
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("capacity", form.capacity);
      fd.append("setup", form.setup);
      const file = venueFiles[key];
      if (file) fd.append("image", file);
      await apiUpload(`/admin/events/categories/${slug}/venue-items/${id}`, fd);
      setVenueFiles((f) => ({ ...f, [key]: null }));
      toast.success("Venue saved");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setVenueSaving(null);
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
      pageTitle={pageTitle}
      subtitle={`Content for /events/${slug === "corporate" ? "corporate-events" : "weddings"}.`}
      wide={tab === "items"}
      tabs={[
        { id: "hero", label: "Hero banner", icon: ImageIcon },
        { id: "experience", label: "THE PACIANO EXPERIENCE", icon: Sparkles },
        { id: "items", label: "Experience items", icon: LayoutList },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as CategoryTabId)}
    >
      {tab === "hero" ? (
        <div>
          <AdminImageUpload
            title="Hero image"
            file={heroFile}
            existingUrl={cat?.page.hero.image_url}
            optional
            onFileChange={setHeroFile}
          />
          <div className={`mt-4 ${formTwoColPairedRowClass}`}>
            <Field label="Eyebrow (small line)">
              <input
                className={inputClass}
                value={page.hero_event_type}
                onChange={(e) =>
                  setPage((p) => ({ ...p, hero_event_type: e.target.value }))
                }
              />
            </Field>
            <Field label="CTA text">
              <input
                className={inputClass}
                value={page.hero_cta_text}
                onChange={(e) =>
                  setPage((p) => ({ ...p, hero_cta_text: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="CTA link">
            <input
              className={inputClass}
              value={page.hero_cta_href}
              placeholder="/contact"
              onChange={(e) =>
                setPage((p) => ({ ...p, hero_cta_href: e.target.value }))
              }
            />
          </Field>
          <div className={formTwoColPairedRowClass}>
            <Field label="Title line 1">
              <input
                className={inputClass}
                value={page.hero_title_line1}
                onChange={(e) =>
                  setPage((p) => ({ ...p, hero_title_line1: e.target.value }))
                }
              />
            </Field>
            <Field label="Title line 2">
              <input
                className={inputClass}
                value={page.hero_title_line2}
                onChange={(e) =>
                  setPage((p) => ({ ...p, hero_title_line2: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={page.hero_description}
              onChange={(e) =>
                setPage((p) => ({ ...p, hero_description: e.target.value }))
              }
            />
          </Field>
          <button
            type="button"
            disabled={categorySaving}
            onClick={saveCategoryPage}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {categorySaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save hero
          </button>
        </div>
      ) : null}

      {tab === "experience" ? (
        <div className="space-y-10">
          <div>
            <h3 className="mb-4 text-base font-semibold text-[#332C26]">
              Section headings
            </h3>
            <div className={formTwoColPairedRowClass}>
              <Field label="Eyebrow">
                <input
                  className={inputClass}
                  value={page.advantage_eyebrow}
                  onChange={(e) =>
                    setPage((p) => ({
                      ...p,
                      advantage_eyebrow: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <div className={formTwoColPairedRowClass}>
              <Field label="Title line 1">
                <input
                  className={inputClass}
                  value={page.advantage_title_line1}
                  onChange={(e) =>
                    setPage((p) => ({
                      ...p,
                      advantage_title_line1: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Title line 2">
                <input
                  className={inputClass}
                  value={page.advantage_title_line2}
                  onChange={(e) =>
                    setPage((p) => ({
                      ...p,
                      advantage_title_line2: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[88px]`}
                value={page.advantage_description}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    advantage_description: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-[#332C26]">
              {venuesSectionLabel} — section headings
            </h3>
            <div className={formTwoColPairedRowClass}>
              <Field label="Eyebrow">
                <input
                  className={inputClass}
                  value={page.venues_eyebrow}
                  onChange={(e) =>
                    setPage((p) => ({ ...p, venues_eyebrow: e.target.value }))
                  }
                />
              </Field>
            </div>
            <div className={formTwoColPairedRowClass}>
              <Field label="Title line 1">
                <input
                  className={inputClass}
                  value={page.venues_title1}
                  onChange={(e) =>
                    setPage((p) => ({ ...p, venues_title1: e.target.value }))
                  }
                />
              </Field>
              <Field label="Title line 2">
                <input
                  className={inputClass}
                  value={page.venues_title2}
                  onChange={(e) =>
                    setPage((p) => ({ ...p, venues_title2: e.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[88px]`}
                value={page.venues_description}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    venues_description: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <button
            type="button"
            disabled={categorySaving}
            onClick={saveCategoryPage}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {categorySaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save section headings
          </button>
        </div>
      ) : null}

      {tab === "items" ? (
        <div className="space-y-12">
          <div>
            <p className="mb-4 text-sm text-[#657067]">
              Tick “Show on /events” for one item — its image appears on the main
              Events page under {landingSectionLabel}.
            </p>
            <div className={cardGridTwoColClass}>
              {items.map((item) => {
                const form = experienceForms[item.id];
                if (!form) return null;
                const fileKey = `${slug}-${item.id}`;
                return (
                  <div key={item.id} className="admin-card rounded-2xl p-6">
                    <div className={formTwoColPairedRowClass}>
                      <Field label="Title">
                        <input
                          className={inputClass}
                          value={form.title}
                          onChange={(e) =>
                            setExperienceForms((f) => ({
                              ...f,
                              [item.id]: { ...form, title: e.target.value },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Icon key">
                        <input
                          className={inputClass}
                          value={form.icon_key}
                          placeholder="presentation, heart, …"
                          onChange={(e) =>
                            setExperienceForms((f) => ({
                              ...f,
                              [item.id]: { ...form, icon_key: e.target.value },
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Description">
                      <textarea
                        className={`${inputClass} min-h-[72px]`}
                        value={form.description}
                        onChange={(e) =>
                          setExperienceForms((f) => ({
                            ...f,
                            [item.id]: { ...form, description: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <label className="mb-3 flex items-center gap-2 text-sm text-[#42483A]">
                      <input
                        type="checkbox"
                        checked={form.show_on_landing}
                        onChange={(e) =>
                          setExperienceForms((f) => ({
                            ...f,
                            [item.id]: {
                              ...form,
                              show_on_landing: e.target.checked,
                            },
                          }))
                        }
                      />
                      Show image on main /events ({landingSectionLabel})
                    </label>
                    <AdminImageUpload
                      title="Feature image"
                      file={experienceFiles[fileKey] ?? null}
                      existingUrl={item.image_url}
                      optional
                      onFileChange={(f) =>
                        setExperienceFiles((x) => ({ ...x, [fileKey]: f }))
                      }
                    />
                    <button
                      type="button"
                      disabled={experienceSaving === fileKey}
                      onClick={() => saveExperience(item.id)}
                      className={saveCardButtonClass}
                    >
                      {experienceSaving === fileKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-[#332C26]">
              Venue cards ({venuesSectionLabel})
            </h3>
            <div className={cardGridTwoColClass}>
              {venues.map((item) => {
                const form = venueForms[item.id];
                if (!form) return null;
                const fileKey = `${slug}-${item.id}`;
                return (
                  <div key={item.id} className="admin-card rounded-2xl p-6">
                    <Field label="Title">
                      <input
                        className={inputClass}
                        value={form.title}
                        onChange={(e) =>
                          setVenueForms((f) => ({
                            ...f,
                            [item.id]: { ...form, title: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        className={`${inputClass} min-h-[72px]`}
                        value={form.description}
                        onChange={(e) =>
                          setVenueForms((f) => ({
                            ...f,
                            [item.id]: { ...form, description: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <div className={formTwoColPairedRowClass}>
                      <Field label="Capacity label">
                        <input
                          className={inputClass}
                          value={form.capacity}
                          onChange={(e) =>
                            setVenueForms((f) => ({
                              ...f,
                              [item.id]: { ...form, capacity: e.target.value },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Setup label">
                        <input
                          className={inputClass}
                          value={form.setup}
                          onChange={(e) =>
                            setVenueForms((f) => ({
                              ...f,
                              [item.id]: { ...form, setup: e.target.value },
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <AdminImageUpload
                      title="Venue image"
                      file={venueFiles[fileKey] ?? null}
                      existingUrl={item.image_url}
                      optional
                      onFileChange={(f) =>
                        setVenueFiles((x) => ({ ...x, [fileKey]: f }))
                      }
                    />
                    <button
                      type="button"
                      disabled={venueSaving === fileKey}
                      onClick={() => saveVenue(item.id)}
                      className={saveCardButtonClass}
                    >
                      {venueSaving === fileKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save venue
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </TabbedPageShell>
  );
}