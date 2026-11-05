import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../components/MediaFileUploadZone";
import { ListPagination } from "../components/ListPagination";
import { useClientPagination } from "../hooks/useClientPagination";
import { apiRequest, apiUpload } from "../../api/client";
import { computeIntroWordLimits } from "../utils/aboutIntroWordLimits";

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

const cardGridClass =
  "grid grid-cols-1 md:grid-cols-2 gap-4 items-start";

const saveCardButtonClass =
  "mt-6 inline-flex items-center gap-2 rounded-xl border border-[#71803F] px-4 py-2.5 text-sm font-semibold text-[#5F7138]";

function AboutIntroWordLimitHelp({
  paragraph1,
  paragraph2,
}: {
  paragraph1: string;
  paragraph2: string;
}) {
  const limits = computeIntroWordLimits(paragraph1, paragraph2);
  const overCombined = limits.total_words > limits.combined_max;
  const p1Over = limits.p1_words > limits.p1_max;
  const p2Over = limits.p2_words > limits.p2_max;

  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
        overCombined || p1Over || p2Over
          ? "border-red-300 bg-red-50 text-[#5c2a2a]"
          : "border-[#E0D8CC] bg-[#FAF7F2] text-[#4A4540]"
      }`}
    >
      <p className="font-semibold text-[#332C26] mb-2">
        About page text limits (paragraph 1 + paragraph 2)
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Shared budget:</strong> both paragraphs may use up to{" "}
          <strong>{limits.combined_max} words total</strong>. If one paragraph
          is long, the other must be shorter so the total stays within{" "}
          {limits.combined_max}.
        </li>
        <li>
          <strong>Paragraph 1</strong> (required): {limits.p1_words} words
          written · you may use up to {limits.p1_max} words with your current
          paragraph 2.
        </li>
        <li>
          <strong>Paragraph 2</strong> (optional, About page only):{" "}
          {limits.p2_words} words written · you may use up to {limits.p2_max}{" "}
          words with your current paragraph 1.
        </li>
        <li>
          <strong>Total so far:</strong> {limits.total_words} /{" "}
          {limits.combined_max} words
          {overCombined ? " — over limit; shorten one or both paragraphs." : ""}
        </li>
      </ul>
    </div>
  );
}

function AdminAboutIntroEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    heading_line_1: "",
    heading_line_2: "",
    heading_accent: "",
    paragraph_1: "",
    paragraph_2: "",
    home_tagline: "",
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
          home_tagline: (res.data as { home_tagline?: string }).home_tagline ?? "",
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
      fd.append("home_tagline", form.home_tagline);
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
        <AboutIntroWordLimitHelp
          paragraph1={form.paragraph_1}
          paragraph2={form.paragraph_2}
        />
        <Field label="First paragraph (required — home teaser + full text on About page)">
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={form.paragraph_1}
            onChange={(e) =>
              setForm((f) => ({ ...f, paragraph_1: e.target.value }))
            }
          />
        </Field>
        <Field label="Second paragraph (optional — About page only)">
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={form.paragraph_2}
            onChange={(e) =>
              setForm((f) => ({ ...f, paragraph_2: e.target.value }))
            }
          />
        </Field>
        <Field label="Home tagline (under paragraph 1 on homepage only)">
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={form.home_tagline}
            onChange={(e) =>
              setForm((f) => ({ ...f, home_tagline: e.target.value }))
            }
          />
        </Field>
        <p className="mb-4 text-xs text-[#6E655C]">
          The homepage “Discover Our Story” button always links to the About
          page — it is not editable here.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminImageUpload
            title="Left photo"
            file={files.photo_left}
            existingUrl={form.photo_left_url}
            optional
            onFileChange={(f) => setFiles((x) => ({ ...x, photo_left: f }))}
          />
          <AdminImageUpload
            title="Center photo"
            file={files.photo_center}
            existingUrl={form.photo_center_url}
            optional
            onFileChange={(f) => setFiles((x) => ({ ...x, photo_center: f }))}
          />
          <AdminImageUpload
            title="Right photo"
            file={files.photo_right}
            existingUrl={form.photo_right_url}
            optional
            onFileChange={(f) => setFiles((x) => ({ ...x, photo_right: f }))}
          />
        </div>
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
  );
}

type AboutBlockForm = {
  heading_line_1: string;
  heading_line_2: string;
  heading_accent: string;
  body_text: string;
  image_url: string | null;
};

function AdminAboutBlockEditor({
  sectionKey,
  showImage,
  imageHint,
}: {
  sectionKey: "story" | "our_place";
  showImage: boolean;
  imageHint?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AboutBlockForm>({
    heading_line_1: "",
    heading_line_2: "",
    heading_accent: "",
    body_text: "",
    image_url: null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          blocks: Record<string, AboutBlockForm & { section_key?: string }>;
        };
      }>("/admin/about/page");
      const block = res.data?.blocks?.[sectionKey];
      if (block) {
        setForm({
          heading_line_1: block.heading_line_1 ?? "",
          heading_line_2: block.heading_line_2 ?? "",
          heading_accent: block.heading_accent ?? "",
          body_text: block.body_text ?? "",
          image_url: block.image_url ?? null,
        });
      }
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load content");
    } finally {
      setLoading(false);
    }
  }, [sectionKey]);

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
      fd.append("body_text", form.body_text);
      if (showImage && photoFile) fd.append("photo", photoFile);
      const res = await apiUpload<{ data: AboutBlockForm }>(
        `/admin/about/blocks/${sectionKey}`,
        fd,
      );
      if (res.data) {
        setForm((f) => ({ ...f, ...res.data }));
        setPhotoFile(null);
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
      <div className="admin-card rounded-2xl p-6 space-y-1">
        {imageHint ? (
          <p className="text-sm admin-card-muted mb-4">{imageHint}</p>
        ) : null}
        <Field label="Main heading — first line">
          <input
            className={inputClass}
            value={form.heading_line_1}
            onChange={(e) =>
              setForm((f) => ({ ...f, heading_line_1: e.target.value }))
            }
          />
        </Field>
        {sectionKey === "our_place" ? (
          <Field label="Main heading — second line (e.g. “Dooars.”)">
            <input
              className={inputClass}
              value={form.heading_line_2}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading_line_2: e.target.value }))
              }
            />
          </Field>
        ) : null}
        <Field
          label={
            sectionKey === "our_place"
              ? "Subheading (gold italic line)"
              : "Green accent line"
          }
        >
          <input
            className={inputClass}
            value={form.heading_accent}
            onChange={(e) =>
              setForm((f) => ({ ...f, heading_accent: e.target.value }))
            }
          />
        </Field>
        <Field label="Body paragraph">
          <textarea
            className={`${inputClass} min-h-[140px]`}
            value={form.body_text}
            onChange={(e) =>
              setForm((f) => ({ ...f, body_text: e.target.value }))
            }
          />
        </Field>
        {showImage ? (
          <AdminImageUpload
            title="Section photo"
            file={photoFile}
            existingUrl={form.image_url}
            optional
            onFileChange={setPhotoFile}
          />
        ) : null}
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
  );
}

type AboutValueRow = {
  id: number;
  title: string;
  description: string | null;
  icon_key: string;
};

const VALUE_ICON_OPTIONS = [
  { value: "nature", label: "Nature" },
  { value: "design", label: "Design" },
  { value: "hospitality", label: "Hospitality" },
  { value: "experiences", label: "Experiences" },
] as const;

function AdminAboutValuesEditor() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AboutValueRow[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: { values: AboutValueRow[] };
      }>("/admin/about/page");
      setItems(res.data?.values ?? []);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load values");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveItem = async (item: AboutValueRow) => {
    setSavingId(item.id);
    try {
      const res = await apiRequest<{ data: AboutValueRow }>(
        `/admin/about/values/${item.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            title: item.title,
            description: item.description ?? "",
            icon_key: item.icon_key,
          }),
        },
      );
      if (res.data) {
        setItems((list) =>
          list.map((i) => (i.id === item.id ? res.data! : i)),
        );
      }
      toast.success("Value saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSavingId(null);
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
    <>
      <p className="text-sm admin-card-muted mb-4">
        Four value pillars shown on the About page (icons stay in the design;
        pick which emblem each item uses).
      </p>
      <div className={cardGridClass}>
        {items.map((item) => (
          <div key={item.id} className="admin-card rounded-2xl p-6">
            <Field label="Icon">
              <select
                className={inputClass}
                value={item.icon_key}
                onChange={(e) =>
                  setItems((list) =>
                    list.map((i) =>
                      i.id === item.id
                        ? { ...i, icon_key: e.target.value }
                        : i,
                    ),
                  )
                }
              >
                {VALUE_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
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
            <button
              type="button"
              disabled={savingId === item.id}
              onClick={() => saveItem(item)}
              className={saveCardButtonClass}
            >
              {savingId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save this value
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

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
    <div className={tab === "values" ? "max-w-6xl" : "max-w-3xl"}>
      <h1 className="text-2xl font-bold admin-page-title mb-2">About page</h1>
      <p className="text-sm text-[#6E655C] mb-4 max-w-2xl">
        Edit About page sections here.{" "}
        <strong>Experiences</strong> is under its own submenu.
      </p>
      <div className="flex flex-wrap gap-1 border-b border-[#E8E0D4] mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-semibold ${
              tab === t.id
                ? "border-b-2 border-[#71803F] text-[#332C26]"
                : "text-[#657067] hover:text-[#332C26]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
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
    </div>
  );
}

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

  const {
    paginatedItems: pagedExperienceItems,
    paginationProps: experiencePagination,
  } = useClientPagination(items, { pageSize: 4, pageSizeOptions: [2, 4, 8] });

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

  const inner = (
    <>
      {tab === "home" ? (
        <div className="admin-card rounded-2xl p-6">
          <p className="text-sm admin-card-muted mb-4">
            The small label “Experiences That Stay With You” stays fixed on the
            website. Edit the large heading here; use the “Each experience” tab
            for the five items.
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
      ) : (
        <>
          <div className={cardGridClass}>
            {pagedExperienceItems.map((item) => (
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
          {items.length > 0 ? (
            <ListPagination
              {...experiencePagination}
              className="mt-4 rounded-2xl border border-[#EDE4D8]"
              itemLabel="experiences"
            />
          ) : null}
        </>
      )}
    </>
  );

  return (
    <div className={tab === "items" ? "max-w-6xl" : "max-w-3xl"}>
      <h1 className="text-2xl font-bold admin-page-title mb-2">Experiences</h1>
      <div className="flex flex-wrap gap-1 border-b border-[#E8E0D4] mb-6">
        {(
          [
            { id: "home", label: "Section heading" },
            { id: "items", label: "Each experience" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-semibold ${
              tab === t.id
                ? "border-b-2 border-[#71803F] text-[#332C26]"
                : "text-[#657067] hover:text-[#332C26]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {inner}
    </div>
  );
}

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

  const { paginatedItems: pagedStayItems, paginationProps: stayPagination } =
    useClientPagination(items, { pageSize: 4, pageSizeOptions: [2, 4, 8] });

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
        <>
          <div className={cardGridClass}>
            {pagedStayItems.map((item) => (
              <div key={item.id} className="admin-card rounded-2xl p-6">
              <p className="mb-3 text-sm font-medium capitalize text-[#332C26]">
                {item.slug.replace(/-/g, " ")} stay
              </p>
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
                        i.id === item.id ? { ...i, title: e.target.value } : i,
                      ),
                    )
                  }
                />
              </Field>
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
          {items.length > 0 ? (
            <ListPagination
              {...stayPagination}
              className="mt-4 rounded-2xl border border-[#EDE4D8]"
              itemLabel="stays"
            />
          ) : null}
        </>
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

  const { paginatedItems: pagedSlides, paginationProps: slidePagination } =
    useClientPagination(slides, { pageSize: 4, pageSizeOptions: [2, 4, 8] });

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
        <>
          <div className={cardGridClass}>
            {pagedSlides.map((slide, index) => (
            <div key={slide.id} className="admin-card rounded-2xl p-6">
              <p className="mb-4 text-sm font-semibold text-[#332C26]">
                Slide{" "}
                {(slidePagination.page - 1) * slidePagination.pageSize +
                  index +
                  1}
              </p>
              <Field label="Quote text">
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  rows={3}
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
              <AdminImageUpload
                title="Photo"
                file={photoFiles[slide.id] ?? null}
                existingUrl={slide.image_url}
                optional
                onFileChange={(f) =>
                  setPhotoFiles((x) => ({ ...x, [slide.id]: f }))
                }
              />
              <button
                type="button"
                disabled={slideSaving === slide.id}
                onClick={() => saveSlide(slide)}
                className={saveCardButtonClass}
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
          {slides.length > 0 ? (
            <ListPagination
              {...slidePagination}
              className="mt-4 rounded-2xl border border-[#EDE4D8]"
              itemLabel="slides"
            />
          ) : null}
        </>
      )}
    </TabbedPageShell>
  );
}
