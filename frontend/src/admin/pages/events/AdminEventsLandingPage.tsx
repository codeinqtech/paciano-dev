import { useEffect, useMemo, useState } from "react";
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
  AdminListSearchBar,
  ListPagination,
} from "../../components/ListPagination";
import { useClientPagination } from "../../hooks/useClientPagination";
import {
  Field,
  TabbedPageShell,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
import type { EventsContentCms } from "@/hooks/useEventsContent";
import {
  AdminRowActions,
  EventsAdminFormModal,
} from "./eventsAdminCrudUi";

type AdvantageSlideRow = NonNullable<
  EventsContentCms["advantage_slides"]
>[number];
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

  const [slideAdd, setSlideAdd] = useState({ title: "", description: "" });
  const [slideAddFile, setSlideAddFile] = useState<File | null>(null);
  const [slideAddSaving, setSlideAddSaving] = useState(false);

  const [editSlide, setEditSlide] = useState<AdvantageSlideRow | null>(null);
  const [editSlideForm, setEditSlideForm] = useState({
    title: "",
    description: "",
    sort_order: "",
  });
  const [editSlideFile, setEditSlideFile] = useState<File | null>(null);
  const [editSlideSaving, setEditSlideSaving] = useState(false);
  const [slideDeleteBusyId, setSlideDeleteBusyId] = useState<number | null>(
    null,
  );

  const slides = cms?.advantage_slides ?? [];
  const sortedSlides = useMemo(
    () =>
      [...slides].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    [slides],
  );
  const {
    paginatedItems: pagedSlides,
    paginationProps: slidePagination,
    listSearch: slideListSearch,
  } = useClientPagination(sortedSlides, { pageSize: 10 });

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

  const addSlide = async () => {
    if (!slideAdd.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSlideAddSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", slideAdd.title.trim());
      fd.append("description", slideAdd.description.trim());
      if (slideAddFile) fd.append("image", slideAddFile);
      await apiUpload("/admin/events/landing/advantage-slides", fd);
      toast.success("Slide added");
      setSlideAdd({ title: "", description: "" });
      setSlideAddFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSlideAddSaving(false);
    }
  };

  const openEditSlide = (row: AdvantageSlideRow) => {
    setEditSlide(row);
    setEditSlideForm({
      title: row.title ?? "",
      description: row.description ?? "",
      sort_order: String(row.sort_order ?? ""),
    });
    setEditSlideFile(null);
  };

  const saveEditSlide = async () => {
    if (!editSlide) return;
    if (!editSlideForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setEditSlideSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", editSlideForm.title.trim());
      fd.append("description", editSlideForm.description.trim());
      if (editSlideForm.sort_order.trim() !== "") {
        fd.append("sort_order", editSlideForm.sort_order.trim());
      }
      if (editSlideFile) fd.append("image", editSlideFile);
      await apiUpload(
        `/admin/events/landing/advantage-slides/${editSlide.id}`,
        fd,
      );
      toast.success("Slide updated");
      setEditSlide(null);
      setEditSlideFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setEditSlideSaving(false);
    }
  };

  const removeSlide = async (row: AdvantageSlideRow) => {
    if (!window.confirm(`Remove slide “${row.title ?? "Untitled"}”?`)) return;
    setSlideDeleteBusyId(row.id);
    try {
      await apiRequest(`/admin/events/landing/advantage-slides/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Slide removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    } finally {
      setSlideDeleteBusyId(null);
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
        <div className="space-y-8">
          <p className="text-sm text-[#657067]">
            Carousel slide images and captions only — icon row above the carousel
            is not editable here.
          </p>
          <div className="admin-card max-w-2xl rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold admin-page-title">
              Add carousel slide
            </h3>
            <Field label="Title">
              <input
                className={inputClass}
                value={slideAdd.title}
                onChange={(e) =>
                  setSlideAdd((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={slideAdd.description}
                onChange={(e) =>
                  setSlideAdd((f) => ({ ...f, description: e.target.value }))
                }
              />
            </Field>
            <AdminImageUpload
              title="Slide image"
              file={slideAddFile}
              optional
              onFileChange={setSlideAddFile}
            />
            <button
              type="button"
              disabled={slideAddSaving}
              onClick={addSlide}
              className={saveCardButtonClass}
            >
              {slideAddSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Add slide
            </button>
          </div>

          <div className="admin-card overflow-hidden rounded-2xl">
            {sortedSlides.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">
                No slides yet. Add one above.
              </p>
            ) : (
              <>
                <AdminListSearchBar
                  {...slideListSearch}
                  placeholder="Search advantage slides…"
                />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Thumb</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedSlides.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#EDE4D8]/60 last:border-0"
                      >
                        <td className="px-4 py-3">
                          {row.image_url ? (
                            <img
                              src={row.image_url}
                              alt=""
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#332C26]">
                          {row.title?.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#565b59]">
                          {row.sort_order ?? 0}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <AdminRowActions
                            onEdit={() => openEditSlide(row)}
                            onDelete={() => removeSlide(row)}
                            deleteBusy={slideDeleteBusyId === row.id}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
            {sortedSlides.length > 0 ? (
              <ListPagination {...slidePagination} itemLabel="slides" />
            ) : null}
          </div>
        </div>
      ) : null}

      {editSlide ? (
        <EventsAdminFormModal
          title="Edit carousel slide"
          saving={editSlideSaving}
          onClose={() => {
            setEditSlide(null);
            setEditSlideFile(null);
          }}
          onSave={saveEditSlide}
        >
          <Field label="Title">
            <input
              className={inputClass}
              value={editSlideForm.title}
              onChange={(e) =>
                setEditSlideForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={editSlideForm.description}
              onChange={(e) =>
                setEditSlideForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          <Field label="Sort order (optional)">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={editSlideForm.sort_order}
              onChange={(e) =>
                setEditSlideForm((f) => ({ ...f, sort_order: e.target.value }))
              }
            />
          </Field>
          <AdminImageUpload
            title="Replace image (optional)"
            file={editSlideFile}
            existingUrl={editSlide.image_url}
            optional
            onFileChange={setEditSlideFile}
          />
        </EventsAdminFormModal>
      ) : null}
    </TabbedPageShell>
  );
}