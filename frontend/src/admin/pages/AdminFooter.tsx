import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api/client";

type TabId = "brand" | "map" | "social" | "mapRows";

type Settings = {
  id?: number;
  intro_paragraph: string | null;
  map_address: string | null;
  map_latitude: number | null;
  map_longitude: number | null;
  map_title: string | null;
  map_subtitle: string | null;
  map_description: string | null;
  location_eyebrow: string | null;
  location_heading: string | null;
  location_subtitle: string | null;
  location_description: string | null;
  maps_link: string | null;
};

type SocialRow = {
  id: number;
  platform: string;
  url: string;
  sort_order: number;
};

type LocationInfoRow = {
  id: number;
  info_label: string;
  info_value: string;
  info_icon: string;
  sort_order: number;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "brand", label: "Brand text" },
  { id: "map", label: "Map card" },
  { id: "social", label: "Social media" },
  { id: "mapRows", label: "Map info rows" },
];

const emptySettings = (): Settings => ({
  intro_paragraph: "",
  map_address: "",
  map_latitude: null,
  map_longitude: null,
  map_title: "",
  map_subtitle: "",
  map_description: "",
  location_eyebrow: "",
  location_heading: "",
  location_subtitle: "",
  location_description: "",
  maps_link: "",
});

export default function AdminFooter() {
  const [tab, setTab] = useState<TabId>("brand");
  const [settings, setSettings] = useState<Settings>(emptySettings());
  const [social, setSocial] = useState<SocialRow[]>([]);
  const [locationInfo, setLocationInfo] = useState<LocationInfoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [socialModal, setSocialModal] = useState(false);
  const [socialForm, setSocialForm] = useState<{
    id?: number;
    platform: string;
    url: string;
    sort_order: number;
  }>({ platform: "", url: "", sort_order: 0 });
  const [socialSaving, setSocialSaving] = useState(false);

  const [infoModal, setInfoModal] = useState(false);
  const [infoForm, setInfoForm] = useState<{
    id?: number;
    info_label: string;
    info_value: string;
    info_icon: string;
    sort_order: number;
  }>({
    info_label: "",
    info_value: "",
    info_icon: "car",
    sort_order: 0,
  });
  const [infoSaving, setInfoSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          settings: Settings | null;
          social: SocialRow[];
          location_info: LocationInfoRow[];
        };
      }>("/admin/site-footer");
      setSettings({ ...emptySettings(), ...res.data?.settings });
      setSocial(res.data?.social ?? []);
      setLocationInfo(res.data?.location_info ?? []);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Could not load footer");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await apiRequest<{ data: Settings }>(
        "/admin/site-footer/settings",
        {
          method: "PUT",
          body: JSON.stringify({
            intro_paragraph: settings.intro_paragraph?.trim() || null,
            map_address: settings.map_address?.trim() || null,
            map_latitude:
              settings.map_latitude == null
                ? null
                : Number(settings.map_latitude),
            map_longitude:
              settings.map_longitude == null
                ? null
                : Number(settings.map_longitude),
            map_title: settings.map_title?.trim() || null,
            map_subtitle: settings.map_subtitle?.trim() || null,
            map_description: settings.map_description?.trim() || null,
            maps_link: settings.maps_link?.trim() || null,
          }),
        },
      );
      setSettings({ ...emptySettings(), ...res.data });
      toast.success("Saved");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveSocial = async () => {
    if (!socialForm.platform.trim() || !socialForm.url.trim()) {
      toast.error("Platform and URL are required");
      return;
    }
    setSocialSaving(true);
    try {
      const payload = {
        platform: socialForm.platform.trim(),
        url: socialForm.url.trim(),
        sort_order: socialForm.sort_order,
      };
      if (socialForm.id) {
        await apiRequest(`/admin/site-footer/social/${socialForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Social link updated");
      } else {
        await apiRequest("/admin/site-footer/social", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Social link added");
      }
      setSocialModal(false);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setSocialSaving(false);
    }
  };

  const removeSocial = async (row: SocialRow) => {
    if (!window.confirm(`Remove ${row.platform} link?`)) return;
    try {
      await apiRequest(`/admin/site-footer/social/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Social link removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    }
  };

  const saveInfo = async () => {
    if (!infoForm.info_label.trim() || !infoForm.info_value.trim()) {
      toast.error("Place name and distance are required");
      return;
    }
    setInfoSaving(true);
    try {
      const payload = {
        info_label: infoForm.info_label.trim(),
        info_value: infoForm.info_value.trim(),
        info_icon: infoForm.info_icon.trim() || "car",
        sort_order: infoForm.sort_order,
      };
      if (infoForm.id) {
        await apiRequest(`/admin/site-footer/location-info/${infoForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Map row updated");
      } else {
        await apiRequest("/admin/site-footer/location-info", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Map row added");
      }
      setInfoModal(false);
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Save failed");
    } finally {
      setInfoSaving(false);
    }
  };

  const removeInfo = async (row: LocationInfoRow) => {
    if (!window.confirm(`Remove "${row.info_label}"?`)) return;
    try {
      await apiRequest(`/admin/site-footer/location-info/${row.id}`, {
        method: "DELETE",
      });
      toast.success("Map row removed");
      await load();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <p className="text-sm admin-card-muted p-6">Loading footer content…</p>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold admin-page-title">Footer content</h1>
        <p className="text-sm admin-card-muted mt-1">
          Map card appears on the home location section and on the contact page
          (free OpenStreetMap pin from coordinates or address).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#EDE4D8] pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#FAF7F2] text-[#3d4a22] border border-[#EDE4D8] border-b-[#FAF7F2] -mb-px"
                : "text-[#6E655C] hover:text-[#332C26]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "brand" ? (
        <section className="admin-card rounded-2xl rounded-tl-none p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#332C26]">
            Footer left paragraph
          </h2>
          <textarea
            className="admin-input w-full min-h-[140px] rounded-xl px-4 py-3 text-sm"
            value={settings.intro_paragraph ?? ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, intro_paragraph: e.target.value }))
            }
          />
          <SaveButton onClick={saveSettings} saving={savingSettings} />
        </section>
      ) : null}

      {tab === "map" ? (
        <section className="admin-card rounded-2xl rounded-tl-none p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#332C26]">
            Floating map card
          </h2>
          <p className="text-xs admin-card-muted">
            Set latitude/longitude for the pin, or leave coords empty and fill
            address — the site will try a free geocode lookup. Same card on home
            and contact.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Map title" className="sm:col-span-2">
              <input
                className="admin-input w-full rounded-xl px-4 py-2.5"
                value={settings.map_title ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, map_title: e.target.value }))
                }
                placeholder="Manabari, Oodlabari"
              />
            </Field>
            <Field label="Map subtitle" className="sm:col-span-2">
              <input
                className="admin-input w-full rounded-xl px-4 py-2.5"
                value={settings.map_subtitle ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, map_subtitle: e.target.value }))
                }
              />
            </Field>
            <Field label="Map short description" className="sm:col-span-2">
              <textarea
                className="admin-input w-full min-h-[88px] rounded-xl px-4 py-3 text-sm"
                value={settings.map_description ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    map_description: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Full address (pin label + geocode)" className="sm:col-span-2">
              <textarea
                className="admin-input w-full min-h-[80px] rounded-xl px-4 py-2.5 text-sm"
                value={settings.map_address ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, map_address: e.target.value }))
                }
              />
            </Field>
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                className="admin-input w-full rounded-xl px-4 py-2.5"
                value={settings.map_latitude ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    map_latitude: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                className="admin-input w-full rounded-xl px-4 py-2.5"
                value={settings.map_longitude ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    map_longitude: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
              />
            </Field>
            <Field label="View on Google Maps URL" className="sm:col-span-2">
              <input
                className="admin-input w-full rounded-xl px-4 py-2.5 font-mono text-xs"
                value={settings.maps_link ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, maps_link: e.target.value }))
                }
              />
            </Field>
          </div>
          <SaveButton onClick={saveSettings} saving={savingSettings} />
        </section>
      ) : null}

      {tab === "social" ? (
        <section className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSocialForm({ platform: "", url: "", sort_order: 0 });
                setSocialModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add link
            </button>
          </div>
          <div className="admin-card overflow-hidden rounded-2xl">
            <SocialTable
              rows={social}
              onEdit={(row) => {
                setSocialForm({ ...row });
                setSocialModal(true);
              }}
              onRemove={removeSocial}
            />
          </div>
        </section>
      ) : null}

      {tab === "mapRows" ? (
        <section className="space-y-4">
          <p className="text-xs admin-card-muted">
            Rows on the map card: <strong>Distance</strong> = bold value (e.g.{" "}
            <code className="text-[#5A6B32]">12 km</code>),{" "}
            <strong>Place</strong> = label (e.g. Gorumara National Park).
            Icons: car, train, plane.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setInfoForm({
                  info_label: "",
                  info_value: "",
                  info_icon: "car",
                  sort_order: 0,
                });
                setInfoModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl admin-btn-gold px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add row
            </button>
          </div>
          <div className="admin-card overflow-hidden rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wider text-[#8A8177]">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Distance</th>
                  <th className="px-6 py-3">Place</th>
                  <th className="px-6 py-3">Icon</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D8]">
                {locationInfo.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 text-[#6E655C]">{row.sort_order}</td>
                    <td className="px-6 py-4 font-medium text-[#332C26]">
                      {row.info_value}
                    </td>
                    <td className="px-6 py-4 text-[#6E655C]">{row.info_label}</td>
                    <td className="px-6 py-4 text-[#6E655C]">{row.info_icon}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInfoForm({ ...row });
                            setInfoModal(true);
                          }}
                          className="rounded-lg p-2 text-[#6E655C] hover:bg-[#FAF7F2]"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeInfo(row)}
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
        </section>
      ) : null}

      {socialModal ? (
        <Modal
          title={socialForm.id ? "Edit social link" : "New social link"}
          onClose={() => setSocialModal(false)}
          saving={socialSaving}
          onSave={saveSocial}
        >
          <Field label="Platform (instagram, facebook, …)">
            <input
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={socialForm.platform}
              onChange={(e) =>
                setSocialForm((f) => ({ ...f, platform: e.target.value }))
              }
            />
          </Field>
          <Field label="URL">
            <input
              className="admin-input w-full rounded-xl px-4 py-2.5 font-mono text-sm"
              value={socialForm.url}
              onChange={(e) =>
                setSocialForm((f) => ({ ...f, url: e.target.value }))
              }
            />
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              min={0}
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={socialForm.sort_order}
              onChange={(e) =>
                setSocialForm((f) => ({
                  ...f,
                  sort_order: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </Field>
        </Modal>
      ) : null}

      {infoModal ? (
        <Modal
          title={infoForm.id ? "Edit map row" : "New map row"}
          onClose={() => setInfoModal(false)}
          saving={infoSaving}
          onSave={saveInfo}
        >
          <Field label="Distance (shown bold, e.g. 12 km)">
            <input
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={infoForm.info_value}
              onChange={(e) =>
                setInfoForm((f) => ({ ...f, info_value: e.target.value }))
              }
            />
          </Field>
          <Field label="Place name">
            <input
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={infoForm.info_label}
              onChange={(e) =>
                setInfoForm((f) => ({ ...f, info_label: e.target.value }))
              }
            />
          </Field>
          <Field label="Icon">
            <select
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={infoForm.info_icon}
              onChange={(e) =>
                setInfoForm((f) => ({ ...f, info_icon: e.target.value }))
              }
            >
              <option value="car">car</option>
              <option value="train">train</option>
              <option value="plane">plane</option>
            </select>
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              min={0}
              className="admin-input w-full rounded-xl px-4 py-2.5"
              value={infoForm.sort_order}
              onChange={(e) =>
                setInfoForm((f) => ({
                  ...f,
                  sort_order: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </Field>
        </Modal>
      ) : null}
    </div>
  );
}

function SaveButton({
  onClick,
  saving,
}: {
  onClick: () => void;
  saving: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="rounded-xl admin-btn-gold px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
    >
      {saving ? "Saving…" : "Save"}
    </button>
  );
}

function SocialTable({
  rows,
  onEdit,
  onRemove,
}: {
  rows: SocialRow[];
  onEdit: (row: SocialRow) => void;
  onRemove: (row: SocialRow) => void;
}) {
  return (
    <table className="min-w-full text-sm">
      <thead className="border-b border-[#EDE4D8] bg-[#FAF7F2]/80 text-left text-xs uppercase tracking-wider text-[#8A8177]">
        <tr>
          <th className="px-6 py-3">Order</th>
          <th className="px-6 py-3">Platform</th>
          <th className="px-6 py-3">URL</th>
          <th className="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#EDE4D8]">
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="px-6 py-4 text-[#6E655C]">{row.sort_order}</td>
            <td className="px-6 py-4 font-medium capitalize text-[#332C26]">
              {row.platform}
            </td>
            <td className="px-6 py-4 font-mono text-xs text-[#6E655C]">
              {row.url}
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="rounded-lg p-2 text-[#6E655C] hover:bg-[#FAF7F2]"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(row)}
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
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs text-[#6E655C]">{label}</label>
      {children}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  onSave,
  saving,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/45 p-4">
      <div className="admin-card w-full max-w-lg rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold admin-page-title mb-6">{title}</h2>
        <div className="space-y-4">{children}</div>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm text-[#6E655C]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl admin-btn-gold px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
