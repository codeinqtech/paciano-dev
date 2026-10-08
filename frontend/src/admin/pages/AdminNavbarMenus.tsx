import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api/client";

type MenuRow = {
  id: number;
  label: string;
  url: string;
  sort_order: number;
  open_in_new_tab: boolean;
  is_active: boolean;
};

type FormState = {
  id?: number;
  label: string;
  url: string;
  sort_order: number;
  open_in_new_tab: boolean;
};

const emptyForm = (): FormState => ({
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

  const openCreate = () => {
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row: MenuRow) => {
    setForm({
      id: row.id,
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
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-page-title">Navbar menus</h1>
          <p className="text-sm admin-card-muted mt-1">
            Add, edit, or remove links shown in the site header. Deleted items
            are hidden (is_active = 0).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-5 py-2.5 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add menu
        </button>
      </div>

      <div className="admin-card overflow-hidden rounded-2xl">
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
                  <th className="px-6 py-3">New tab</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D8]">
                {items.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 text-[#6E655C]">{row.sort_order}</td>
                    <td className="px-6 py-4 font-medium text-[#332C26]">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-[#6E655C] font-mono text-xs">
                      {row.url}
                    </td>
                    <td className="px-6 py-4 text-[#6E655C]">
                      {row.open_in_new_tab ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
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
      </div>

      <p className="mt-4 text-xs admin-card-muted max-w-2xl">
        URL examples: <code className="text-[#5A6B32]">/stay</code>,{" "}
        <code className="text-[#5A6B32]">/contact</code>, home sections{" "}
        <code className="text-[#5A6B32]">#dining</code>, or full{" "}
        <code className="text-[#5A6B32]">https://…</code>. Lower sort order
        appears first.
      </p>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/45 p-4">
          <div className="admin-card w-full max-w-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold admin-page-title mb-6">
              {form.id ? "Edit menu" : "New menu"}
            </h2>
            <div className="space-y-4">
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
                  placeholder="/stay or #about"
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
    </div>
  );
}
