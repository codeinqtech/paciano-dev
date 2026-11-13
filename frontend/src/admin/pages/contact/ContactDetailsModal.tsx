
import { useState, useEffect } from "react";

import type {
  ContactDetail,
  ContactDetailPayload,
} from "@/admin/services/contactPageService";

interface ContactDetailsModalProps {
  onClose: () => void;
  onSave: (payload: ContactDetailPayload) => Promise<void>;
  initialData?: ContactDetail | null;
}

export default function ContactDetailsModal({
  onClose,
  onSave,
  initialData = null,
}: ContactDetailsModalProps) {
  // Form State
  const [formData, setFormData] = useState<ContactDetailPayload>({
    type: "",
    label: "",
    value: "",
    icon: "",
    sort_order: 0,
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load Existing Data for Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type ?? "",
        label: initialData.label ?? "",
        value: initialData.value ?? "",
        icon: initialData.icon ?? "",
        sort_order: initialData.sort_order ?? 0,
        is_active: Boolean(initialData.is_active),
      });
    } else {
      // Reset Form for Add New
      setFormData({
        type: "",
        label: "",
        value: "",
        icon: "",
        sort_order: 0,
        is_active: true,
      });
    }

    setError("");
  }, [initialData]);

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "sort_order" ? Number(value) : value,
    }));
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.type.trim()) {
      setError("Please enter a contact type.");
      return;
    }

    if (!formData.label.trim()) {
      setError("Please enter a contact label.");
      return;
    }

    if (!formData.value.trim()) {
      setError("Please enter a contact value.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        ...formData,
        type: formData.type.trim(),
        label: formData.label.trim(),
        value: formData.value.trim(),
        icon: formData.icon.trim(),
      });

      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save contact detail. Please try again.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {initialData
                ? "Edit Contact Detail"
                : "Add Contact Detail"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {initialData
                ? "Update your existing contact information."
                : "Add new contact information to your Contact Us page."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-2xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Type <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g. phone, email, address"
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Label */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Label <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="e.g. Phone Number"
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Value */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Value <span className="text-red-500">*</span>
              </label>

              <textarea
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="Enter phone number, email or address"
                rows={3}
                required
                disabled={saving}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Icon Name
              </label>

              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g. Phone, Mail, MapPin"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Enter the icon name used by your frontend icon mapping.
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort Order
              </label>

              <input
                type="number"
                name="sort_order"
                min="0"
                value={formData.sort_order}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Lower numbers will appear first.
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Active Status
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Show this contact detail on the website.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={formData.is_active}
                disabled={saving}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: !prev.is_active,
                  }))
                }
                className={`relative h-6 w-11 rounded-full transition ${
                  formData.is_active
                    ? "bg-blue-600"
                    : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    formData.is_active
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : initialData
                  ? "Update Contact"
                  : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
