import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiRequest, apiUpload } from "../../../api/client";
import { computeIntroWordLimits } from "../../utils/aboutIntroWordLimits";
import {
  Field,
  cardGridClass,
  formTwoColClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
export function AboutIntroWordLimitHelp({
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

export function AdminAboutIntroEditor() {
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
        <div className={formTwoColClass}>
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
        </div>
        <div className={formTwoColClass}>
          <Field label="Green accent line">
            <input
              className={inputClass}
              value={form.heading_accent}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading_accent: e.target.value }))
              }
            />
          </Field>
          <Field label="Home tagline (homepage only, under paragraph 1)">
            <textarea
              className={`${inputClass} min-h-[88px]`}
              value={form.home_tagline}
              onChange={(e) =>
                setForm((f) => ({ ...f, home_tagline: e.target.value }))
              }
            />
          </Field>
        </div>
        <AboutIntroWordLimitHelp
          paragraph1={form.paragraph_1}
          paragraph2={form.paragraph_2}
        />
        <div className={formTwoColClass}>
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
        </div>
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

export function AdminAboutBlockEditor({
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
        <div className={formTwoColClass}>
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
          ) : (
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
          )}
        </div>
        {sectionKey === "our_place" ? (
          <Field label="Subheading (gold italic line)">
            <input
              className={inputClass}
              value={form.heading_accent}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading_accent: e.target.value }))
              }
            />
          </Field>
        ) : null}
        <div
          className={
            showImage
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
              : ""
          }
        >
          <Field label="Body paragraph">
            <textarea
              className={`${inputClass} min-h-[120px]`}
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

export function AdminAboutValuesEditor() {
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
            <div className={formTwoColClass}>
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
                        i.id === item.id
                          ? { ...i, title: e.target.value }
                          : i,
                      ),
                    )
                  }
                />
              </Field>
            </div>
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
