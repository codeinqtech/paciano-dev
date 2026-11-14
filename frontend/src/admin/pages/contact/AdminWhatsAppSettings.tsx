import { useCallback, useEffect, useState } from "react";
import { Save, Plus, MessageSquare } from "@/components/common/icons";

import {
  getWhatsAppSettings,
  createWhatsAppSetting,
  updateWhatsAppSetting,
  activateWhatsAppSetting,
  getWhatsAppEnquiries,
  type WhatsAppSetting,
  type WhatsAppSettingPayload,
  type WhatsAppEnquiry,
  type WhatsAppEnquiryResponse,
} from "../../../admin/services/whatsAppSettingsService";

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#51483F]";

const initialFormData: WhatsAppSettingPayload = {
  api_version: "v25.0",
  phone_number_id: "",
  business_account_id: "",
  access_token: "",
  recipient: "",
  template_name: "paciano_new_enquiry",
  template_language: "en",
};

export default function AdminWhatsAppSettings() {
  // Active tab
  const [activeTab, setActiveTab] = useState<"enquiries" | "settings">(
    "enquiries"
  );

  // WhatsApp settings states
  const [settings, setSettings] = useState<WhatsAppSetting[]>([]);
  const [formData, setFormData] =
    useState<WhatsAppSettingPayload>(initialFormData);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tokenConfigured, setTokenConfigured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  // General messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Enquiry states
  const [enquiries, setEnquiries] = useState<WhatsAppEnquiry[]>([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  const [enquirySearch, setEnquirySearch] = useState("");
  const [enquiryStatus, setEnquiryStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalEnquiries, setTotalEnquiries] = useState(0);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<WhatsAppEnquiry | null>(null);

  // Error message handler
  function getErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    const responseData = axiosError.response?.data;

    if (responseData?.errors) {
      const firstError = Object.values(responseData.errors)[0];

      if (firstError?.length) {
        return firstError[0];
      }
    }

    return responseData?.message || axiosError.message || fallback;
  }

  // Load WhatsApp configurations
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getWhatsAppSettings();
      setSettings(data);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to load WhatsApp settings.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load enquiries
  const loadEnquiries = useCallback(async () => {
    try {
      setEnquiryLoading(true);

      const response: WhatsAppEnquiryResponse =
        await getWhatsAppEnquiries({
          page: currentPage,
          search: enquirySearch,
          whatsapp_status: enquiryStatus,
        });

      setEnquiries(response.data);
      setLastPage(response.last_page);
      setTotalEnquiries(response.total);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to load enquiry messages.")
      );
    } finally {
      setEnquiryLoading(false);
    }
  }, [currentPage, enquirySearch, enquiryStatus]);

  // Initial data loading
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  // Form field handler
  const handleChange = (
    field: keyof WhatsAppSettingPayload,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  // Reset form
  const resetForm = () => {
    setSelectedId(null);
    setFormData(initialFormData);
    setTokenConfigured(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Edit configuration
  const handleEdit = (setting: WhatsAppSetting) => {
    setSelectedId(setting.id);

    setFormData({
      api_version: setting.api_version,
      phone_number_id: setting.phone_number_id ?? "",
      business_account_id: setting.business_account_id ?? "",
      access_token: "",
      recipient: setting.recipient ?? "",
      template_name: setting.template_name,
      template_language: setting.template_language,
    });

    setTokenConfigured(setting.access_token_configured);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Save or update configuration
  const handleSave = async (saveAsNew = false) => {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!formData.access_token.trim() && !tokenConfigured) {
        throw new Error("Please enter the WhatsApp Access Token.");
      }

      const payload: WhatsAppSettingPayload = {
        ...formData,
        access_token: formData.access_token.trim(),
      };

      if (saveAsNew || selectedId === null) {
        await createWhatsAppSetting({
          ...payload,
          is_active: false,
        });

        setSuccessMessage(
          "New WhatsApp configuration created successfully."
        );
      } else {
        await updateWhatsAppSetting(selectedId, payload);

        setSuccessMessage(
          "WhatsApp configuration updated successfully."
        );
      }

      resetForm();
      await loadSettings();
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to save WhatsApp configuration.")
      );
    } finally {
      setSaving(false);
    }
  };

  // Activate configuration
  const handleActivate = async (id: number) => {
    try {
      setActivatingId(id);
      setErrorMessage("");
      setSuccessMessage("");

      await activateWhatsAppSetting(id);

      setSuccessMessage(
        "WhatsApp configuration activated successfully."
      );

      await loadSettings();

      if (selectedId === id) {
        resetForm();
      }
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to activate configuration.")
      );
    } finally {
      setActivatingId(null);
    }
  };

  // Reusable input field
  const renderInput = (
    label: string,
    field: keyof WhatsAppSettingPayload,
    placeholder: string,
    type = "text",
    required = true
  ) => (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] space-y-7">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold admin-page-title">
          WhatsApp Management
        </h1>

        <p className="mt-2 text-sm text-[#82776B]">
          Manage website enquiries and WhatsApp notification settings.
        </p>
      </div>

      {/* Common WhatsApp Management Container */}
      <div className="overflow-hidden rounded-2xl border border-[#E8DFD0] bg-white">

        {/* Tabs Navigation */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#EDE4D8] bg-[#FAF7F2] px-3 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("enquiries")}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg border px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "enquiries"
                ? "border-[#E8DFD0] border-b-white bg-white text-[#3D4A22]"
                : "border-transparent text-[#6E655C] hover:bg-white/70 hover:text-[#332C26]"
            }`}
          >
            <MessageSquare size={16} />
            Enquiries
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg border px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "border-[#E8DFD0] border-b-white bg-white text-[#3D4A22]"
                : "border-transparent text-[#6E655C] hover:bg-white/70 hover:text-[#332C26]"
            }`}
          >
            <Save size={16} />
            Settings
          </button>
        </div>

        {/* General Messages */}
        {(errorMessage || successMessage) && (
          <div className="space-y-3 px-5 pt-5 md:px-8">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}
          </div>
        )}

        {/* ================================== */}
        {/* ENQUIRIES TAB */}
        {/* ================================== */}
        <div
          hidden={activeTab !== "enquiries"}
          className="bg-white p-5 md:p-8"
        >
          {/* Enquiry Heading */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Enquiry Messages
              </h2>

              <p className="mt-1 text-sm text-[#82776B]">
                View enquiries submitted through the website and their WhatsApp
                delivery status.
              </p>
            </div>

            <div className="rounded-lg bg-[#F7F3EB] px-4 py-2">
              <span className="text-sm text-[#82776B]">
                Total Enquiries:{" "}
                <strong className="text-[#332C26]">
                  {totalEnquiries}
                </strong>
              </span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={enquirySearch}
              onChange={(e) => {
                setEnquirySearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, phone or email..."
              className={inputClass}
            />

            <select
              value={enquiryStatus}
              onChange={(e) => {
                setEnquiryStatus(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
            >
              <option value="">All WhatsApp Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>

          {/* Enquiry Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E8DFD0]">
            {enquiryLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-[#82776B]">
                  Loading enquiry messages...
                </p>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#82776B]">
                No enquiry messages found.
              </div>
            ) : (
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F7F3EB]">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#82776B]">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">WhatsApp Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDE4D8]">
                  {enquiries.map((enquiry) => {
                    const status = (
                      enquiry.whatsapp_status ?? "pending"
                    ).toLowerCase();

                    return (
                      <tr key={enquiry.id} className="hover:bg-[#FCFAF6]">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#332C26]">
                            {enquiry.name}
                          </p>

                          <p className="mt-1 text-xs text-[#82776B]">
                            {enquiry.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#51483F]">
                          {enquiry.phone}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#82776B]">
                          {new Date(enquiry.created_at).toLocaleString()}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "failed"
                                ? "bg-red-100 text-red-700"
                                : status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(enquiry)}
                            className="rounded-lg border border-[#E0D5C8] px-3 py-2 text-xs font-semibold text-[#718A38] transition hover:bg-[#F7F3EB]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#82776B]">
              Page {currentPage} of {lastPage}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || enquiryLoading}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border border-[#E0D5C8] px-4 py-2 text-sm text-[#51483F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={currentPage >= lastPage || enquiryLoading}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border border-[#E0D5C8] px-4 py-2 text-sm text-[#51483F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ================================== */}
        {/* SETTINGS TAB */}
        {/* ================================== */}
        <div
          hidden={activeTab !== "settings"}
          className="bg-white p-5 md:p-8"
        >
          {/* Configuration Form */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-cormorant text-3xl text-[#332C26]">
                  {selectedId ? "Edit Configuration" : "New Configuration"}
                </h2>

                <p className="mt-1 text-sm text-[#82776B]">
                  Enter your Meta WhatsApp Cloud API credentials.
                </p>
              </div>

              {selectedId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#E0D5C8] px-4 py-2 text-sm font-medium text-[#51483F] hover:bg-[#F7F3EB]"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Configuration Fields */}
            <div className="grid gap-5 md:grid-cols-2">
              {renderInput("API Version", "api_version", "v25.0")}

              {renderInput(
                "Phone Number ID",
                "phone_number_id",
                "Enter Meta Phone Number ID"
              )}

              {renderInput(
                "Business Account ID",
                "business_account_id",
                "Enter WhatsApp Business Account ID",
                "text",
                false
              )}

              {renderInput(
                "Recipient WhatsApp Number",
                "recipient",
                "919876543215"
              )}

              {renderInput(
                "Template Name",
                "template_name",
                "paciano_new_enquiry"
              )}

              {renderInput("Template Language", "template_language", "en")}
            </div>

            {/* Access Token */}
            <div>
              <label className={labelClass}>
                Access Token <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                value={formData.access_token}
                onChange={(e) => handleChange("access_token", e.target.value)}
                placeholder={
                  tokenConfigured
                    ? "Leave blank to keep the existing token"
                    : "Enter Meta Access Token"
                }
                className={inputClass}
                autoComplete="new-password"
              />

              <p className="mt-2 text-xs text-[#82776B]">
                {tokenConfigured
                  ? "An access token is already saved securely. Enter a new token only if you want to replace it."
                  : "Your access token will be stored encrypted in the database and will not be displayed again."}
              </p>
            </div>

            {/* Save Buttons */}
            <div className="flex flex-wrap gap-3 border-t border-[#EDE4D8] pt-5">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8FAA42] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#718A38] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : selectedId
                    ? "Update Configuration"
                    : "Save Configuration"}
              </button>

              {selectedId !== null && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#8FAA42] px-6 py-3 text-sm font-semibold text-[#718A38] transition hover:bg-[#8FAA42]/5 disabled:opacity-60"
                >
                  <Plus size={17} />
                  Save as New Configuration
                </button>
              )}
            </div>
          </div>

          {/* Configuration History */}
          <div className="mt-12 border-t border-[#EDE4D8] pt-8">
            <div className="mb-6">
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Saved Configurations
              </h2>

              <p className="mt-1 text-sm text-[#82776B]">
                View, edit or activate a previously saved configuration.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-32 items-center justify-center">
                <p className="text-sm text-[#82776B]">
                  Loading configurations...
                </p>
              </div>
            ) : settings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D9CEBD] bg-[#F7F3EB] p-10 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-[#B4A88F]" />

                <p className="text-sm text-[#82776B]">
                  No WhatsApp configurations saved yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="rounded-xl border border-[#E8DFD0] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#332C26]">
                            {setting.template_name}
                          </h3>

                          {setting.is_active && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-[#82776B]">
                          Phone Number ID: {setting.phone_number_id}
                        </p>

                        <p className="text-sm text-[#82776B]">
                          Recipient: {setting.recipient}
                        </p>

                        <p className="text-xs text-[#A49A8E]">
                          API Version: {setting.api_version} | Language:{" "}
                          {setting.template_language}
                        </p>

                        <p className="text-xs text-[#718A38]">
                          {setting.access_token_configured
                            ? "Access token configured"
                            : "Access token not configured"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(setting)}
                          className="rounded-lg border border-[#E0D5C8] px-4 py-2 text-sm font-medium text-[#51483F] transition hover:bg-[#F7F3EB]"
                        >
                          Edit
                        </button>

                        {!setting.is_active && (
                          <button
                            type="button"
                            onClick={() => handleActivate(setting.id)}
                            disabled={activatingId === setting.id}
                            className="rounded-lg bg-[#8FAA42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#718A38] disabled:opacity-60"
                          >
                            {activatingId === setting.id
                              ? "Activating..."
                              : "Activate"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================== */}
      {/* ENQUIRY DETAILS MODAL */}
      {/* ================================== */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Enquiry Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-lg px-3 py-2 text-xl text-[#82776B] hover:bg-[#F7F3EB]"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className={labelClass}>Customer Name</p>
                <p className="text-sm text-[#332C26]">
                  {selectedEnquiry.name}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className={labelClass}>Phone</p>
                  <p className="text-sm text-[#332C26]">
                    {selectedEnquiry.phone}
                  </p>
                </div>

                <div>
                  <p className={labelClass}>Email</p>
                  <p className="break-all text-sm text-[#332C26]">
                    {selectedEnquiry.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <p className={labelClass}>Preferred Dates</p>
                <p className="text-sm text-[#332C26]">
                  {selectedEnquiry.preferred_dates || "Not provided"}
                </p>
              </div>

              <div>
                <p className={labelClass}>Enquiry Message</p>
                <div className="whitespace-pre-wrap rounded-lg bg-[#F7F3EB] p-4 text-sm leading-6 text-[#51483F]">
                  {selectedEnquiry.message}
                </div>
              </div>

              <div>
                <p className={labelClass}>WhatsApp Status</p>
                <p className="text-sm text-[#332C26]">
                  {selectedEnquiry.whatsapp_status || "Pending"}
                </p>
              </div>

              {selectedEnquiry.whatsapp_message_sid && (
                <div>
                  <p className={labelClass}>WhatsApp Message SID</p>
                  <p className="break-all text-sm text-[#332C26]">
                    {selectedEnquiry.whatsapp_message_sid}
                  </p>
                </div>
              )}

              {selectedEnquiry.whatsapp_error && (
                <div>
                  <p className={labelClass}>WhatsApp Error</p>
                  <div className="whitespace-pre-wrap rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {selectedEnquiry.whatsapp_error}
                  </div>
                </div>
              )}

              <div>
                <p className={labelClass}>Submitted At</p>
                <p className="text-sm text-[#332C26]">
                  {new Date(
                    selectedEnquiry.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end border-t border-[#EDE4D8] pt-5">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-xl bg-[#8FAA42] px-6 py-3 text-sm font-semibold text-white hover:bg-[#718A38]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
