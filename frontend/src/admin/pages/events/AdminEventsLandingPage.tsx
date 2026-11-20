import { useEffect, useState } from "react";
import {
  Building2,
  Heart,
  ImageIcon,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiUpload, apiRequest } from "../../../api/client";
import {
  Field,
  TabbedPageShell,
  cardGridTwoColClass,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
import {
  PreviewFields,
  type TypePreviewForm,
  useAdminEventsCms,
} from "./eventsAdminShared";

type LandingTabId = "hero" | "corporate-block" | "wedding-block" | "advantage";

export function AdminEventsLandingPage() {
  const { loading, cms, load } = useAdminEventsCms();
  const [tab, setTab] = useState<LandingTabId>("hero");

  const [landingForm, setLandingForm] = useState({
    hero_kicker: "",
    hero_title_main: "",
    hero_title_accent: "",
    hero_description: "",
  });
  const [heroBanner, setHeroBanner] = useState<File | null>(null);
  const [landingSaving, setLandingSaving] = useState(false);

  const [corporatePreview, setCorporatePreview] = useState<TypePreviewForm>({
    eyebrow: "",
    title_main: "",
    title_accent: "",
    description: "",
  });
  const [weddingPreview, setWeddingPreview] = useState<TypePreviewForm>({
    eyebrow: "",
    title_main: "",
    title_accent: "",
    description: "",
  });
  const [previewSaving, setPreviewSaving] = useState<string | null>(null);

  const [slides, setSlides] = useState(
    [] as NonNullable<typeof cms>["advantage_slides"],
  );
  const [slideFiles, setSlideFiles] = useState<Record<number, File | null>>({});
  const [slideSaving, setSlideSaving] = useState<number | null>(null);

  useEffect(() => {
    if (!cms) return;
    setLandingForm({
      hero_kicker: cms.landing?.hero_kicker ?? "",
      hero_title_main: cms.landing?.hero_title_main ?? "",
      hero_title_accent: cms.landing?.hero_title_accent ?? "",
      hero_description: cms.landing?.hero_description ?? "",
    });
    const corpP = cms.type_previews?.find((p) => p.slug === "corporate");
    const wedP = cms.type_previews?.find((p) => p.slug === "wedding");
    setCorporatePreview({
      eyebrow: corpP?.eyebrow ?? "",
      title_main: corpP?.title_main ?? "",
      title_accent: corpP?.title_accent ?? "",
      description: corpP?.description ?? "",
    });
    setWeddingPreview({
      eyebrow: wedP?.eyebrow ?? "",
      title_main: wedP?.title_main ?? "",
      title_accent: wedP?.title_accent ?? "",
      description: wedP?.description ?? "",
    });
    setSlides(cms.advantage_slides ?? []);
  }, [cms]);

  const saveLanding = async () => {
    setLandingSaving(true);
    try {
      const fd = new FormData();
      fd.append("hero_kicker", landingForm.hero_kicker);
      fd.append("hero_title_main", landingForm.hero_title_main);
      fd.append("hero_title_accent", landingForm.hero_title_accent);
      fd.append("hero_description", landingForm.hero_description);
      if (heroBanner) fd.append("hero_banner", heroBanner);
      await apiUpload("/admin/events/landing", fd);
      setHeroBanner(null);
      toast.success("Hero saved");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setLandingSaving(false);
    }
  };

  const saveTypePreview = async (slug: "corporate" | "wedding") => {
    setPreviewSaving(slug);
    const form = slug === "corporate" ? corporatePreview : weddingPreview;
    try {
      await apiRequest(`/admin/events/landing/previews/${slug}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Saved");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setPreviewSaving(null);
    }
  };

  const saveSlide = async (id: number) => {
    setSlideSaving(id);
    const slide = slides.find((s) => s.id === id);
    if (!slide) return;
    try {
      const fd = new FormData();
      fd.append("title", slide.title ?? "");
      fd.append("description", slide.description ?? "");
      fd.append("sort_order", String(slide.sort_order ?? 0));
      const file = slideFiles[id];
      if (file) fd.append("image", file);
      await apiUpload(`/admin/events/landing/advantage-slides/${id}`, fd);
      setSlideFiles((f) => ({ ...f, [id]: null }));
      toast.success("Slide saved");
      await load();
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
      pageTitle="Events page"
      subtitle="Main /events landing: hero, type previews, and advantage carousel."
      wide={tab === "advantage"}
      tabs={[
        { id: "hero", label: "Hero section", icon: Sparkles },
        { id: "corporate-block", label: "Corporate Events block", icon: Building2 },
        { id: "wedding-block", label: "Weddings block", icon: Heart },
        { id: "advantage", label: "THE PACIANO ADVANTAGE", icon: ImageIcon },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as LandingTabId)}
    >
      {tab === "hero" ? (
        <div>
          <AdminImageUpload
            title="Banner image"
            file={heroBanner}
            existingUrl={cms?.landing?.hero_banner_url}
            optional
            onFileChange={setHeroBanner}
          />
          <div className={`mt-4 ${formTwoColPairedRowClass}`}>
            <Field label="Kicker">
              <input
                className={inputClass}
                value={landingForm.hero_kicker}
                onChange={(e) =>
                  setLandingForm((f) => ({ ...f, hero_kicker: e.target.value }))
                }
              />
            </Field>
            <Field label="Title (main line)">
              <input
                className={inputClass}
                value={landingForm.hero_title_main}
                onChange={(e) =>
                  setLandingForm((f) => ({
                    ...f,
                    hero_title_main: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <Field label="Title (accent / italic line)">
            <input
              className={inputClass}
              value={landingForm.hero_title_accent}
              onChange={(e) =>
                setLandingForm((f) => ({
                  ...f,
                  hero_title_accent: e.target.value,
                }))
              }
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={landingForm.hero_description}
              onChange={(e) =>
                setLandingForm((f) => ({
                  ...f,
                  hero_description: e.target.value,
                }))
              }
            />
          </Field>
          <button
            type="button"
            disabled={landingSaving}
            onClick={saveLanding}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {landingSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save hero
          </button>
        </div>
      ) : null}

      {tab === "corporate-block" ? (
        <div>
          <p className="mb-4 text-sm text-[#657067]">
            Copy for the Corporate Events section on /events (feature chips stay
            fixed in the design).
          </p>
          <PreviewFields
            form={corporatePreview}
            onChange={setCorporatePreview}
          />
          <button
            type="button"
            disabled={previewSaving === "corporate"}
            onClick={() => saveTypePreview("corporate")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {previewSaving === "corporate" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      ) : null}

      {tab === "wedding-block" ? (
        <div>
          <p className="mb-4 text-sm text-[#657067]">
            Copy for the Weddings section on /events (feature chips stay fixed).
          </p>
          <PreviewFields form={weddingPreview} onChange={setWeddingPreview} />
          <button
            type="button"
            disabled={previewSaving === "wedding"}
            onClick={() => saveTypePreview("wedding")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {previewSaving === "wedding" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      ) : null}

      {tab === "advantage" ? (
        <div>
          <p className="mb-4 text-sm text-[#657067]">
            Carousel slide images and captions only — icon row above the carousel
            is not editable here.
          </p>
          <div className={cardGridTwoColClass}>
            {slides.map((slide) => (
              <div key={slide.id} className="admin-card rounded-2xl p-6">
                <Field label="Title">
                  <input
                    className={inputClass}
                    value={slide.title ?? ""}
                    onChange={(e) =>
                      setSlides((list) =>
                        list.map((s) =>
                          s.id === slide.id
                            ? { ...s, title: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className={`${inputClass} min-h-[72px]`}
                    value={slide.description ?? ""}
                    onChange={(e) =>
                      setSlides((list) =>
                        list.map((s) =>
                          s.id === slide.id
                            ? { ...s, description: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                </Field>
                <AdminImageUpload
                  title="Slide image"
                  file={slideFiles[slide.id] ?? null}
                  existingUrl={slide.image_url}
                  optional
                  onFileChange={(f) =>
                    setSlideFiles((x) => ({ ...x, [slide.id]: f }))
                  }
                />
                <button
                  type="button"
                  disabled={slideSaving === slide.id}
                  onClick={() => saveSlide(slide.id)}
                  className={saveCardButtonClass}
                >
                  {slideSaving === slide.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save slide
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </TabbedPageShell>
  );
}