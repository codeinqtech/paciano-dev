import { useEffect, useState } from "react";
import { Save } from "@/components/common/icons";

import {
  getContactPage,
  updateContactPage,
  type ContactPageData,
} from "@/admin/services/contactPageService";

import ContactPageTabs from "./ContactPageTabs";
import ContactBannerSection from "./ContactBannerSection";
import ContactConnectSection from "./ContactConnectSection";
import ContactSubtitleSection from "./ContactSubtitleSection";
import ContactMessageSection from "./ContactMessageSection";
import ContactVideoSection from "./ContactVideoSection";
import ContactDetailsSection from "./ContactDetailsSection";

import {
  contactTextFields,
  initialContactFormData,
  initialContactImageFiles,
  initialContactMediaUrls,
} from "./contact.constants";

import type {
  ContactFormData,
  ContactImageField,
  ContactTabId,
} from "./contact.types";

const AdminContactUsSection = () => {
  const [activeTab, setActiveTab] = useState<ContactTabId>("banner");
  const [formData, setFormData] =
    useState<ContactFormData>(initialContactFormData);
  const [mediaUrls, setMediaUrls] = useState(initialContactMediaUrls);
  const [imageFiles, setImageFiles] =
    useState(initialContactImageFiles);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadContactPage = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data: ContactPageData = await getContactPage();

        const loadedForm: ContactFormData = {
          heading_one: data.heading_one ?? "",
          heading_two: data.heading_two ?? "",
          heading_highlight: data.heading_highlight ?? "",
          connect_with_us: data.connect_with_us ?? "",
          connect_with_us_supporting_text:
            data.connect_with_us_supporting_text ?? "",
          subtitle_one: data.subtitle_one ?? "",
          subtitle_two: data.subtitle_two ?? "",
          send_us_message_text: data.send_us_message_text ?? "",
          until_we_meet_text: data.until_we_meet_text ?? "",
        };

        setFormData(loadedForm);
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
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleImageChange = (
    field: ContactImageField,
    file: File | null
  ) => {
    setImageFiles((prev) => ({ ...prev, [field]: file }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = new FormData();

      contactTextFields.forEach((field) => {
        payload.append(field, formData[field]);
      });

      (Object.keys(imageFiles) as ContactImageField[]).forEach((field) => {
        const file = imageFiles[field];
        if (file) payload.append(field, file);
      });

      if (videoFile) {
        payload.append("until_we_meet_video", videoFile);
      }

      const updatedData: ContactPageData =
        await updateContactPage(payload);

      setMediaUrls({
        banner_image: updatedData.banner_image ?? null,
        connect_with_us_image_one:
          updatedData.connect_with_us_image_one ?? null,
        connect_with_us_image_two:
          updatedData.connect_with_us_image_two ?? null,
        until_we_meet_video: updatedData.until_we_meet_video ?? null,
      });

      setImageFiles(initialContactImageFiles);
      setVideoFile(null);
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
      if (firstError?.length) return firstError[0];
    }

    return responseData?.message || axiosError.message || fallback;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "banner":
        return (
          <ContactBannerSection
            formData={formData}
            mediaUrls={mediaUrls}
            imageFile={imageFiles.banner_image}
            onChange={handleChange}
            onImageChange={(file) =>
              handleImageChange("banner_image", file)
            }
          />
        );

      case "connect":
        return (
          <ContactConnectSection
            formData={formData}
            mediaUrls={mediaUrls}
            imageOneFile={imageFiles.connect_with_us_image_one}
            imageTwoFile={imageFiles.connect_with_us_image_two}
            onChange={handleChange}
            onImageOneChange={(file) =>
              handleImageChange("connect_with_us_image_one", file)
            }
            onImageTwoChange={(file) =>
              handleImageChange("connect_with_us_image_two", file)
            }
          />
        );

      case "subtitle":
        return (
          <ContactSubtitleSection
            formData={formData}
            onChange={handleChange}
          />
        );

      case "message":
        return (
          <ContactMessageSection
            formData={formData}
            onChange={handleChange}
          />
        );

      case "video":
        return (
          <ContactVideoSection
            formData={formData}
            mediaUrls={mediaUrls}
            videoFile={videoFile}
            onChange={handleChange}
            onVideoChange={(file) => {
              setVideoFile(file);
              setErrorMessage("");
              setSuccessMessage("");
            }}
          />
        );

      case "details":
        return <ContactDetailsSection />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1400px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-page-title">Contact Us</h1>
          <p className="mt-2 text-sm text-[#82776B]">
            Manage your contact page content and information.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E8DFD0] bg-white">
        <ContactPageTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="bg-white p-5 md:p-8">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm text-[#82776B]">
                Loading Contact Us content...
              </p>
            </div>
          ) : (
            <>
              {successMessage && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {renderTabContent()}

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
