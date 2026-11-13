
import { useState, useEffect } from "react";
import { Phone, Plus } from "@/components/common/icons";

import ContactDetailsModal from "./ContactDetailsModal";

import {
  getContactDetails,
  createContactDetail,
  updateContactDetail,
  deleteContactDetail,
  type ContactDetail,
  type ContactDetailPayload,
} from "@/admin/services/contactPageService";

export default function ContactDetailsSection() {
  const [contactDetails, setContactDetails] = useState<ContactDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Load Contact Details
  const loadContactDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getContactDetails();

      setContactDetails(
        [...data].sort((a, b) => a.sort_order - b.sort_order)
      );
    } catch (err) {
      console.error("Failed to load contact details:", err);
      setError("Failed to load contact details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactDetails();
  }, []);

  // Open Add Modal
  const handleAdd = () => {
    setEditingDetail(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (detail: ContactDetail) => {
    setEditingDetail(detail);
    setIsModalOpen(true);
  };

  // Create / Update
  const handleSave = async (payload: ContactDetailPayload) => {
    if (editingDetail) {
      const updated = await updateContactDetail(
        editingDetail.id,
        payload
      );

      setContactDetails((prev) =>
        prev
          .map((item) =>
            item.id === editingDetail.id ? updated : item
          )
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    } else {
      const created = await createContactDetail(payload);

      setContactDetails((prev) =>
        [...prev, created].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );
    }
  };

  // Active / Inactive Toggle
  const handleToggleStatus = async (detail: ContactDetail) => {
    const newStatus = !Boolean(detail.is_active);

    try {
      setUpdatingId(detail.id);

      const payload: ContactDetailPayload = {
        type: detail.type,
        label: detail.label,
        value: detail.value,
        icon: detail.icon ?? "",
        sort_order: detail.sort_order,
        is_active: newStatus,
      };

      const updated = await updateContactDetail(detail.id, payload);

      setContactDetails((prev) =>
        prev.map((item) =>
          item.id === detail.id ? updated : item
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update contact status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Contact Detail
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact detail?"
    );

    if (!confirmed) return;

    try {
      await deleteContactDetail(id);

      setContactDetails((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete contact detail:", err);
      alert("Failed to delete contact detail.");
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cormorant text-3xl text-[#332C26]">
            Contact Details
          </h2>

          <p className="mt-1 text-sm text-[#82776B]">
            Manage phone, email and address information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button
            type="button"
            onClick={loadContactDetails}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-dashed border-[#D9CEBD] bg-[#F7F3EB] p-10 text-center">
          <p className="text-sm text-[#82776B]">
            Loading contact details...
          </p>
        </div>
      ) : contactDetails.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D9CEBD] bg-[#F7F3EB] p-10 text-center">
          <Phone className="mx-auto mb-3 h-8 w-8 text-[#B4A88F]" />

          <p className="text-sm text-[#82776B]">
            No contact details loaded yet.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 text-sm font-medium text-blue-600 hover:underline"
          >
            Add your first contact detail
          </button>
        </div>
      ) : (

        /* Contact Details List */
        <div className="space-y-3">
          {contactDetails.map((detail) => (
            <div
              key={detail.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#D9CEBD] bg-white p-5"
            >
              {/* Contact Information */}
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F3EB]">
                  <Phone className="h-5 w-5 text-[#B4A88F]" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-medium text-[#332C26]">
                    {detail.label}
                  </h3>

                  <p className="mt-1 break-words text-sm text-[#82776B]">
                    {detail.value}
                  </p>

                  <p className="mt-1 text-xs text-[#A49A8D]">
                    Type: {detail.type} | Icon: {detail.icon || "Not set"}
                  </p>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Active / Inactive Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#82776B]">
                    {Boolean(detail.is_active) ? "Active" : "Inactive"}
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(detail.is_active)}
                    disabled={updatingId === detail.id}
                    onClick={() => handleToggleStatus(detail)}
                    title={
                      Boolean(detail.is_active)
                        ? "Deactivate"
                        : "Activate"
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      Boolean(detail.is_active)
                        ? "bg-green-600"
                        : "bg-gray-300"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        Boolean(detail.is_active)
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Sort Order */}
                <span className="text-xs text-[#82776B]">
                  Order: {detail.sort_order}
                </span>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleEdit(detail)}
                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(detail.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ContactDetailsModal
          key={editingDetail?.id ?? "new"}
          initialData={editingDetail}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDetail(null);
          }}
          onSave={handleSave}
        />
      )}

    </div>
  );
}
