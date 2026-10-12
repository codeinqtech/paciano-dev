import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, apiUpload } from "../../api/client";

function SectionShell({
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

function TabbedPageShell({
  pageTitle,
  tabs,
  activeTab,
  onTabChange,
  wide = false,
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
    <div className={wide ? "max-w-6xl" : "max-w-3xl"}>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block mb-5">
      <span className="text-sm font-medium text-[#332C26] mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#E0D8CC] bg-white px-3 py-2.5 text-sm text-[#332C26] focus:outline-none focus:ring-2 focus:ring-[#71803F]/35";

function PhotoField({
  label,
  currentUrl,
  onFile,
}: {
  label: string;
  currentUrl: string | null;
  onFile: (f: File | null) => void;
}) {
  return (
    <Field label={label}>
      {currentUrl ? (
        <img
          src={currentUrl}
          alt=""
          className="mb-2 h-28 w-full max-w-xs rounded-xl object-cover border border-[#E8E0D4]"
        />
      ) : null}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#C9BCA8] px-4 py-3 text-sm text-[#5F7138] hover:bg-[#F7F3EB]">
        <Upload className="h-4 w-4" />
        Choose photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </label>
    </Field>
  );
}

export function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    heading_line_1: "",
    heading_line_2: "",
    heading_accent: "",
    paragraph_1: "",
    paragraph_2: "",
    photo_left_url: null as string | null,
    photo_center_url: null as string | null,
    photo_right_url: null as string | null,
  });
  const [files, setFiles] = useState<{
    photo_left: File | null;
    photo_center: File | null;
    photo_right: File | null;
  }>({ photo_left: null, photo_center: null, photo_right: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ data: typeof form }>(
        "/admin/home/sections/about",
      );
      if (res.data) {
        setForm({
          heading_line_1: res.data.heading_line_1 ?? "",
          heading_line_2: res.data.heading_line_2 ?? "",
          heading_accent: res.data.heading_accent ?? "",
          paragraph_1: res.data.paragraph_1 ?? "",
          paragraph_2: res.data.paragraph_2 ?? "",
          photo_left_url: res.data.photo_left_url ?? null,
          photo_center_url: res.data.photo_center_url ?? null,
          photo_right_url: res.data.photo_right_url ?? null,
        });
      }
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

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("heading_line_1", form.heading_line_1);
      fd.append("heading_line_2", form.heading_line_2);
      fd.append("heading_accent", form.heading_accent);
      fd.append("paragraph_1", form.paragraph_1);
      fd.append("paragraph_2", form.paragraph_2);
      if (files.photo_left) fd.append("photo_left", files.photo_left);
      if (files.photo_center) fd.append("photo_center", files.photo_center);
      if (files.photo_right) fd.append("photo_right", files.photo_right);
      const res = await apiUpload<{ data: typeof form }>(
        "/admin/home/sections/about",
        fd,
      );
      if (res.data) {
        setForm((f) => ({ ...f, ...res.data }));
        setFiles({ photo_left: null, photo_center: null, photo_right: null });
      }
      toast.success("Saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <SectionShell pageTitle="About Paciano">
      <div className="admin-card rounded-2xl p-6 space-y-1">
        <Field label="First headline line">
          <input
            className={inputClass}
            value={form.heading_line_1}
            onChange={(e) =>
              setForm((f) => ({ ...f, heading_line_1: e.target.value }))
            }
          />
        </Field>
        <Field label="Second headline line">
          <input
            className={inputClass}
            value={form.heading_line_2}
            onChange={(e) =>
              setForm((f) => ({ ...f, heading_line_2: e.target.value }))
            }
          />
        </Field>
        <Field label="Green accent line">
          <input
            className={inputClass}
            value={form.heading_accent}
            onChange={(e) =>
              setForm((f) => ({ ...f, heading_accent: e.target.value }))
            }
          />
        </Field>
        <Field label="First paragraph">
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={form.paragraph_1}
            onChange={(e) =>
              setForm((f) => ({ ...f, paragraph_1: e.target.value }))
            }
          />
        </Field>
        <Field label="Second paragraph">
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={form.paragraph_2}
            onChange={(e) =>
              setForm((f) => ({ ...f, paragraph_2: e.target.value }))
            }
          />
        </Field>
        <PhotoField
          label="Left photo"
          currentUrl={form.photo_left_url}
          onFile={(f) => setFiles((x) => ({ ...x, photo_left: f }))}
        />
        <PhotoField
          label="Center photo"
          currentUrl={form.photo_center_url}
          onFile={(f) => setFiles((x) => ({ ...x, photo_center: f }))}
        />
        <PhotoField
          label="Right photo"
          currentUrl={form.photo_right_url}
          onFile={(f) => setFiles((x) => ({ ...x, photo_right: f }))}
        />
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4d5c2e] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </button>
      </div>
    </SectionShell>
  );
}

type ExperienceItem = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
};

export function AdminExperiencesPage() {
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
      <div className="flex items-center gap-2 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <SectionShell pageTitle="Experiences">
      <div className="admin-card rounded-2xl p-6 mb-6">
        <p className="text-sm admin-card-muted mb-4">
          The small label “Experiences That Stay With You” stays fixed on the
          website. Edit the large heading and each experience below.
        </p>
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

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="admin-card rounded-2xl p-6">
            <h3 className="font-semibold text-[#332C26] mb-3">{item.title}</h3>
            <Field label="Title">
              <input
                className={inputClass}
                value={item.title}
                onChange={(e) =>
                  setItems((list) =>
                    list.map((i) =>
                      i.id === item.id ? { ...i, title: e.target.value } : i,
                    ),
                  )
                }
              />
            </Field>
            <Field label="Short description">
              <textarea
                className={`${inputClass} min-h-[72px]`}
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
            <PhotoField
              label="Photo"
              currentUrl={item.image_url}
              onFile={(f) => setPhotoFiles((x) => ({ ...x, [item.id]: f }))}
            />
            <button
              type="button"
              disabled={itemSaving === item.id}
              onClick={() => saveItem(item)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#71803F] px-4 py-2 text-sm font-semibold text-[#5F7138]"
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
    </SectionShell>
  );
}

type StayItem = {
  id: number;
  slug: string;
  title: string;
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
      fd.append("title", item.title);
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
      <div className="flex items-center gap-2 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <TabbedPageShell
      pageTitle="Our Stays"
      wide={tab === "items"}
      tabs={[
        { id: "home", label: "Home section" },
        { id: "items", label: "Each stay" },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as StaysTabId)}
    >
      {tab === "home" ? (
        <div className="admin-card rounded-2xl p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="admin-card rounded-2xl p-6 h-full">
              <h3 className="font-semibold text-[#332C26] mb-3 capitalize">
                {item.slug.replace(/-/g, " ")}
              </h3>
              <Field label="Stay title">
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(e) =>
                    setItems((list) =>
                      list.map((i) =>
                        i.id === item.id ? { ...i, title: e.target.value } : i,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Description">
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
              <PhotoField
                label="Photo 1"
                currentUrl={item.photo_1_url}
                onFile={(f) =>
                  setPhotoFiles((x) => ({
                    ...x,
                    [item.id]: { ...x[item.id], p1: f },
                  }))
                }
              />
              <PhotoField
                label="Photo 2"
                currentUrl={item.photo_2_url}
                onFile={(f) =>
                  setPhotoFiles((x) => ({
                    ...x,
                    [item.id]: { ...x[item.id], p2: f },
                  }))
                }
              />
              <PhotoField
                label="Photo 3"
                currentUrl={item.photo_3_url}
                onFile={(f) =>
                  setPhotoFiles((x) => ({
                    ...x,
                    [item.id]: { ...x[item.id], p3: f },
                  }))
                }
              />
              <button
                type="button"
                disabled={itemSaving === item.id}
                onClick={() => saveItem(item)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#71803F] px-4 py-2 text-sm font-semibold text-[#5F7138]"
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
      )}
    </TabbedPageShell>
  );
}

type DiningSlide = {
  id: number;
  quote: string | null;
  image_url: string | null;
};

type DiningTabId = "home" | "slides";

export function AdminDiningPage() {
  const [tab, setTab] = useState<DiningTabId>("home");
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [slideSaving, setSlideSaving] = useState<number | null>(null);
  const [form, setForm] = useState({
    heading_line_1: "",
    heading_line_2: "",
    heading_accent: "",
    description: "",
  });
  const [slides, setSlides] = useState<DiningSlide[]>([]);
  const [photoFiles, setPhotoFiles] = useState<Record<number, File | null>>(
    {},
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          section: typeof form;
          slides: DiningSlide[];
        };
      }>("/admin/home/sections/dining");
      if (res.data?.section) {
        setForm({
          heading_line_1: res.data.section.heading_line_1 ?? "",
          heading_line_2: res.data.section.heading_line_2 ?? "",
          heading_accent: res.data.section.heading_accent ?? "",
          description: res.data.section.description ?? "",
        });
      }
      setSlides(res.data?.slides ?? []);
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
      await apiRequest("/admin/home/sections/dining/intro", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Intro saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSectionSaving(false);
    }
  };

  const saveSlide = async (slide: DiningSlide) => {
    setSlideSaving(slide.id);
    try {
      const fd = new FormData();
      fd.append("quote", slide.quote ?? "");
      const file = photoFiles[slide.id];
      if (file) fd.append("photo", file);
      const res = await apiUpload<{ data: DiningSlide }>(
        `/admin/home/sections/dining/slides/${slide.id}`,
        fd,
      );
      if (res.data) {
        setSlides((list) =>
          list.map((s) => (s.id === slide.id ? res.data! : s)),
        );
        setPhotoFiles((f) => ({ ...f, [slide.id]: null }));
      }
      toast.success("Slide saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSlideSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <TabbedPageShell
      pageTitle="Dining at Paciano"
      wide={tab === "slides"}
      tabs={[
        { id: "home", label: "Home section" },
        { id: "slides", label: "Carousel slides" },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as DiningTabId)}
    >
      {tab === "home" ? (
        <div className="admin-card rounded-2xl p-6">
          <Field label="First headline line">
            <input
              className={inputClass}
              value={form.heading_line_1}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading_line_1: e.target.value }))
              }
            />
          </Field>
          <Field label="Second headline line">
            <input
              className={inputClass}
              value={form.heading_line_2}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading_line_2: e.target.value }))
              }
            />
          </Field>
          <Field label="Green accent line">
            <input
              className={inputClass}
              value={form.heading_accent}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading_accent: e.target.value }))
              }
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide, index) => (
            <div key={slide.id} className="admin-card rounded-2xl p-6 h-full">
              <h3 className="font-semibold text-[#332C26] mb-3">
                Slide {index + 1}
              </h3>
              <Field label="Quote text">
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  value={slide.quote ?? ""}
                  onChange={(e) =>
                    setSlides((list) =>
                      list.map((s) =>
                        s.id === slide.id
                          ? { ...s, quote: e.target.value }
                          : s,
                      ),
                    )
                  }
                />
              </Field>
              <PhotoField
                label="Photo"
                currentUrl={slide.image_url}
                onFile={(f) => setPhotoFiles((x) => ({ ...x, [slide.id]: f }))}
              />
              <button
                type="button"
                disabled={slideSaving === slide.id}
                onClick={() => saveSlide(slide)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#71803F] px-4 py-2 text-sm font-semibold text-[#5F7138]"
              >
                {slideSaving === slide.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save this slide
              </button>
            </div>
          ))}
        </div>
      )}
    </TabbedPageShell>
  );
}
