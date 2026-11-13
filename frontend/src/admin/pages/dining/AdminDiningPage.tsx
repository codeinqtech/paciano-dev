import { useCallback, useEffect, useState } from "react";
import { Images, Loader2, Save, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { ListPagination } from "../../components/ListPagination";
import { useClientPagination } from "../../hooks/useClientPagination";
import { apiRequest, apiUpload } from "../../../api/client";
import {
  Field,
  TabbedPageShell,
  cardGridClass,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
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
      <div className="flex w-full max-w-[1400px] items-center gap-2 py-6 text-sm text-[#657067]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <TabbedPageShell
      pageTitle="Dining at Paciano"
      subtitle="Edit the dining section headline on the home page and each carousel slide."
      wide={tab === "slides"}
      tabs={[
        { id: "home", label: "Home section", icon: UtensilsCrossed },
        { id: "slides", label: "Carousel slides", icon: Images },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as DiningTabId)}
    >
      {tab === "home" ? (
        <div>
          <div className={formTwoColPairedRowClass}>
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
              className={`${inputClass} min-h-[88px]`}
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
