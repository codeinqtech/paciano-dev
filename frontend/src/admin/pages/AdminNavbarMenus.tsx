import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api/client";
import { ListPagination } from "../components/ListPagination";
import { useClientPagination } from "../hooks/useClientPagination";
import {
  AdminCmsCardBody,
  AdminCmsPageCard,
  AdminCmsPageHeader,
  AdminCmsPageRoot,
} from "../components/AdminCmsPageLayout";

type MenuRow = {
  id: number;
  parent_id: number | null;
  label: string;
  url: string;
  sort_order: number;
  open_in_new_tab: boolean;
  is_active: boolean;
};

type FormState = {
  id?: number;
  parent_id: number | "";
  label: string;
  url: string;
  sort_order: number;
  open_in_new_tab: boolean;
};

const emptyForm = (): FormState => ({
  parent_id: "",
  label: "",
  url: "",
  sort_order: 0,
  open_in_new_tab: false,
});

export default function AdminNavbarMenus() {
  const [items, setItems] = useState<MenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const topLevelItems = useMemo(
    () => items.filter((i) => i.parent_id == null),
    [items],
  );

  const displayRows = useMemo(() => {
    const rows: (MenuRow & { depth: number })[] = [];
    const top = [...items]
      .filter((i) => i.parent_id == null)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

    for (const parent of top) {
      rows.push({ ...parent, depth: 0 });
      const kids = items
        .filter((i) => i.parent_id === parent.id)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
      for (const child of kids) {
        rows.push({ ...child, depth: 1 });
      }
    }
    return rows;
  }, [items]);

  const { paginatedItems: pagedItems, paginationProps: menuPagination } =
    useClientPagination(displayRows, { pageSize: 15 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ data: MenuRow[] }>(
        "/admin/navigation-menus",
      );
      setItems(res.data ?? []);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load menus");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = (parentId?: number) => {
    setForm({
      ...emptyForm(),
      parent_id: parentId ?? "",
    });
    setModalOpen(true);
  };

  const openEdit = (row: MenuRow) => {
    setForm({
      id: row.id,
      parent_id: row.parent_id ?? "",
      label: row.label,
      url: row.url,
      sort_order: row.sort_order,
      open_in_new_tab: row.open_in_new_tab,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.label.trim() || !form.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        url: form.url.trim(),
        sort_order: form.sort_order,
        open_in_new_tab: form.open_in_new_tab,
        parent_id: form.parent_id === "" ? null : form.parent_id,
      };
      if (form.id) {
        await apiRequest(`/admin/navigation-menus/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Menu updated");
      } else {
        await apiRequest("/admin/navigation-menus", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Menu added");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: MenuRow) => {
    if (!window.confirm(`Remove "${row.label}" from the navbar?`)) return;
    try {
      await apiRequest(`/admin/navigation-menus/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Menu removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <AdminCmsPageRoot>
      <AdminCmsPageHeader
        title="Navbar menus"
        subtitle="Top-level links appear in the header. Choose a parent to create a dropdown submenu (e.g. Corporate Events under Events)."
        actions={
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-5 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add menu
          </button>
        }
      />

      <AdminCmsPageCard>
        <AdminCmsCardBody className="p-0 md:p-0">
      <div className="overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm admin-card-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm admin-card-muted">
            No active menu items. Add one to populate the navbar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wider text-[#8A8177]">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Label</th>
                  <th className="px-6 py-3">URL</th>
                  <th className="px-6 py-3">Parent</th>
                  <th className="px-6 py-3">New tab</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D8]">
                {pagedItems.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 text-[#6E655C]">{row.sort_order}</td>
                    <td className="px-6 py-4 font-medium text-[#332C26]">
                      <span style={{ paddingLeft: row.depth * 20 }}>
                        {row.depth > 0 ? "↳ " : null}
                        {row.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6E655C] font-mono text-xs">
                      {row.url}
                    </td>
                    <td className="px-6 py-4 text-[#6E655C]">
                      {row.parent_id
                        ? items.find((i) => i.id === row.parent_id)?.label ??
                          row.parent_id
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#6E655C]">
                      {row.open_in_new_tab ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {row.depth === 0 ? (
                          <button
                            type="button"
                            onClick={() => openCreate(row.id)}
                            className="rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#5A6B32] hover:bg-[#FAF7F2]"
                          >
                            + Submenu
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-lg p-2 text-[#6E655C] hover:bg-[#FAF7F2]"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(row)}
                          className="rounded-lg p-2 text-red-700/80 hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && items.length > 0 ? (
          <ListPagination {...menuPagination} itemLabel="menu items" />
        ) : null}
      </div>

      <p className="border-t border-[#EDE4D8] px-5 py-4 text-xs admin-card-muted md:px-8">
        <span className="inline-flex items-center gap-1.5">
          <Menu className="h-3.5 w-3.5 shrink-0 text-[#8A8177]" />
          Example: parent <strong>Events</strong> → <code className="text-[#5A6B32]">/events</code>;
          submenus <code className="text-[#5A6B32]">/events/corporate-events</code>,{" "}
          <code className="text-[#5A6B32]">/events/weddings</code>. Only one submenu
          level is supported.
        </span>
      </p>
        </AdminCmsCardBody>
      </AdminCmsPageCard>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/45 p-4">
          <div className="admin-card w-full max-w-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold admin-page-title mb-6">
              {form.id ? "Edit menu" : "New menu"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-[#6E655C]">
                  Parent menu (optional)
                </label>
                <select
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  value={form.parent_id === "" ? "" : String(form.parent_id)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      parent_id: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">Top level (header)</option>
                  {topLevelItems.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.id === form.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6E655C]">
                  Label
                </label>
                <input
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  value={form.label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, label: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6E655C]">URL</label>
                <input
                  className="admin-input w-full rounded-xl px-4 py-2.5 font-mono text-sm"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="/events or /events/weddings"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6E655C]">
                  Sort order
                </label>
                <input
                  type="number"
                  min={0}
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#332C26]">
                <input
                  type="checkbox"
                  checked={form.open_in_new_tab}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      open_in_new_tab: e.target.checked,
                    }))
                  }
                />
                Open in new tab
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm text-[#6E655C]"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl admin-btn-gold px-5 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminCmsPageRoot>
  );
}