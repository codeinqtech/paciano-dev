import { useEffect, useRef, useState } from "react";

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

import {
  getContactPage,
  updateContactPage,
  getContactDetails,
  createContactDetail,
  updateContactDetail,
  deleteContactDetail,
  type ContactPageData,
  type ContactDetail,
  type ContactDetailPayload,
} from "@/admin/services/contactPageService";

type TabId =
  | "banner"
  | "connect"
  | "subtitle"
  | "message"
  | "video"
  | "details";

type MediaField =
  | "banner_image"
  | "connect_with_us_image_one"
  | "connect_with_us_image_two"
  | "until_we_meet_video";

type TextField = Exclude<keyof ContactFormData, MediaField>;

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

type MediaUrls = Record<MediaField, string | null>;

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

const initialMediaUrls: MediaUrls = {
  banner_image: null,
  connect_with_us_image_one: null,
  connect_with_us_image_two: null,
  until_we_meet_video: null,
};

const textFields: TextField[] = [
  "heading_one",
  "heading_two",
  "heading_highlight",
  "connect_with_us",
  "connect_with_us_supporting_text",
  "subtitle_one",
  "subtitle_two",
  "send_us_message_text",
  "until_we_meet_text",
];

const imageFields: MediaField[] = [
  "banner_image",
  "connect_with_us_image_one",
  "connect_with_us_image_two",
];

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#51483F]";

const tabs = [
  { id: "banner", label: "Banner", icon: Image },
  { id: "connect", label: "Connect With Us", icon: MessageSquare },
  { id: "subtitle", label: "Subtitles", icon: FileText },
  { id: "message", label: "Message", icon: Mail },
  { id: "video", label: "Until We Meet", icon: Video },
  { id: "details", label: "Contact Details", icon: Phone },
] as const;

const AdminContactUsSection = () => {
  const [activeTab, setActiveTab] = useState<TabId>("banner");

  const [formData, setFormData] =
    useState<ContactFormData>(initialFormData);

  const [mediaUrls, setMediaUrls] =
    useState<MediaUrls>(initialMediaUrls);

  const [previewUrls, setPreviewUrls] =
    useState<Partial<MediaUrls>>({});

  const previewUrlsRef = useRef<Partial<MediaUrls>>({});

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Cleanup temporary object URLs when component unmounts.
  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Load existing Contact Us content from Laravel.
  useEffect(() => {
    const loadContactPage = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data: ContactPageData = await getContactPage();

        setFormData({
          banner_image: null,
          heading_one: data.heading_one ?? "",
          heading_two: data.heading_two ?? "",
          heading_highlight: data.heading_highlight ?? "",
          connect_with_us: data.connect_with_us ?? "",
          connect_with_us_supporting_text:
            data.connect_with_us_supporting_text ?? "",
          connect_with_us_image_one: null,
          connect_with_us_image_two: null,
          subtitle_one: data.subtitle_one ?? "",
          subtitle_two: data.subtitle_two ?? "",
          send_us_message_text: data.send_us_message_text ?? "",
          until_we_meet_text: data.until_we_meet_text ?? "",
          until_we_meet_video: null,
        });

        setMediaUrls({
          banner_image: data.banner_image ?? null,
          connect_with_us_image_one:
            data.connect_with_us_image_one ?? null,
          connect_with_us_image_two:
            data.connect_with_us_image_two ?? null,
          until_we_meet_video: data.until_we_meet_video ?? null,
        });
      } catch (error: unknown) {
        console.error("Contact page loading error:", error);

        setErrorMessage(
          getErrorMessage(error, "Failed to load Contact Us content.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadContactPage();
  }, []);

  const handleChange = (
    field: TextField,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image and video uploads.
  const handleFileChange = (
    field: MediaField,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isVideo = field === "until_we_meet_video";

    if (isVideo) {
      const allowedVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ];

      const validExtension = /\.(mp4|webm|mov)$/i.test(file.name);

      if (
        !allowedVideoTypes.includes(file.type) &&
        !validExtension
      ) {
        alert("Only MP4, WebM and MOV videos are allowed.");
        event.target.value = "";
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert("Maximum video size allowed is 50 MB.");
        event.target.value = "";
        return;
      }
    } else {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedImageTypes.includes(file.type)) {
        alert("Only JPG, JPEG, PNG and WebP images are allowed.");
        event.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Maximum image size allowed is 5 MB.");
        event.target.value = "";
        return;
      }
    }

    // Revoke previous temporary preview URL.
    const previousUrl = previewUrlsRef.current[field];

    if (previousUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    previewUrlsRef.current[field] = newPreviewUrl;

    setPreviewUrls((prev) => ({
      ...prev,
      [field]: newPreviewUrl,
    }));

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    setErrorMessage("");
    setSuccessMessage("");

    // Allow selecting the same file again.
    event.target.value = "";
  };

  // Remove temporary preview after successful save.
  const clearTemporaryPreviews = () => {
    Object.values(previewUrlsRef.current).forEach((url) => {
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    previewUrlsRef.current = {};
    setPreviewUrls({});
  };

  // Save Contact Us content.
  const handleSave = async () => {
    try {
      setUploading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = new FormData();

      // Append all text fields.
      textFields.forEach((field) => {
        payload.append(field, formData[field]);
      });

      // Append only newly selected media files.
      const mediaFields: MediaField[] = [
        "banner_image",
        "connect_with_us_image_one",
        "connect_with_us_image_two",
        "until_we_meet_video",
      ];

      mediaFields.forEach((field) => {
        const file = formData[field];

        if (file instanceof File) {
          payload.append(field, file);
        }
      });

      const updatedData: ContactPageData =
        await updateContactPage(payload);

      // Update media URLs returned by Laravel.
      setMediaUrls({
        banner_image: updatedData.banner_image ?? null,
        connect_with_us_image_one:
          updatedData.connect_with_us_image_one ?? null,
        connect_with_us_image_two:
          updatedData.connect_with_us_image_two ?? null,
        until_we_meet_video:
          updatedData.until_we_meet_video ?? null,
      });

      // Reset selected files after successful upload.
      setFormData((prev) => ({
        ...prev,
        banner_image: null,
        connect_with_us_image_one: null,
        connect_with_us_image_two: null,
        until_we_meet_video: null,
      }));

      clearTemporaryPreviews();

      setSuccessMessage("Contact Us content updated successfully.");

    } catch (error: unknown) {
      console.error("Contact page update error:", error);

      setErrorMessage(
        getErrorMessage(error, "Failed to update Contact Us content.")
      );
    } finally {
      setUploading(false);
    }
  };

  // Extract Laravel/Axios error message.
  function getErrorMessage(
    error: unknown,
    fallback: string
  ): string {
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

    return (
      responseData?.message ||
      axiosError.message ||
      fallback
    );
  }

  const renderInput = (
    label: string,
    field: TextField,
    placeholder: string
  ) => (
    <div>
      <label className={labelClass}>{label}</label>

      <input
        type="text"
        value={formData[field]}
        onChange={(event) =>
          handleChange(field, event.target.value)
        }
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  const renderTextarea = (
    label: string,
    field: TextField,
    placeholder: string,
    rows = 4
  ) => (
    <div>
      <label className={labelClass}>{label}</label>

      <textarea
        value={formData[field]}
        onChange={(event) =>
          handleChange(field, event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
    </div>
  );

  // Reusable image/video upload component.
  const renderFileUpload = (
    label: string,
    field: MediaField,
    accept: string
  ) => {
    const isVideo = field === "until_we_meet_video";

    const selectedFile = formData[field];

    const previewUrl =
      previewUrls[field] || mediaUrls[field];

    const fileSizeLimit = isVideo ? "50 MB" : "5 MB";

    return (
      <div>
        <label className={labelClass}>{label}</label>

        <div className="rounded-2xl border border-[#E8DFD0] bg-white p-5 shadow-sm">

          {/* Media Preview */}
          <div className="relative overflow-hidden rounded-xl border border-[#E8DFD0] bg-[#FAF7F2]">

            {previewUrl ? (
              isVideo ? (
                <video
                  key={previewUrl}
                  src={previewUrl}
                  controls
                  className="h-56 w-full bg-black object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={`${label} Preview`}
                  className="h-56 w-full object-cover"
                />
              )
            ) : (
              <div className="flex h-56 flex-col items-center justify-center">
                {isVideo ? (
                  <Video className="mb-3 h-12 w-12 text-[#C8BC82]" />
                ) : (
                  <Image className="mb-3 h-12 w-12 text-[#C8BC82]" />
                )}

                <p className="text-sm font-medium text-[#51483F]">
                  No {isVideo ? "video" : "image"} selected
                </p>

                <p className="mt-1 text-xs text-[#A49A8E]">
                  Your {isVideo ? "video" : "image"} preview will appear here
                </p>
              </div>
            )}
          </div>

          {/* Upload Information */}
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="min-w-0">
              {selectedFile ? (
                <>
                  <p className="truncate text-sm font-semibold text-[#332C26]">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-[#8A8075]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#332C26]">
                    {previewUrl
                      ? `Current ${isVideo ? "video" : "image"}`
                      : `Upload ${label.toLowerCase()}`}
                  </p>

                  <p className="mt-1 text-xs text-[#8A8075]">
                    Choose a {isVideo ? "video" : "new image"} for this section.
                  </p>
                </>
              )}
            </div>

            <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#8FAA42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#788F36]">
              <Upload className="h-4 w-4" />

              {selectedFile
                ? isVideo
                  ? "Change Video"
                  : "Change Image"
                : isVideo
                  ? "Choose Video"
                  : "Choose Image"}

              <input
                type="file"
                accept={accept}
                onChange={(event) =>
                  handleFileChange(field, event)
                }
                className="hidden"
              />
            </label>
          </div>

          {/* File Size Note */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#FAF7F2] p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A58B45]" />

            <p className="text-xs leading-relaxed text-[#6E655C]">
              Maximum file size: <strong>{fileSizeLimit}</strong>.
              {isVideo
                ? " Supported formats: MP4, WebM and MOV."
                : " Supported formats: JPG, JPEG, PNG and WebP."}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
              "image/jpeg,image/png,image/webp"
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
                "image/jpeg,image/png,image/webp"
              )}

              {renderFileUpload(
                "Image Two",
                "connect_with_us_image_two",
                "image/jpeg,image/png,image/webp"
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
              "video/mp4,video/webm,video/quicktime,.mov"
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

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm text-[#82776B]">
                Loading Contact Us content...
              </p>
            </div>
          ) : (
            <>
              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {renderTabContent()}

              {/* Footer */}
              <div className="mt-9 flex justify-end border-t border-[#EDE4D8] pt-5">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8FAA42] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#718A38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactUsSection;
