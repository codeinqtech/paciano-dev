
import { useState } from "react";

import {
  Image,
  MessageSquare,
  FileText,
  Mail,
  Video,
  Phone,
  Upload,
  Save,
  Plus,
  AlertCircle,
} from "@/components/common/icons";

type TabId =
  | "banner"
  | "connect"
  | "subtitle"
  | "message"
  | "video"
  | "details";

const tabs = [
  { id: "banner", label: "Banner", icon: Image },
  { id: "connect", label: "Connect With Us", icon: MessageSquare },
  { id: "subtitle", label: "Subtitles", icon: FileText },
  { id: "message", label: "Message", icon: Mail },
  { id: "video", label: "Until We Meet", icon: Video },
  { id: "details", label: "Contact Details", icon: Phone },
] as const;

interface ContactFormData {
  banner_image: File | null;
  heading_one: string;
  heading_two: string;
  heading_highlight: string;
  connect_with_us: string;
  connect_with_us_supporting_text: string;
  connect_with_us_image_one: File | null;
  connect_with_us_image_two: File | null;
  subtitle_one: string;
  subtitle_two: string;
  send_us_message_text: string;
  until_we_meet_text: string;
  until_we_meet_video: File | null;
}

const initialFormData: ContactFormData = {
  banner_image: null,
  heading_one: "",
  heading_two: "",
  heading_highlight: "",
  connect_with_us: "",
  connect_with_us_supporting_text: "",
  connect_with_us_image_one: null,
  connect_with_us_image_two: null,
  subtitle_one: "",
  subtitle_two: "",
  send_us_message_text: "",
  until_we_meet_text: "",
  until_we_meet_video: null,
};

const inputClass = "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#51483F]";

const AdminContactUsSection = () => {
  const [activeTab, setActiveTab] = useState<TabId>("banner");
  
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleBannerImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Maximum file size allowed is 5 MB.");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      banner_image: file,
    }));

    setBannerPreview(URL.createObjectURL(file));
  };

  const [formData, setFormData] = useState<ContactFormData>(initialFormData);

  const handleChange = (
    field: keyof ContactFormData,
    value: string | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Contact Page Data:", formData);
  };

  const renderInput = (
    label: string,
    field: keyof ContactFormData,
    placeholder: string
  ) => (
    <div>
      <label className={labelClass}>{label}</label>

      <input
        type="text"
        value={formData[field] as string}
        onChange={(e) =>
          handleChange(field, e.target.value)
        }
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  const renderTextarea = (
    label: string,
    field: keyof ContactFormData,
    placeholder: string,
    rows = 4
  ) => (
    <div>
      <label className={labelClass}>{label}</label>

      <textarea
        value={formData[field] as string}
        onChange={(e) =>
          handleChange(field, e.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
    </div>
  );

  const renderFileUpload = (
    label: string,
    field: keyof ContactFormData,
    accept: string
  ) => (
    <div>
      <label className={labelClass}>Banner Image</label>

      <div className="rounded-2xl border border-[#E8DFD0] bg-white p-5 shadow-sm">

        {/* Image Preview */}
        <div className="relative overflow-hidden rounded-xl border border-[#E8DFD0] bg-[#FAF7F2]">

          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner Preview"
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center">
              <Image className="mb-3 h-12 w-12 text-[#C8BC82]" />

              <p className="text-sm font-medium text-[#51483F]">
                No banner image selected
              </p>

              <p className="mt-1 text-xs text-[#A49A8E]">
                Your banner preview will appear here
              </p>
            </div>
          )}
        </div>

        {/* Upload Information */}
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="min-w-0">
            {formData.banner_image ? (
              <>
                <p className="truncate text-sm font-semibold text-[#332C26]">
                  {formData.banner_image.name}
                </p>

                <p className="mt-1 text-xs text-[#8A8075]">
                  {(formData.banner_image.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#332C26]">
                  Upload banner image
                </p>

                <p className="mt-1 text-xs text-[#8A8075]">
                  Choose an image for your Contact Us banner.
                </p>
              </>
            )}
          </div>

          <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#8FAA42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#788F36]">
            <Upload className="h-4 w-4" />

            {formData.banner_image ? "Change Image" : "Choose Image"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Maximum File Size Note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#FAF7F2] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A58B45]" />

          <p className="text-xs leading-relaxed text-[#6E655C]">
            Maximum file size: <strong>5 MB</strong>.
            Please use a high-quality image for the best visual appearance.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "banner":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Banner & Heading
              </h2>
              <p className="mt-1 text-sm text-[#82776B]">
                Manage the main banner and heading content.
              </p>
            </div>

            {renderFileUpload(
              "Banner Image",
              "banner_image",
              "image/*"
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {renderInput(
                "Heading One",
                "heading_one",
                "Enter heading one"
              )}

              {renderInput(
                "Heading Two",
                "heading_two",
                "Enter heading two"
              )}
            </div>

            {renderInput(
              "Heading Highlight",
              "heading_highlight",
              "Enter highlighted text"
            )}
          </div>
        );

      case "connect":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Connect With Us
              </h2>
              <p className="mt-1 text-sm text-[#82776B]">
                Manage connection content and images.
              </p>
            </div>

            {renderTextarea(
              "Connect With Us",
              "connect_with_us",
              "Enter content..."
            )}

            {renderTextarea(
              "Supporting Text",
              "connect_with_us_supporting_text",
              "Enter supporting text...",
              5
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {renderFileUpload(
                "Image One",
                "connect_with_us_image_one",
                "image/*"
              )}

              {renderFileUpload(
                "Image Two",
                "connect_with_us_image_two",
                "image/*"
              )}
            </div>
          </div>
        );

      case "subtitle":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Subtitles
              </h2>
              <p className="mt-1 text-sm text-[#82776B]">
                Manage supporting subtitles.
              </p>
            </div>

            {renderTextarea(
              "Subtitle One",
              "subtitle_one",
              "Enter subtitle one..."
            )}

            {renderTextarea(
              "Subtitle Two",
              "subtitle_two",
              "Enter subtitle two..."
            )}
          </div>
        );

      case "message":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Send Us a Message
              </h2>
              <p className="mt-1 text-sm text-[#82776B]">
                Manage the message section content.
              </p>
            </div>

            {renderTextarea(
              "Send Us Message Text",
              "send_us_message_text",
              "Enter message content...",
              6
            )}
          </div>
        );

      case "video":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-cormorant text-3xl text-[#332C26]">
                Until We Meet
              </h2>
              <p className="mt-1 text-sm text-[#82776B]">
                Manage closing content and video.
              </p>
            </div>

            {renderTextarea(
              "Until We Meet Text",
              "until_we_meet_text",
              "Enter content...",
              5
            )}

            {renderFileUpload(
              "Until We Meet Video",
              "until_we_meet_video",
              "video/mp4,video/quicktime"
            )}
          </div>
        );

      case "details":
        return (
          <div className="space-y-5">
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#8FAA42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718A38]"
              >
                <Plus size={16} />
                Add New
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-[#D9CEBD] bg-[#F7F3EB] p-10 text-center">
              <Phone className="mx-auto mb-3 h-8 w-8 text-[#B4A88F]" />

              <p className="text-sm text-[#82776B]">
                No contact details loaded yet.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold admin-page-title">
                Contact Us
            </h1>

            <p className="mt-2 text-sm text-[#82776B]">
                Manage your contact page content and information.
            </p>
        </div>

        <span className="rounded-full border border-[#C8BC82]/50 bg-[#C8BC82]/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#817344]">
          Page Settings
        </span>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-[#E8DFD0] bg-white">

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#EDE4D8] bg-[#FAF7F2] px-3 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-t-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[#E8DFD0] border-b-white bg-white text-[#3D4A22]"
                    : "border-transparent text-[#6E655C] hover:bg-white/70 hover:text-[#332C26]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white p-5 md:p-8">
          {renderTabContent()}

          {/* Footer */}
          <div className="mt-9 flex justify-end border-t border-[#EDE4D8] pt-5">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#8FAA42] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#718A38]"
            >
              <Save size={17} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactUsSection;
