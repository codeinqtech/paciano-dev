import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api/client";
import type { AuthUser } from "../../context/AuthContext";
import { ASSIGNABLE_MENUS, ROLES, type MenuId } from "../data/permissions";

type UserForm = {
  id?: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: typeof ROLES.ADMIN | typeof ROLES.SUPERADMIN;
  permissions: MenuId[];
  active: boolean;
};

const emptyForm = (): UserForm => ({
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: ROLES.ADMIN,
  permissions: [],
  active: true,
});

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ data: AuthUser[] }>("/admin/users");
      setUsers(res.data);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load users");
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

  const openEdit = (user: AuthUser) => {
    setForm({
      id: user.id,
      name: user.name,
      username: user.username || "",
      email: user.email,
      phone: user.phone || "",
      password: "",
      role:
        user.role === ROLES.SUPERADMIN ? ROLES.SUPERADMIN : ROLES.ADMIN,
      permissions: (user.permissions || []).filter((p) =>
        ASSIGNABLE_MENUS.some((m) => m.id === p),
      ) as MenuId[],
      active: user.active,
    });
    setModalOpen(true);
  };

  const togglePermission = (id: MenuId) => {
    setForm((prev) => {
      const has = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== id)
          : [...prev.permissions, id],
      };
    });
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.username.trim()) {
      toast.error("Name, username and email are required");
      return;
    }
    if (!form.id && form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: form.role,
        active: form.active,
        permissions:
          form.role === ROLES.SUPERADMIN ? ["*"] : form.permissions,
      };
      if (form.password) {
        payload.password = form.password;
      }

      if (form.id) {
        await apiRequest(`/admin/users/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("User updated");
      } else {
        await apiRequest("/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("User created");
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

  const remove = async (user: AuthUser) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "DELETE" });
      toast.success("User deleted");
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
          <h1 className="text-2xl font-bold admin-page-title">Users</h1>
          <p className="text-sm admin-card-muted mt-1">
            Create admins and choose which menus each can access.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-5 py-2.5 text-sm font-semibold"
        >
          <UserPlus className="h-4 w-4" />
          New user
        </button>
      </div>

      <div className="admin-card overflow-hidden rounded-2xl">
        {loading ? (
          <p className="p-6 text-sm admin-card-muted">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wider text-[#8A8177]">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 hidden md:table-cell">Menus</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D8]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 font-medium text-[#332C26]">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-[#6E655C]">
                      {user.username || "—"}
                    </td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4 hidden md:table-cell text-[#6E655C]">
                      {user.role === ROLES.SUPERADMIN
                        ? "All"
                        : (user.permissions || []).join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {user.active ? (
                        <span className="text-[#5A6B32]">Active</span>
                      ) : (
                        <span className="text-[#8A8177]">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="rounded-lg p-2 text-[#6E655C] hover:bg-[#FAF7F2]"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(user)}
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

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/45 p-4">
          <div className="admin-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold admin-page-title mb-6">
              {form.id ? "Edit user" : "New user"}
            </h2>
            <div className="space-y-4">
              {(
                [
                  ["name", "Full name"],
                  ["username", "Username"],
                  ["email", "Email"],
                  ["phone", "Phone (optional)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-[#6E655C]">
                    {label}
                  </label>
                  <input
                    className="admin-input w-full rounded-xl px-4 py-2.5"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs text-[#6E655C]">
                  {form.id ? "New password (optional)" : "Password"}
                </label>
                <input
                  type="password"
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6E655C]">Role</label>
                <select
                  className="admin-input w-full rounded-xl px-4 py-2.5"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      role: e.target.value as UserForm["role"],
                    }))
                  }
                >
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.SUPERADMIN}>Super Admin</option>
                </select>
              </div>
              {form.role === ROLES.ADMIN ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-[#6E655C]">
                    Menu permissions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ASSIGNABLE_MENUS.map((menu) => {
                      const on = form.permissions.includes(menu.id);
                      return (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() => togglePermission(menu.id)}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            on
                              ? "border-[#8FAA42] bg-[#8FAA42]/15 text-[#3D4A22]"
                              : "border-[#E0D5C8] text-[#6E655C]"
                          }`}
                        >
                          {menu.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-[#332C26]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                Active
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
