import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ImagePlus,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import { apiRequest, apiUpload } from "../../../api/client";
import type { GalleryContentCms } from "@/hooks/useGalleryContent";
import {
  AdminListSearchBar,
  ListPagination,
} from "../../components/ListPagination";
import { useClientPagination } from "../../hooks/useClientPagination";
import {
  Field,
  TabbedPageShell,
  inputClass,
  saveCardButtonClass,
} from "../../components/AdminSectionLayout";

type GalleryItemRow = GalleryContentCms["items"][number];
type GalleryCategoryRow = GalleryContentCms["categories"][number];

type TabId = "hero" | "categories" | "upload" | "list";

export function AdminGalleryPage() {
  const [tab, setTab] = useState<TabId>("hero");
  const [loading, setLoading] = useState(true);
  const [cms, setCms] = useState<GalleryContentCms | null>(null);

  const [pageForm, setPageForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    all_moments_label: "",
  });
  const [heroBanner, setHeroBanner] = useState<File | null>(null);
  const [closingImage, setClosingImage] = useState<File | null>(null);
  const [pageSaving, setPageSaving] = useState(false);

  const [categories, setCategories] = useState<
    GalleryContentCms["categories"]
  >([]);
  const [categoryModal, setCategoryModal] = useState<"create" | number | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState({
    label: "",
    icon_prefix: "",
    sort_order: "",
  });
  const [categoryModalSaving, setCategoryModalSaving] = useState(false);
  const [categoryDeleteBusyId, setCategoryDeleteBusyId] = useState<
    number | null
  >(null);

  const [items, setItems] = useState<GalleryContentCms["items"]>([]);

  const [uploadCategoryId, setUploadCategoryId] = useState<number | "">("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [editItem, setEditItem] = useState<GalleryItemRow | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    alt_text: "",
    gallery_category_id: 0,
  });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState<number | null>(null);

  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }, [categories]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const labelA = a.category_label ?? "";
      const labelB = b.category_label ?? "";
      if (labelA !== labelB) return labelA.localeCompare(labelB);
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  }, [items]);

  const { paginatedItems, paginationProps, listSearch } = useClientPagination(
    sortedItems,
    {
      pageSize: 10,
    },
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ data: GalleryContentCms | null }>(
        "/admin/gallery",
      );
      if (!res.data) return;
      setCms(res.data);
      setPageForm({
        hero_title: res.data.page?.hero_title ?? "",
        hero_subtitle: res.data.page?.hero_subtitle ?? "",
        all_moments_label: res.data.page?.all_moments_label ?? "",
      });
      const cats = res.data.categories ?? [];
      setCategories(cats);
      setItems(res.data.items ?? []);
      if (uploadCategoryId === "" && cats[0]) {
        setUploadCategoryId(cats[0].id);
      }
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savePage = async () => {
    setPageSaving(true);
    try {
      const fd = new FormData();
      Object.entries(pageForm).forEach(([k, v]) => fd.append(k, v));
      if (heroBanner) fd.append("hero_banner", heroBanner);
      if (closingImage) fd.append("closing_image", closingImage);
      await apiUpload("/admin/gallery/page", fd);
      setHeroBanner(null);
      setClosingImage(null);
      toast.success("Gallery page saved");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setPageSaving(false);
    }
  };

  const openCategoryCreate = () => {
    setCategoryForm({ label: "", icon_prefix: "", sort_order: "" });
    setCategoryModal("create");
  };

  const openCategoryEdit = (row: GalleryCategoryRow) => {
    setCategoryForm({
      label: row.label,
      icon_prefix: row.icon_prefix ?? "",
      sort_order: String(row.sort_order ?? ""),
    });
    setCategoryModal(row.id);
  };

  const saveCategoryModal = async () => {
    if (!categoryForm.label.trim()) {
      toast.error("Button label is required");
      return;
    }
    setCategoryModalSaving(true);
    try {
      const payload: {
        label: string;
        icon_prefix?: string;
        sort_order?: number;
      } = {
        label: categoryForm.label.trim(),
        icon_prefix: categoryForm.icon_prefix.trim(),
      };
      if (categoryForm.sort_order.trim() !== "") {
        payload.sort_order = Number(categoryForm.sort_order);
      }
      if (categoryModal === "create") {
        await apiRequest("/admin/gallery/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Category added");
      } else if (typeof categoryModal === "number") {
        await apiRequest(`/admin/gallery/categories/${categoryModal}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Category updated");
      }
      setCategoryModal(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setCategoryModalSaving(false);
    }
  };

  const removeCategory = async (row: GalleryCategoryRow) => {
    if (
      !window.confirm(
        `Remove filter “${row.label}”? Images in this category stay saved but the filter button will be hidden.`,
      )
    ) {
      return;
    }
    setCategoryDeleteBusyId(row.id);
    try {
      await apiRequest(`/admin/gallery/categories/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Category removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    } finally {
      setCategoryDeleteBusyId(null);
    }
  };

  const uploadOne = async () => {
    if (uploadCategoryId === "") {
      toast.error("Select a category");
      return;
    }
    if (!uploadTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!uploadFile) {
      toast.error("Choose an image to upload");
      return;
    }
    setUploadSaving(true);
    try {
      const fd = new FormData();
      fd.append("gallery_category_id", String(uploadCategoryId));
      fd.append("title", uploadTitle.trim());
      fd.append("alt_text", uploadAltText.trim());
      fd.append("image", uploadFile);
      await apiUpload("/admin/gallery/items", fd);
      toast.success("Image added");
      setUploadTitle("");
      setUploadAltText("");
      setUploadFile(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadSaving(false);
    }
  };

  const openEdit = (row: GalleryItemRow) => {
    setEditItem(row);
    setEditForm({
      title: row.title ?? "",
      alt_text: row.alt_text ?? "",
      gallery_category_id: row.category_id,
    });
    setEditImage(null);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setEditSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", editForm.title);
      fd.append("alt_text", editForm.alt_text);
      fd.append("gallery_category_id", String(editForm.gallery_category_id));
      if (editImage) fd.append("image", editImage);
      await apiUpload(`/admin/gallery/items/${editItem.id}`, fd);
      toast.success("Image updated");
      setEditItem(null);
      setEditImage(null);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setEditSaving(false);
    }
  };

  const removeItem = async (row: GalleryItemRow) => {
    if (!window.confirm(`Remove this gallery image${row.title ? `: ${row.title}` : ""}?`)) {
      return;
    }
    setDeleteBusyId(row.id);
    try {
      await apiRequest(`/admin/gallery/items/${row.id}`, { method: "DELETE" });
      toast.success("Image removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleteBusyId(null);
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
      pageTitle="Gallery"
      subtitle="Hero banner, filter labels, and moment images for /gallery."
      wide={tab !== "hero"}
      tabs={[
        { id: "hero", label: "Hero & closing", icon: Sparkles },
        { id: "categories", label: "Filter buttons", icon: LayoutGrid },
        { id: "upload", label: "Add image", icon: ImagePlus },
        { id: "list", label: "Image list", icon: List },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as TabId)}
    >
      {tab === "hero" ? (
        <div className="space-y-8">
          <AdminImageUpload
            title="Hero banner"
            file={heroBanner}
            existingUrl={cms?.page?.hero_banner_url}
            optional
            onFileChange={setHeroBanner}
          />
          <div>
            <Field label="All Moments button label">
              <input
                className={inputClass}
                value={pageForm.all_moments_label}
                onChange={(e) =>
                  setPageForm((f) => ({
                    ...f,
                    all_moments_label: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Main heading">
              <input
                className={inputClass}
                value={pageForm.hero_title}
                onChange={(e) =>
                  setPageForm((f) => ({ ...f, hero_title: e.target.value }))
                }
              />
            </Field>
            <Field label="Subtitle">
              <textarea
                className={`${inputClass} min-h-[88px]`}
                value={pageForm.hero_subtitle}
                onChange={(e) =>
                  setPageForm((f) => ({ ...f, hero_subtitle: e.target.value }))
                }
              />
            </Field>
          </div>
          <AdminImageUpload
            title="Closing landscape (bottom of gallery)"
            file={closingImage}
            existingUrl={cms?.page?.closing_image_url}
            optional
            onFileChange={setClosingImage}
          />
          <button
            type="button"
            disabled={pageSaving}
            onClick={savePage}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5F7138] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {pageSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save page
          </button>
        </div>
      ) : null}

      {tab === "categories" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCategoryCreate}
              className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add category
            </button>
          </div>
          <div className="admin-card overflow-hidden rounded-2xl">
            {sortedCategories.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">
                No filter categories yet. Add one to show a new gallery filter
                button.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Icon</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategories.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#EDE4D8]/60 last:border-0"
                      >
                        <td className="px-4 py-3 font-medium text-[#332C26]">
                          {row.icon_prefix ? (
                            <span className="mr-2 text-[#657067]">
                              {row.icon_prefix}
                            </span>
                          ) : null}
                          {row.label}
                        </td>
                        <td className="px-4 py-3 text-[#565b59]">
                          {row.icon_prefix?.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#565b59]">
                          {row.sort_order}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#657067]">
                          {row.slug}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openCategoryEdit(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#3d4a22] hover:bg-[#FAF7F2]"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={categoryDeleteBusyId === row.id}
                            onClick={() => removeCategory(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {categoryDeleteBusyId === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {categoryModal !== null ? (
        <GalleryItemFormModal
          title={
            categoryModal === "create" ? "Add filter category" : "Edit category"
          }
          saving={categoryModalSaving}
          onClose={() => setCategoryModal(null)}
          onSave={saveCategoryModal}
          saveLabel={categoryModal === "create" ? "Add category" : "Save"}
        >
          <Field label="Button label">
            <input
              className={inputClass}
              value={categoryForm.label}
              onChange={(e) =>
                setCategoryForm((f) => ({ ...f, label: e.target.value }))
              }
              required
            />
          </Field>
          <Field label="Icon prefix (optional character before label)">
            <input
              className={inputClass}
              value={categoryForm.icon_prefix}
              placeholder="⌂"
              onChange={(e) =>
                setCategoryForm((f) => ({ ...f, icon_prefix: e.target.value }))
              }
            />
          </Field>
          <Field label="Sort order (optional)">
            <input
              className={inputClass}
              type="number"
              min={0}
              placeholder="Auto if empty"
              value={categoryForm.sort_order}
              onChange={(e) =>
                setCategoryForm((f) => ({ ...f, sort_order: e.target.value }))
              }
            />
          </Field>
          {typeof categoryModal === "number" ? (
            <p className="text-xs admin-card-muted">
              Slug:{" "}
              {categories.find((c) => c.id === categoryModal)?.slug ?? "—"} (not
              editable)
            </p>
          ) : null}
        </GalleryItemFormModal>
      ) : null}

      {tab === "upload" ? (
        <div className="admin-card max-w-2xl rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold admin-page-title">
              Add gallery image
            </h3>
            <p className="mb-5 text-sm admin-card-muted">
              One image per save — category, title, and file (JPEG, PNG, or WebP,
              max 5 MB). Add more by filling the form again.
            </p>
            <Field label="Category">
              <select
                className={inputClass}
                value={uploadCategoryId}
                onChange={(e) =>
                  setUploadCategoryId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                {categories.length === 0 ? (
                  <option value="">No categories</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                )}
              </select>
            </Field>
            <Field label="Title (hover caption)">
              <input
                className={inputClass}
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
              />
            </Field>
            <Field label="Alt text">
              <input
                className={inputClass}
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
              />
            </Field>
            <AdminImageUpload
              title="Image"
              file={uploadFile}
              required
              onFileChange={setUploadFile}
            />
            <button
              type="button"
              disabled={uploadSaving}
              onClick={uploadOne}
              className={saveCardButtonClass}
            >
              {uploadSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Add image
            </button>
        </div>
      ) : null}

      {tab === "list" ? (
        <div className="admin-card overflow-hidden rounded-2xl">
            {sortedItems.length === 0 ? (
              <p className="p-6 text-sm admin-card-muted">
                No gallery images yet. Use the Add image tab to upload.
              </p>
            ) : (
              <>
                <AdminListSearchBar
                  {...listSearch}
                  placeholder="Search gallery images…"
                />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wide text-[#6E655C]">
                    <tr>
                      <th className="px-4 py-3">Thumb</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((row) => (
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
                          {row.category_label ?? row.category_slug ?? "—"}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#3d4a22] hover:bg-[#FAF7F2]"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deleteBusyId === row.id}
                            onClick={() => removeItem(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleteBusyId === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
            {sortedItems.length > 0 ? (
              <ListPagination {...paginationProps} itemLabel="images" />
            ) : null}
        </div>
      ) : null}

      {editItem ? (
        <GalleryItemFormModal
          title="Edit gallery image"
          saving={editSaving}
          onClose={() => {
            setEditItem(null);
            setEditImage(null);
          }}
          onSave={saveEdit}
        >
          <Field label="Category">
            <select
              className={inputClass}
              value={editForm.gallery_category_id}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  gallery_category_id: Number(e.target.value),
                }))
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title (hover caption, optional)">
            <input
              className={inputClass}
              value={editForm.title}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </Field>
          <Field label="Alt text">
            <input
              className={inputClass}
              value={editForm.alt_text}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, alt_text: e.target.value }))
              }
            />
          </Field>
          <AdminImageUpload
            title="Replace image (optional)"
            file={editImage}
            existingUrl={editItem.image_url}
            optional
            onFileChange={setEditImage}
          />
        </GalleryItemFormModal>
      ) : null}
    </TabbedPageShell>
  );
}

function GalleryItemFormModal({
  title,
  children,
  onClose,
  onSave,
  saving,
  saveLabel = "Save",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="admin-card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold admin-page-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6E655C] hover:bg-[#EDE4D8]/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5">{children}</div>
        <div className="mt-8 flex justify-end gap-3 border-t border-[#EDE4D8] pt-6">
          <button
            type="button"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6E655C] hover:bg-[#FAF7F2]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl admin-btn-gold px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}