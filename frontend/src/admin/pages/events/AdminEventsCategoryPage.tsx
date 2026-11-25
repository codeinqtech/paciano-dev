import { useEffect, useMemo, useState } from "react";
import {
  ImageIcon,
  LayoutList,
  Loader2,
  MapPin,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiRequest, apiUpload } from "../../../api/client";
import {
  AdminListSearchBar,
  ListPagination,
} from "../../components/ListPagination";
import { useClientPagination } from "../../hooks/useClientPagination";
import type {
  EventsExperienceItemCms,
  EventsVenueItemCms,
} from "@/hooks/useEventsContent";
import {
  Field,
  TabbedPageShell,
  formTwoColPairedRowClass,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";
import {
  AdminRowActions,
  EventsAdminFormModal,
  ExperienceIconSelect,
  ExperienceIconGlyph,
  EXPERIENCE_ICON_OPTIONS,
  experienceIconLabel,
} from "./eventsAdminCrudUi";
import {
  type CategoryPageForm,
  emptyCategoryPage,
  pageFormFromCms,
  useAdminEventsCms,
} from "./eventsAdminShared";

type CategoryTabId = "hero" | "experience" | "items" | "venues";

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

  const [expAdd, setExpAdd] = useState({
    title: "",
    description: "",
    icon_key: EXPERIENCE_ICON_OPTIONS[0]?.value ?? "presentation",
    show_on_landing: false,
  });
  const [expAddFile, setExpAddFile] = useState<File | null>(null);
  const [expAddSaving, setExpAddSaving] = useState(false);
  const [editExp, setEditExp] = useState<EventsExperienceItemCms | null>(null);
  const [editExpForm, setEditExpForm] = useState({
    title: "",
    description: "",
    icon_key: "presentation",
    show_on_landing: false,
    sort_order: "",
  });
  const [editExpFile, setEditExpFile] = useState<File | null>(null);
  const [editExpSaving, setEditExpSaving] = useState(false);
  const [expDeleteBusyId, setExpDeleteBusyId] = useState<number | null>(null);

  const [venueAdd, setVenueAdd] = useState({
    title: "",
    description: "",
    capacity: "",
    setup: "",
  });
  const [venueAddFile, setVenueAddFile] = useState<File | null>(null);
  const [venueAddSaving, setVenueAddSaving] = useState(false);
  const [editVenue, setEditVenue] = useState<EventsVenueItemCms | null>(null);
  const [editVenueForm, setEditVenueForm] = useState({
    title: "",
    description: "",
    capacity: "",
    setup: "",
    sort_order: "",
  });
  const [editVenueFile, setEditVenueFile] = useState<File | null>(null);
  const [editVenueSaving, setEditVenueSaving] = useState(false);
  const [venueDeleteBusyId, setVenueDeleteBusyId] = useState<number | null>(
    null,
  );

  const cat = cms?.categories?.[slug];
  const items = cat?.experience_items ?? [];
  const venues = cat?.venue_items ?? [];

  const sortedExp = useMemo(
    () => [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [items],
  );
  const {
    paginatedItems: pagedExp,
    paginationProps: expPagination,
    listSearch: expListSearch,
  } = useClientPagination(sortedExp, { pageSize: 10 });

  const sortedVenues = useMemo(
    () =>
      [...venues].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [venues],
  );
  const {
    paginatedItems: pagedVenues,
    paginationProps: venuePagination,
    listSearch: venueListSearch,
  } = useClientPagination(sortedVenues, { pageSize: 10 });

  useEffect(() => {
    if (!cms) return;
    setPage(pageFormFromCms(cms.categories?.[slug]));

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

  const appendBool = (fd: FormData, key: string, value: boolean) => {
    fd.append(key, value ? "1" : "0");
  };

  const addExperience = async () => {
    if (!expAdd.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!expAdd.icon_key) {
      toast.error("Choose an icon");
      return;
    }
    setExpAddSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", expAdd.title.trim());
      fd.append("description", expAdd.description.trim());
      fd.append("icon_key", expAdd.icon_key);
      appendBool(fd, "show_on_landing", expAdd.show_on_landing);
      if (expAddFile) fd.append("image", expAddFile);
      await apiUpload(`/admin/events/categories/${slug}/experience-items`, fd);
      toast.success("Experience item added");
      setExpAdd((f) => ({
        ...f,
        title: "",
        description: "",
        show_on_landing: false,
      }));
      setExpAddFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setExpAddSaving(false);
    }
  };

  const openEditExp = (row: EventsExperienceItemCms) => {
    setEditExp(row);
    setEditExpForm({
      title: row.title,
      description: row.description ?? "",
      icon_key: row.icon_key ?? "presentation",
      show_on_landing: row.show_on_landing,
      sort_order: String(row.sort_order ?? ""),
    });
    setEditExpFile(null);
  };

  const saveEditExp = async () => {
    if (!editExp) return;
    if (!editExpForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setEditExpSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", editExpForm.title.trim());
      fd.append("description", editExpForm.description.trim());
      fd.append("icon_key", editExpForm.icon_key);
      appendBool(fd, "show_on_landing", editExpForm.show_on_landing);
      if (editExpForm.sort_order.trim() !== "") {
        fd.append("sort_order", editExpForm.sort_order.trim());
      }
      if (editExpFile) fd.append("image", editExpFile);
      await apiUpload(
        `/admin/events/categories/${slug}/experience-items/${editExp.id}`,
        fd,
      );
      toast.success("Experience item updated");
      setEditExp(null);
      setEditExpFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setEditExpSaving(false);
    }
  };

  const removeExperience = async (row: EventsExperienceItemCms) => {
    if (!window.confirm(`Remove “${row.title}”?`)) return;
    setExpDeleteBusyId(row.id);
    try {
      await apiRequest(
        `/admin/events/categories/${slug}/experience-items/${row.id}`,
        { method: "DELETE" },
      );
      toast.success("Item removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    } finally {
      setExpDeleteBusyId(null);
    }
  };

  const addVenue = async () => {
    if (!venueAdd.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setVenueAddSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", venueAdd.title.trim());
      fd.append("description", venueAdd.description.trim());
      fd.append("capacity", venueAdd.capacity.trim());
      fd.append("setup", venueAdd.setup.trim());
      if (venueAddFile) fd.append("image", venueAddFile);
      await apiUpload(`/admin/events/categories/${slug}/venue-items`, fd);
      toast.success("Venue added");
      setVenueAdd({
        title: "",
        description: "",
        capacity: "",
        setup: "",
      });
      setVenueAddFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setVenueAddSaving(false);
    }
  };

  const openEditVenue = (row: EventsVenueItemCms) => {
    setEditVenue(row);
    setEditVenueForm({
      title: row.title,
      description: row.description ?? "",
      capacity: row.capacity ?? "",
      setup: row.setup ?? "",
      sort_order: String(row.sort_order ?? ""),
    });
    setEditVenueFile(null);
  };

  const saveEditVenue = async () => {
    if (!editVenue) return;
    if (!editVenueForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setEditVenueSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", editVenueForm.title.trim());
      fd.append("description", editVenueForm.description.trim());
      fd.append("capacity", editVenueForm.capacity.trim());
      fd.append("setup", editVenueForm.setup.trim());
      if (editVenueForm.sort_order.trim() !== "") {
        fd.append("sort_order", editVenueForm.sort_order.trim());
      }
      if (editVenueFile) fd.append("image", editVenueFile);
      await apiUpload(
        `/admin/events/categories/${slug}/venue-items/${editVenue.id}`,
        fd,
      );
      toast.success("Venue updated");
      setEditVenue(null);
      setEditVenueFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setEditVenueSaving(false);
    }
  };

  const removeVenue = async (row: EventsVenueItemCms) => {
    if (!window.confirm(`Remove venue “${row.title}”?`)) return;
    setVenueDeleteBusyId(row.id);
    try {
      await apiRequest(
        `/admin/events/categories/${slug}/venue-items/${row.id}`,
        { method: "DELETE" },
      );
      toast.success("Venue removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    } finally {
      setVenueDeleteBusyId(null);
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
      wide={tab === "items" || tab === "venues"}
      tabs={[
        { id: "hero", label: "Hero banner", icon: ImageIcon },
        { id: "experience", label: "THE PACIANO EXPERIENCE", icon: Sparkles },
        { id: "items", label: "Experience items", icon: LayoutList },
        { id: "venues", label: "Venue cards", icon: MapPin },
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
        <div className="space-y-8">
          <p className="text-sm text-[#657067]">
            Tick “Show on /events” for one item — its image appears on the main
            Events page under {landingSectionLabel}.
          </p>
          <div className="admin-card max-w-2xl rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold admin-page-title">
              Add experience item
            </h3>
            <Field label="Title">
              <input
                className={inputClass}
                value={expAdd.title}
                onChange={(e) =>
                  setExpAdd((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <ExperienceIconSelect
              value={expAdd.icon_key}
              onChange={(icon_key) => setExpAdd((f) => ({ ...f, icon_key }))}
            />
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={expAdd.description}
                onChange={(e) =>
                  setExpAdd((f) => ({ ...f, description: e.target.value }))
                }
              />
            </Field>
            <label className="mb-4 flex items-center gap-2 text-sm text-[#42483A]">
              <input
                type="checkbox"
                checked={expAdd.show_on_landing}
                onChange={(e) =>
                  setExpAdd((f) => ({
                    ...f,
                    show_on_landing: e.target.checked,
                  }))
                }
              />
              Show image on main /events ({landingSectionLabel})
            </label>
            <AdminImageUpload
              title="Feature image"
              file={expAddFile}
              optional
              onFileChange={setExpAddFile}
            />
            <button
              type="button"
              disabled={expAddSaving}
              onClick={addExperience}
              className={saveCardButtonClass}
            >
              {expAddSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Add item
            </button>
          </div>

          <div className="admin-card overflow-hidden rounded-2xl">
            {sortedExp.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">No items yet.</p>
            ) : (
              <>
                <AdminListSearchBar
                  {...expListSearch}
                  placeholder="Search experience items…"
                />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Thumb</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Icon</th>
                      <th className="px-4 py-3">On /events</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedExp.map((row) => (
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
                        <td className="px-4 py-3 text-[#332C26]">{row.title}</td>
                        <td className="px-4 py-3 text-[#565b59]">
                          <span className="inline-flex items-center gap-2">
                            {row.icon_key ? (
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#71803F]/20 bg-[#F5EEE1]/50 text-[#5F7138]"
                                aria-hidden
                              >
                                <ExperienceIconGlyph
                                  iconKey={row.icon_key}
                                  className="h-4 w-4"
                                />
                              </span>
                            ) : null}
                            {experienceIconLabel(row.icon_key)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#565b59]">
                          {row.show_on_landing ? "Yes" : "—"}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <AdminRowActions
                            onEdit={() => openEditExp(row)}
                            onDelete={() => removeExperience(row)}
                            deleteBusy={expDeleteBusyId === row.id}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
            {sortedExp.length > 0 ? (
              <ListPagination {...expPagination} itemLabel="items" />
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "venues" ? (
        <div className="space-y-8">
          <p className="text-sm text-[#657067]">
            Venue cards for {venuesSectionLabel}.
          </p>
          <div className="admin-card max-w-2xl rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold admin-page-title">
              Add venue card
            </h3>
            <Field label="Title">
              <input
                className={inputClass}
                value={venueAdd.title}
                onChange={(e) =>
                  setVenueAdd((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={venueAdd.description}
                onChange={(e) =>
                  setVenueAdd((f) => ({ ...f, description: e.target.value }))
                }
              />
            </Field>
            <div className={formTwoColPairedRowClass}>
              <Field label="Capacity label">
                <input
                  className={inputClass}
                  value={venueAdd.capacity}
                  onChange={(e) =>
                    setVenueAdd((f) => ({ ...f, capacity: e.target.value }))
                  }
                />
              </Field>
              <Field label="Setup label">
                <input
                  className={inputClass}
                  value={venueAdd.setup}
                  onChange={(e) =>
                    setVenueAdd((f) => ({ ...f, setup: e.target.value }))
                  }
                />
              </Field>
            </div>
            <AdminImageUpload
              title="Venue image"
              file={venueAddFile}
              optional
              onFileChange={setVenueAddFile}
            />
            <button
              type="button"
              disabled={venueAddSaving}
              onClick={addVenue}
              className={saveCardButtonClass}
            >
              {venueAddSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Add venue
            </button>
          </div>

          <div className="admin-card overflow-hidden rounded-2xl">
            {sortedVenues.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">No venues yet.</p>
            ) : (
              <>
                <AdminListSearchBar
                  {...venueListSearch}
                  placeholder="Search venue cards…"
                />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Thumb</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Capacity</th>
                      <th className="px-4 py-3">Setup</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedVenues.map((row) => (
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
                        <td className="px-4 py-3 text-[#332C26]">{row.title}</td>
                        <td className="px-4 py-3 text-[#565b59]">
                          {row.capacity?.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#565b59]">
                          {row.setup?.trim() || "—"}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <AdminRowActions
                            onEdit={() => openEditVenue(row)}
                            onDelete={() => removeVenue(row)}
                            deleteBusy={venueDeleteBusyId === row.id}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
            {sortedVenues.length > 0 ? (
              <ListPagination {...venuePagination} itemLabel="venues" />
            ) : null}
          </div>
        </div>
      ) : null}

      {editExp ? (
        <EventsAdminFormModal
          title="Edit experience item"
          saving={editExpSaving}
          onClose={() => {
            setEditExp(null);
            setEditExpFile(null);
          }}
          onSave={saveEditExp}
        >
          <Field label="Title">
            <input
              className={inputClass}
              value={editExpForm.title}
              onChange={(e) =>
                setEditExpForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </Field>
          <ExperienceIconSelect
            value={editExpForm.icon_key}
            onChange={(icon_key) =>
              setEditExpForm((f) => ({ ...f, icon_key }))
            }
          />
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={editExpForm.description}
              onChange={(e) =>
                setEditExpForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-[#42483A]">
            <input
              type="checkbox"
              checked={editExpForm.show_on_landing}
              onChange={(e) =>
                setEditExpForm((f) => ({
                  ...f,
                  show_on_landing: e.target.checked,
                }))
              }
            />
            Show image on main /events ({landingSectionLabel})
          </label>
          <Field label="Sort order (optional)">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={editExpForm.sort_order}
              onChange={(e) =>
                setEditExpForm((f) => ({ ...f, sort_order: e.target.value }))
              }
            />
          </Field>
          <AdminImageUpload
            title="Replace feature image (optional)"
            file={editExpFile}
            existingUrl={editExp.image_url}
            optional
            onFileChange={setEditExpFile}
          />
        </EventsAdminFormModal>
      ) : null}

      {editVenue ? (
        <EventsAdminFormModal
          title="Edit venue card"
          saving={editVenueSaving}
          onClose={() => {
            setEditVenue(null);
            setEditVenueFile(null);
          }}
          onSave={saveEditVenue}
        >
          <Field label="Title">
            <input
              className={inputClass}
              value={editVenueForm.title}
              onChange={(e) =>
                setEditVenueForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={editVenueForm.description}
              onChange={(e) =>
                setEditVenueForm((f) => ({
                  ...f,
                  description: e.target.value,
                }))
              }
            />
          </Field>
          <div className={formTwoColPairedRowClass}>
            <Field label="Capacity label">
              <input
                className={inputClass}
                value={editVenueForm.capacity}
                onChange={(e) =>
                  setEditVenueForm((f) => ({
                    ...f,
                    capacity: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Setup label">
              <input
                className={inputClass}
                value={editVenueForm.setup}
                onChange={(e) =>
                  setEditVenueForm((f) => ({ ...f, setup: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Sort order (optional)">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={editVenueForm.sort_order}
              onChange={(e) =>
                setEditVenueForm((f) => ({
                  ...f,
                  sort_order: e.target.value,
                }))
              }
            />
          </Field>
          <AdminImageUpload
            title="Replace venue image (optional)"
            file={editVenueFile}
            existingUrl={editVenue.image_url}
            optional
            onFileChange={setEditVenueFile}
          />
        </EventsAdminFormModal>
      ) : null}
    </TabbedPageShell>
  );
}